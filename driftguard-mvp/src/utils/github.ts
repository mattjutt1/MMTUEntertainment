/**
 * GitHub App Authentication and Utilities
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
// Removed jsonwebtoken import - using Web Crypto API instead
import type { Env } from '../index';

/**
 * Create authenticated Octokit instance for GitHub App using our custom JWT
 */
export async function authenticateGitHubApp(env: Env, installationId: number): Promise<Octokit> {
  // Get installation access token using our custom JWT
  const installationToken = await getInstallationToken(env, installationId);
  
  // Create Octokit instance with the installation token
  const octokit = new Octokit({
    auth: installationToken,
  });

  return octokit;
}

/**
 * Generate GitHub App JWT for API authentication using Web Crypto API
 */
export async function generateGitHubAppJWT(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 600, // 10 minutes
    iss: env.GITHUB_APP_ID,
  };

  // JWT Header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  // Base64URL encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  // Convert PEM private key to CryptoKey
  const privateKey = await importPrivateKey(env.GITHUB_PRIVATE_KEY);

  // Sign the data
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(data)
  );

  // Base64URL encode signature
  const encodedSignature = base64UrlEncode(signature);

  return `${data}.${encodedSignature}`;
}

/**
 * Base64URL encode (without padding)
 */
function base64UrlEncode(data: string | ArrayBuffer): string {
  let str: string;
  if (typeof data === 'string') {
    str = btoa(unescape(encodeURIComponent(data)));
  } else {
    str = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Import PEM private key as CryptoKey (handles both PKCS#1 and PKCS#8)
 */
async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  // Check if it's PKCS#1 or PKCS#8
  const isPKCS1 = pemKey.includes('-----BEGIN RSA PRIVATE KEY-----');
  
  // Remove PEM header/footer and whitespace
  const pemContents = pemKey
    .replace(/-----BEGIN [A-Z ]+-----/, '')
    .replace(/-----END [A-Z ]+-----/, '')
    .replace(/\s/g, '');

  // Convert base64 to ArrayBuffer
  const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  try {
    // Try PKCS#8 first
    return await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
  } catch (error) {
    // If PKCS#8 fails and it's PKCS#1, try alternative approach
    if (isPKCS1) {
      // For PKCS#1, we need to parse the DER structure manually
      // This is a simplified approach - in production you'd use a proper ASN.1 parser
      throw new Error('PKCS#1 private key detected. Please convert to PKCS#8 format using: openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.pem');
    }
    throw error;
  }
}

/**
 * Get installation access token
 */
export async function getInstallationToken(env: Env, installationId: number): Promise<string> {
  const jwtToken = await generateGitHubAppJWT(env);
  
  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DriftGuard-Checks/1.0',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installation token: ${response.status} - ${error}`);
  }

  const data = await response.json() as { token: string; expires_at: string };
  return data.token;
}

/**
 * Verify GitHub webhook signature
 */
export async function verifyGitHubWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  // Extract signature from GitHub format: "sha256=..."
  const signatureBuffer = signature.replace('sha256=', '');
  
  // Create HMAC signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const computedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const computedHex = Array.from(new Uint8Array(computedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHex === signatureBuffer;
}

/**
 * Rate limit tracker for GitHub API
 */
export class GitHubRateLimiter {
  private cache: KVNamespace;
  
  constructor(cache: KVNamespace) {
    this.cache = cache;
  }

  async checkRateLimit(installationId: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `github_rate_limit:${installationId}`;
    const cached = await this.cache.get(key, 'json') as {
      remaining: number;
      resetTime: number;
    } | null;

    const now = Date.now();
    
    if (!cached || now > cached.resetTime) {
      // Reset rate limit window (GitHub allows 5000 requests per hour)
      const resetTime = now + 3600000; // 1 hour from now
      await this.cache.put(key, JSON.stringify({
        remaining: 4999, // Leave one request for the current call
        resetTime,
      }), { expirationTtl: 3600 });
      
      return { allowed: true, remaining: 4999, resetTime };
    }

    if (cached.remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: cached.resetTime,
      };
    }

    // Decrement remaining requests
    const updated = {
      remaining: cached.remaining - 1,
      resetTime: cached.resetTime,
    };

    await this.cache.put(key, JSON.stringify(updated), {
      expirationTtl: Math.ceil((cached.resetTime - now) / 1000),
    });

    return { allowed: true, ...updated };
  }
}

/**
 * Parse GitHub webhook payload type
 */
export function parseGitHubWebhookEvent(headers: Headers): {
  event: string | null;
  delivery: string | null;
} {
  return {
    event: headers.get('x-github-event'),
    delivery: headers.get('x-github-delivery'),
  };
}

/**
 * Get installation ID for a specific repository
 */
export async function getInstallationIdForRepository(
  env: Env, 
  owner: string, 
  repo: string
): Promise<number> {
  const jwtToken = await generateGitHubAppJWT(env);
  
  // Get all installations for this GitHub App
  const installationsResponse = await fetch('https://api.github.com/app/installations', {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DriftGuard-Checks/1.0',
    },
  });

  if (!installationsResponse.ok) {
    const error = await installationsResponse.text();
    throw new Error(`Failed to get installations: ${installationsResponse.status} - ${error}`);
  }

  const installations = await installationsResponse.json() as Array<{
    id: number;
    account: { login: string };
  }>;

  // Check each installation to find the one with access to the target repository
  for (const installation of installations) {
    try {
      // Get installation access token
      const tokenResponse = await fetch(`https://api.github.com/app/installations/${installation.id}/access_tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DriftGuard-Checks/1.0',
        },
      });

      if (!tokenResponse.ok) continue;

      const tokenData = await tokenResponse.json() as { token: string };

      // Check if this installation has access to the target repository
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${tokenData.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DriftGuard-Checks/1.0',
        },
      });

      if (repoResponse.ok) {
        return installation.id;
      }
    } catch (error) {
      // Continue to next installation if this one fails
      continue;
    }
  }

  throw new Error(`No GitHub App installation found for repository ${owner}/${repo}`);
}

/**
 * Extract repository information from GitHub webhook
 */
export function extractRepositoryInfo(payload: any): {
  owner: string;
  repo: string;
  installationId: number;
} | null {
  if (!payload.repository || !payload.installation) {
    return null;
  }

  return {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    installationId: payload.installation.id,
  };
}