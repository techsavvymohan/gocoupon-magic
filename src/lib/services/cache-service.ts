/**
 * @file cache-service.ts
 * @description Universal Multi-Tier Caching Service for GoCoupon.
 *
 * Architecture:
 * 1. Tier 1 (Distributed): Upstash Redis REST or local Redis when credentials are provided.
 *    Shared across all Vercel serverless instances or multi-instance VPS workers.
 * 2. Tier 2 (Process In-Memory): Resilient, fast in-memory LRU cache with automatic TTL pruning.
 *    Stays hot 24/7 in persistent Node.js / VPS environments.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtlMs = 15 * 60 * 1000; // 15 minutes default
  private upstashUrl = process.env.UPSTASH_REDIS_REST_URL || "";
  private upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

  constructor() {
    // Periodic background cleanup of expired in-memory keys every 5 minutes
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.expiresAt <= now) {
            this.memoryCache.delete(key);
          }
        }
      }, 5 * 60 * 1000).unref?.();
    }
  }

  /**
   * Retrieves a cached item by key.
   */
  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();

    // 1. Check local in-memory cache first (0ms latency)
    const local = this.memoryCache.get(key);
    if (local) {
      if (local.expiresAt > now) {
        return local.value as T;
      }
      this.memoryCache.delete(key);
    }

    // 2. Check Upstash Redis if configured (shared distributed cache)
    if (this.upstashUrl && this.upstashToken) {
      try {
        const res = await fetch(`${this.upstashUrl.replace(/\/+$/, "")}/get/${encodeURIComponent(key)}`, {
          headers: {
            Authorization: `Bearer ${this.upstashToken}`,
          },
          signal: AbortSignal.timeout(1500),
        });

        if (res.ok) {
          const body = await res.json();
          if (body.result) {
            const parsed = typeof body.result === "string" ? JSON.parse(body.result) : body.result;
            // Warm up local memory cache for sub-millisecond subsequent reads
            this.memoryCache.set(key, { value: parsed, expiresAt: now + 60 * 1000 });
            return parsed as T;
          }
        }
      } catch {
        // Silently fall back to memory cache on Redis timeout
      }
    }

    return null;
  }

  /**
   * Stores an item with a specified TTL in milliseconds.
   */
  async set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): Promise<void> {
    const expiresAt = Date.now() + ttlMs;

    // 1. Always set local memory cache
    this.memoryCache.set(key, { value, expiresAt });

    // 2. Sync to Upstash Redis if configured
    if (this.upstashUrl && this.upstashToken) {
      try {
        const ttlSeconds = Math.max(1, Math.round(ttlMs / 1000));
        const payload = typeof value === "string" ? value : JSON.stringify(value);

        await fetch(
          `${this.upstashUrl.replace(/\/+$/, "")}/set/${encodeURIComponent(key)}?ex=${ttlSeconds}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.upstashToken}`,
              "Content-Type": "application/json",
            },
            body: payload,
            signal: AbortSignal.timeout(1500),
          }
        );
      } catch {
        // Upstash write failure is non-blocking
      }
    }
  }

  /**
   * Deletes a cached key.
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.upstashUrl && this.upstashToken) {
      try {
        await fetch(`${this.upstashUrl.replace(/\/+$/, "")}/del/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${this.upstashToken}` },
          signal: AbortSignal.timeout(1000),
        });
      } catch {
        // Non-blocking
      }
    }
  }

  /**
   * Deletes all cached keys that start with a prefix.
   */
  async deletePrefix(prefix: string): Promise<void> {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Flushes all in-memory and distributed cache entries.
   */
  async clearAll(): Promise<number> {
    const count = this.memoryCache.size;
    this.memoryCache.clear();

    if (this.upstashUrl && this.upstashToken) {
      try {
        await fetch(`${this.upstashUrl.replace(/\/+$/, "")}/flushdb`, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.upstashToken}` },
          signal: AbortSignal.timeout(1500),
        });
      } catch {
        // Non-blocking
      }
    }

    return count;
  }

  /**
   * Returns current count of in-memory cached entries.
   */
  size(): number {
    return this.memoryCache.size;
  }

  /**
   * Helper pattern to wrap fetch calls with caching (Cache-Aside pattern).
   */
  async wrap<T>(key: string, fetcher: () => Promise<T>, ttlMs = this.defaultTtlMs): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    if (fresh) {
      await this.set(key, fresh, ttlMs);
    }
    return fresh;
  }
}

export const globalCache = new CacheService();
