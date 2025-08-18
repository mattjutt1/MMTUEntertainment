/**
 * Security Utilities
 */

/**
 * Validate webhook signature using HMAC-SHA256
 */
export async function validateSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    return false;
  }

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

  // Support both GitHub (sha256=...) and Stripe (hex) formats
  const providedSignature = signature.startsWith('sha256=') 
    ? signature.slice(7) 
    : signature;

  return computedHex === providedSignature;
}

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;&|`$()]/g, '') // Remove shell metacharacters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate repository name format
 */
export function validateRepositoryName(name: string): boolean {
  // GitHub repository name rules:
  // - Can contain alphanumeric characters and hyphens
  // - Cannot start or end with hyphen
  // - Cannot contain consecutive hyphens
  // - Must be 1-100 characters
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return pattern.test(name) && name.length <= 100 && !name.includes('--');
}

/**
 * Validate GitHub username format
 */
export function validateGitHubUsername(username: string): boolean {
  // GitHub username rules:
  // - Can contain alphanumeric characters and hyphens
  // - Cannot start or end with hyphen
  // - Cannot have consecutive hyphens
  // - Must be 1-39 characters
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return pattern.test(username) && username.length <= 39 && !username.includes('--');
}

/**
 * Validate SHA commit hash
 */
export function validateSHA(sha: string): boolean {
  // Git SHA-1 hash: 40 hexadecimal characters
  return /^[a-f0-9]{40}$/i.test(sha);
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Basic input validation for API endpoints
 */
export function validateApiInput(input: any, schema: Record<string, any>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];

    if (rules.required && (value === undefined || value === null)) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`Field '${field}' must be of type ${rules.type}`);
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`Field '${field}' must be at most ${rules.maxLength} characters`);
      }

      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`Field '${field}' has invalid format`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}