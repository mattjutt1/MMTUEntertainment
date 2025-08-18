/**
 * CTRF Ingestion Handler
 * Processes CTRF test reports and posts GitHub check runs
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import type { Env } from '../index';
import { CTRFReport, validateCTRFReport, ctrfToCheckRun } from '../types/ctrf';
import { jsonResponse, errorResponse } from '../utils/response';
import { authenticateGitHubApp, getInstallationIdForRepository } from '../utils/github';

interface CTRFIngestionRequest {
  ctrf: CTRFReport;
  repository: {
    owner: string;
    repo: string;
    sha: string;
    installationId?: number; // Made optional - will auto-lookup if not provided
  };
  metadata?: {
    pullRequestNumber?: number;
    branchName?: string;
    buildUrl?: string;
    buildNumber?: string;
  };
}

export async function handleCTRFIngestion(
  request: Request,
  env: Env,
  services: { supabase: any; posthog: any }
): Promise<Response> {
  try {
    const body = await request.json() as CTRFIngestionRequest;

    // Validate request structure
    if (!body.ctrf || !body.repository) {
      return errorResponse('Missing required fields: ctrf, repository', 400);
    }

    const { ctrf, repository, metadata } = body;

    // Validate CTRF report format
    const validation = validateCTRFReport(ctrf);
    if (!validation.valid) {
      return errorResponse('Invalid CTRF format', 400, {}, {
        errors: validation.errors,
        documentation: 'https://ctrf.io/docs/intro'
      });
    }

    // Get installation ID (auto-lookup if not provided)
    let installationId = repository.installationId;
    if (!installationId) {
      // Check cache first to avoid repeated lookups
      const cacheKey = `installation:${repository.owner}:${repository.repo}`;
      const cachedInstallationId = await env.CACHE.get(cacheKey);
      
      if (cachedInstallationId) {
        installationId = parseInt(cachedInstallationId);
      } else {
        // Auto-lookup installation ID
        installationId = await getInstallationIdForRepository(env, repository.owner, repository.repo);
        
        // Cache for 1 hour to avoid repeated lookups
        await env.CACHE.put(cacheKey, installationId.toString(), { expirationTtl: 3600 });
      }
    }

    // Authenticate with GitHub App
    const octokit = await authenticateGitHubApp(env, installationId);

    // Convert CTRF to GitHub Check Run format
    const checkRunData = ctrfToCheckRun(ctrf, repository);

    // Create GitHub Check Run
    const checkRun = await octokit.rest.checks.create({
      ...checkRunData,
      owner: repository.owner,
      repo: repository.repo,
    });

    // Store CTRF report in R2 for audit purposes (optional)
    let reportKey = null;
    if (env.ARTIFACTS) {
      try {
        reportKey = `reports/${repository.owner}/${repository.repo}/${repository.sha}/${ctrf.results.tool.name}-${Date.now()}.json`;
        await env.ARTIFACTS.put(reportKey, JSON.stringify(ctrf, null, 2), {
          httpMetadata: {
            contentType: 'application/json',
          },
          customMetadata: {
            owner: repository.owner,
            repo: repository.repo,
            sha: repository.sha,
            tool: ctrf.results.tool.name,
            status: ctrf.status,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.warn('R2 storage unavailable, skipping artifact storage:', error);
        reportKey = null;
      }
    }

    // Log to database for analytics
    await services.supabase
      .from('check_runs')
      .insert({
        github_check_run_id: checkRun.data.id,
        repository_owner: repository.owner,
        repository_name: repository.repo,
        commit_sha: repository.sha,
        tool_name: ctrf.results.tool.name,
        tool_version: ctrf.results.tool.version,
        status: ctrf.status,
        test_count: ctrf.results.summary.tests,
        passed_count: ctrf.results.summary.passed,
        failed_count: ctrf.results.summary.failed,
        duration_ms: ctrf.duration,
        report_url: reportKey,
        created_at: new Date().toISOString(),
        metadata: metadata || {},
      });

    // Track analytics event
    services.posthog.capture({
      distinctId: `${repository.owner}/${repository.repo}`,
      event: 'ctrf_report_processed',
      properties: {
        repository: `${repository.owner}/${repository.repo}`,
        tool: ctrf.results.tool.name,
        status: ctrf.status,
        test_count: ctrf.results.summary.tests,
        failed_count: ctrf.results.summary.failed,
        duration_ms: ctrf.duration,
        has_metadata: !!metadata,
      },
    });

    // Cache check run ID for potential updates
    const cacheKey = `checkrun:${repository.owner}:${repository.repo}:${repository.sha}:${ctrf.results.tool.name}`;
    await env.CACHE.put(cacheKey, checkRun.data.id.toString(), { expirationTtl: 86400 }); // 24 hours

    return jsonResponse({
      success: true,
      checkRun: {
        id: checkRun.data.id,
        url: checkRun.data.html_url,
        name: checkRun.data.name,
        status: checkRun.data.status,
        conclusion: checkRun.data.conclusion,
      },
      report: {
        tool: ctrf.results.tool.name,
        status: ctrf.status,
        tests: ctrf.results.summary.tests,
        passed: ctrf.results.summary.passed,
        failed: ctrf.results.summary.failed,
        duration: ctrf.duration,
      },
      storage: {
        reportUrl: reportKey || 'R2 storage unavailable',
        cached: true,
        r2Enabled: !!reportKey,
      },
    });

  } catch (error) {
    console.error('CTRF ingestion error:', error);
    
    // Extract detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    // Track error event with more details
    services.posthog.capture({
      distinctId: 'system',
      event: 'ctrf_ingestion_error',
      properties: {
        error: errorMessage,
        stack: errorStack,
        repository: `${repository.owner}/${repository.repo}`,
        sha: repository.sha,
        timestamp: new Date().toISOString(),
      },
    });

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return errorResponse('GitHub API rate limit exceeded', 429);
      }
      if (error.message.includes('Not Found')) {
        return errorResponse('Repository not found or insufficient permissions', 404);
      }
      if (error.message.includes('No GitHub App installation found')) {
        return errorResponse(`GitHub App not installed for repository ${repository.owner}/${repository.repo}. Please install the DriftGuard GitHub App.`, 403, {}, {
          installUrl: `https://github.com/apps/driftguard-mmtu/installations/new`,
          repository: `${repository.owner}/${repository.repo}`
        });
      }
      
      // Return specific error message for debugging in development
      if (env.ENVIRONMENT === 'development') {
        return errorResponse(`CTRF Processing Error: ${errorMessage}`, 500, {}, {
          error: errorMessage,
          stack: errorStack
        });
      }
    }

    return errorResponse('Failed to process CTRF report', 500);
  }
}

/**
 * Update existing check run with new CTRF data
 */
export async function updateCheckRun(
  env: Env,
  installationId: number,
  repository: { owner: string; repo: string; sha: string },
  ctrf: CTRFReport
): Promise<void> {
  const cacheKey = `checkrun:${repository.owner}:${repository.repo}:${repository.sha}:${ctrf.results.tool.name}`;
  const existingCheckRunId = await env.CACHE.get(cacheKey);

  if (!existingCheckRunId) {
    throw new Error('No existing check run found for update');
  }

  const octokit = await authenticateGitHubApp(env, installationId);
  const checkRunData = ctrfToCheckRun(ctrf, repository);

  await octokit.rest.checks.update({
    owner: repository.owner,
    repo: repository.repo,
    check_run_id: parseInt(existingCheckRunId),
    status: 'completed',
    conclusion: checkRunData.conclusion,
    output: checkRunData.output,
  });
}