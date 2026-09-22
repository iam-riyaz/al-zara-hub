import { describe, it, expect } from "vitest";
import { MemoryRateLimiter } from "@/lib/rate-limit/rate-limiter";

describe("Memory Rate Limiter", () => {
  it("should allow requests under the limit and block subsequent attempts", () => {
    const limiter = new MemoryRateLimiter({ limit: 3, windowMs: 10000 });
    const ip = "192.168.1.100";

    const req1 = limiter.check(ip);
    expect(req1.allowed).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = limiter.check(ip);
    expect(req2.allowed).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = limiter.check(ip);
    expect(req3.allowed).toBe(true);
    expect(req3.remaining).toBe(0);

    // 4th request must be blocked
    const req4 = limiter.check(ip);
    expect(req4.allowed).toBe(false);
    expect(req4.remaining).toBe(0);
  });
});
