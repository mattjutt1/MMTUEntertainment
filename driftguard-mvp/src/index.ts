/**
 * DriftGuard Checks MVP - Universal GitHub Check Run Aggregation
 * Cloudflare Workers implementation with CTRF support
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PostHog } from 'posthog-node';
import { handleCTRFIngestion } from './handlers/ctrf';
import { handleGitHubWebhook } from './handlers/github';
import { handleStripeWebhook } from './handlers/stripe';
import { handleDashboard } from './handlers/dashboard';
import { cors, jsonResponse, errorResponse } from './utils/response';
import { validateSignature } from './utils/security';
import { rateLimiter } from './utils/rateLimit';

export interface Env {
  // Cloudflare Workers bindings
  CACHE: KVNamespace;
  DB: D1Database;
  ARTIFACTS?: R2Bucket; // Optional - R2 may not be enabled
  
  // Environment variables
  GITHUB_APP_ID: string;
  GITHUB_PRIVATE_KEY: string;
  GITHUB_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  POSTHOG_API_KEY: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS preflight handling
    if (request.method === 'OPTIONS') {
      return cors();
    }

    const url = new URL(request.url);
    const { pathname } = url;

    try {
      // Health check endpoint
      if (pathname === '/health') {
        return jsonResponse({ status: 'healthy', timestamp: new Date().toISOString() });
      }

      // Debug endpoint for testing GitHub App authentication
      if (pathname === '/debug/github' && request.method === 'GET') {
        try {
          const { getInstallationIdForRepository, generateGitHubAppJWT, authenticateGitHubApp } = await import('./utils/github');
          
          // Test JWT generation
          const jwt = await generateGitHubAppJWT(env);
          
          // Test JWT by making a direct API call
          const jwtTestResponse = await fetch('https://api.github.com/app', {
            headers: {
              'Authorization': `Bearer ${jwt}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'DriftGuard-Checks/1.0',
            },
          });
          
          const jwtTestResult = await jwtTestResponse.text();
          
          return jsonResponse({
            success: jwtTestResponse.ok,
            jwt: jwt ? `JWT: ${jwt.substring(0, 50)}...` : 'JWT generation failed',
            jwtTest: {
              status: jwtTestResponse.status,
              result: jwtTestResult.substring(0, 200),
            },
          });
        } catch (error) {
          return jsonResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          }, 500);
        }
      }

      // Rate limiting for all API endpoints
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitResult = await rateLimiter(env.CACHE, clientIP);
      if (!rateLimitResult.allowed) {
        return errorResponse('Rate limit exceeded', 429, {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        });
      }

      // Initialize services
      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
        // Use default fetch for Cloudflare Workers compatibility
      });

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: fetch.bind(globalThis) },
      });

      const posthog = new PostHog(env.POSTHOG_API_KEY, {
        host: 'https://app.posthog.com',
        flushAt: 1,
        flushInterval: 0,
      });

      // Route handling
      switch (pathname) {
        case '/api/ctrf/ingest':
          if (request.method !== 'POST') {
            return errorResponse('Method not allowed', 405);
          }
          return await handleCTRFIngestion(request, env, { supabase, posthog });

        case '/api/github/webhook':
          if (request.method !== 'POST') {
            return errorResponse('Method not allowed', 405);
          }
          return await handleGitHubWebhook(request, env, { supabase, posthog });

        case '/api/stripe/webhook':
          if (request.method !== 'POST') {
            return errorResponse('Method not allowed', 405);
          }
          return await handleStripeWebhook(request, env, { stripe, supabase, posthog });

        case '/dashboard':
        case '/':
          return await handleDashboard(request, env, { supabase });

        default:
          return errorResponse('Not found', 404);
      }

    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('Internal server error', 500);
    }
  },
};