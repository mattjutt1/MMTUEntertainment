/**
 * Enhanced validation utilities for bulletproof CTRF processing
 * Handles edge cases: empty arrays, unicode content, payload size limits
 */

export interface PayloadValidationResult {
  valid: boolean;
  error?: string;
  size: number;
  compressed?: boolean;
}

export interface UnicodeValidationResult {
  sanitized: string;
  hadIssues: boolean;
  originalLength: number;
  sanitizedLength: number;
}

/**
 * Validates payload size and applies compression if needed
 */
export async function validatePayloadSize(
  request: Request,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): Promise<PayloadValidationResult> {
  try {
    // Check content-length header first
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSize) {
        return {
          valid: false,
          error: `Payload size ${formatBytes(size)} exceeds maximum allowed size ${formatBytes(maxSize)}`,
          size,
        };
      }
    }

    // Read body and check actual size
    const body = await request.text();
    const actualSize = new Blob([body]).size;

    if (actualSize > maxSize) {
      return {
        valid: false,
        error: `Payload size ${formatBytes(actualSize)} exceeds maximum allowed size ${formatBytes(maxSize)}`,
        size: actualSize,
      };
    }

    return {
      valid: true,
      size: actualSize,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate payload size: ${error instanceof Error ? error.message : 'Unknown error'}`,
      size: 0,
    };
  }
}

/**
 * Safely parse JSON with enhanced error handling
 */
export function safeJsonParse(jsonString: string): { success: boolean; data?: any; error?: string } {
  try {
    // Basic JSON structure validation
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: 'Invalid input: must be a non-empty string' };
    }

    // Trim whitespace
    const trimmed = jsonString.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return { success: false, error: 'Invalid JSON: must start with { or [' };
    }

    const data = JSON.parse(trimmed);
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parsing error';
    return { 
      success: false, 
      error: `JSON parsing failed: ${errorMessage}` 
    };
  }
}

/**
 * Sanitize unicode content for safe processing
 */
export function sanitizeUnicodeContent(content: string | null | undefined): UnicodeValidationResult {
  if (!content || typeof content !== 'string') {
    return {
      sanitized: content || '',
      hadIssues: false,
      originalLength: 0,
      sanitizedLength: 0,
    };
  }

  const originalLength = content.length;
  let sanitized = content;
  let hadIssues = false;

  try {
    // Remove or replace problematic unicode characters
    // Keep most unicode but remove control characters and invalid sequences
    sanitized = content
      // Remove null bytes and other control characters (except common ones like \n, \t)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Replace invalid surrogate pairs
      .replace(/[\uD800-\uDFFF]/g, (match, offset, string) => {
        const code = match.charCodeAt(0);
        // Only keep valid surrogate pairs
        if (code >= 0xD800 && code <= 0xDBFF) {
          const next = string.charCodeAt(offset + 1);
          if (next >= 0xDC00 && next <= 0xDFFF) {
            return match; // Valid surrogate pair
          }
        }
        hadIssues = true;
        return ''; // Remove invalid surrogate
      })
      // Normalize unicode to NFC form for consistency
      .normalize('NFC');

    // Check if content changed
    if (sanitized !== content) {
      hadIssues = true;
    }

    // Validate that the sanitized content is valid UTF-8
    try {
      // Attempt to encode/decode to validate UTF-8
      const encoded = new TextEncoder().encode(sanitized);
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(encoded);
      if (decoded !== sanitized) {
        hadIssues = true;
      }
    } catch {
      // If encoding/decoding fails, fall back to ASCII-safe version
      sanitized = sanitized.replace(/[^\x20-\x7E\n\t\r]/g, '?');
      hadIssues = true;
    }

    return {
      sanitized,
      hadIssues,
      originalLength,
      sanitizedLength: sanitized.length,
    };
  } catch (error) {
    // Fallback: create ASCII-safe version
    const asciiSafe = content.replace(/[^\x20-\x7E\n\t\r]/g, '?');
    return {
      sanitized: asciiSafe,
      hadIssues: true,
      originalLength,
      sanitizedLength: asciiSafe.length,
    };
  }
}

/**
 * Validate array consistency in CTRF reports
 */
export function validateArrayConsistency(
  summary: { tests: number; passed: number; failed: number; pending: number; skipped: number },
  tests: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if arrays are properly defined
  if (!Array.isArray(tests)) {
    errors.push('Tests must be an array');
    return { valid: false, errors };
  }

  // Check count consistency
  if (summary.tests !== tests.length) {
    errors.push(`Summary tests count (${summary.tests}) doesn't match tests array length (${tests.length})`);
  }

  // Count actual test statuses
  const actualCounts = {
    passed: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
    other: 0,
  };

  tests.forEach((test, index) => {
    if (!test || typeof test !== 'object') {
      errors.push(`Test at index ${index} is not a valid object`);
      return;
    }

    const status = test.status;
    if (typeof status === 'string' && status in actualCounts) {
      actualCounts[status as keyof typeof actualCounts]++;
    } else {
      actualCounts.other++;
    }
  });

  // Validate count matches
  if (summary.passed !== actualCounts.passed) {
    errors.push(`Summary passed count (${summary.passed}) doesn't match actual passed tests (${actualCounts.passed})`);
  }
  if (summary.failed !== actualCounts.failed) {
    errors.push(`Summary failed count (${summary.failed}) doesn't match actual failed tests (${actualCounts.failed})`);
  }
  if (summary.pending !== actualCounts.pending) {
    errors.push(`Summary pending count (${summary.pending}) doesn't match actual pending tests (${actualCounts.pending})`);
  }
  if (summary.skipped !== actualCounts.skipped) {
    errors.push(`Summary skipped count (${summary.skipped}) doesn't match actual skipped tests (${actualCounts.skipped})`);
  }

  // Handle edge case: empty arrays
  if (tests.length === 0) {
    if (summary.tests !== 0 || summary.passed !== 0 || summary.failed !== 0 || summary.pending !== 0 || summary.skipped !== 0) {
      errors.push('Empty tests array requires all summary counts to be 0');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Compress large payloads if needed
 */
export async function compressIfNeeded(
  data: string,
  threshold: number = 1024 * 1024 // 1MB threshold
): Promise<{ compressed: boolean; data: string; originalSize: number; compressedSize: number }> {
  const originalSize = new Blob([data]).size;
  
  if (originalSize <= threshold) {
    return {
      compressed: false,
      data,
      originalSize,
      compressedSize: originalSize,
    };
  }

  try {
    // Use gzip compression via CompressionStream (available in Cloudflare Workers)
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Write data to compression stream
    writer.write(new TextEncoder().encode(data));
    writer.close();

    // Read compressed data
    const chunks: Uint8Array[] = [];
    let result;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const compressed = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64 for JSON transport
    const compressedB64 = btoa(String.fromCharCode(...compressed));
    
    return {
      compressed: true,
      data: compressedB64,
      originalSize,
      compressedSize: compressed.length,
    };
  } catch (error) {
    // Fallback: return original data if compression fails
    console.warn('Compression failed, using original data:', error);
    return {
      compressed: false,
      data,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

/**
 * Format bytes for human-readable display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Unicode-safe base64 encoding
 */
export function unicodeSafeBase64Encode(data: string | ArrayBuffer): string {
  try {
    let str: string;
    if (typeof data === 'string') {
      // Ensure proper UTF-8 encoding
      const encoded = new TextEncoder().encode(data);
      str = btoa(String.fromCharCode(...encoded));
    } else {
      str = btoa(String.fromCharCode(...new Uint8Array(data)));
    }
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    throw new Error(`Unicode-safe base64 encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}