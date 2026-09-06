/**
 * @file rate-limiter.ts
 * @description In-memory Sliding Window Rate Limiter for GoCoupon API endpoints.
 * Protects search endpoints against scraping bots and credit exhaustion.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private clients = new Map<string, RateLimitRecord>();
  private readonly defaultWindowMs: number;
  private readonly defaultMaxRequests: number;

  constructor(windowMs = 60 * 1000, maxRequests = 30) {
    this.defaultWindowMs = windowMs;
    this.defaultMaxRequests = maxRequests;

    // Prune stale IPs every 10 minutes
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        const threshold = Date.now() - this.defaultWindowMs;
        for (const [ip, record] of this.clients.entries()) {
          record.timestamps = record.timestamps.filter((ts) => ts > threshold);
          if (record.timestamps.length === 0) {
            this.clients.delete(ip);
          }
        }
      }, 10 * 60 * 1000).unref?.();
    }
  }

  /**
   * Checks if an IP is allowed to make a request.
   * @param clientIp - Client IP address extracted from headers.
   * @param maxRequests - Max requests allowed in the window (defaults to 30).
   * @param windowMs - Time window in milliseconds (defaults to 60s).
   */
  check(
    clientIp: string,
    maxRequests = this.defaultMaxRequests,
    windowMs = this.defaultWindowMs
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const ip = clientIp || "127.0.0.1";
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.clients.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.clients.set(ip, record);
    }

    // Keep only timestamps within the current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: maxRequests - record.timestamps.length,
      retryAfterSeconds: 0,
    };
  }
}

export const apiRateLimiter = new RateLimiter();
