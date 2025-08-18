/**
 * Rate Limiting Utilities
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Simple rate limiter using KV storage
 */
export async function rateLimiter(
  cache: KVNamespace,
  identifier: string,
  limit = 100,
  windowMs = 3600000 // 1 hour
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get current rate limit data
  const cached = await cache.get(key, 'json') as {
    requests: number[];
  } | null;

  let requests = cached?.requests || [];

  // Filter out requests outside the current window
  requests = requests.filter(timestamp => timestamp > windowStart);

  if (requests.length >= limit) {
    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + windowMs;

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetTime,
    };
  }

  // Add current request
  requests.push(now);

  // Store updated requests
  await cache.put(key, JSON.stringify({ requests }), {
    expirationTtl: Math.ceil(windowMs / 1000),
  });

  return {
    allowed: true,
    limit,
    remaining: limit - requests.length,
    resetTime: now + windowMs,
  };
}

/**
 * Advanced rate limiter with burst capacity
 */
export class AdvancedRateLimiter {
  private cache: KVNamespace;
  private config: {
    maxRequests: number;
    windowMs: number;
    burstLimit: number;
    burstWindowMs: number;
  };

  constructor(
    cache: KVNamespace,
    config = {
      maxRequests: 100,
      windowMs: 3600000, // 1 hour
      burstLimit: 20,
      burstWindowMs: 60000, // 1 minute
    }
  ) {
    this.cache = cache;
    this.config = config;
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `advanced_rate_limit:${identifier}`;

    const cached = await this.cache.get(key, 'json') as {
      hourlyRequests: number[];
      burstRequests: number[];
    } | null;

    let hourlyRequests = cached?.hourlyRequests || [];
    let burstRequests = cached?.burstRequests || [];

    // Clean old requests
    const hourlyWindowStart = now - this.config.windowMs;
    const burstWindowStart = now - this.config.burstWindowMs;

    hourlyRequests = hourlyRequests.filter(timestamp => timestamp > hourlyWindowStart);
    burstRequests = burstRequests.filter(timestamp => timestamp > burstWindowStart);

    // Check burst limit
    if (burstRequests.length >= this.config.burstLimit) {
      const oldestBurst = Math.min(...burstRequests);
      return {
        allowed: false,
        limit: this.config.burstLimit,
        remaining: 0,
        resetTime: oldestBurst + this.config.burstWindowMs,
      };
    }

    // Check hourly limit
    if (hourlyRequests.length >= this.config.maxRequests) {
      const oldestHourly = Math.min(...hourlyRequests);
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: oldestHourly + this.config.windowMs,
      };
    }

    // Record request
    hourlyRequests.push(now);
    burstRequests.push(now);

    // Store updated data
    await this.cache.put(key, JSON.stringify({
      hourlyRequests,
      burstRequests,
    }), {
      expirationTtl: Math.ceil(this.config.windowMs / 1000),
    });

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - hourlyRequests.length,
      resetTime: now + this.config.windowMs,
    };
  }
}