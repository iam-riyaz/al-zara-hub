export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();

  constructor(private config: RateLimitConfig = { limit: 10, windowMs: 60 * 1000 }) {}

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      const resetAt = now + this.config.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.config.limit - 1, resetAt };
    }

    if (record.count < this.config.limit) {
      record.count += 1;
      return { allowed: true, remaining: this.config.limit - record.count, resetAt: record.resetAt };
    }

    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
}

// Sensitive endpoint limiters
export const authRateLimiter = new MemoryRateLimiter({ limit: 10, windowMs: 60 * 1000 }); // 10 attempts / min
export const checkoutRateLimiter = new MemoryRateLimiter({ limit: 15, windowMs: 60 * 1000 }); // 15 checkouts / min
