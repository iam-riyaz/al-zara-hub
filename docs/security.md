# Security Architecture & Hardening Guide

## 1. Threat Modeling & Mitigation Matrix

| Vulnerability Vector | Risk Level | Mitigation Strategy in Al-Zara Hub |
|---|---|---|
| **SQL Injection** | Critical | **Prisma Parameterized Queries & Typed Raw Queries**: All database interactions use Prisma Client typed queries or tagged template literal raw queries (`$executeRaw` / `$queryRaw`), completely eliminating string concatenation vulnerabilities. |
| **Cross-Site Scripting (XSS)** | High | **React Automatic JSX Escaping & Security Headers**: Input rendering is escaped by default. HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: origin-when-cross-origin`) are injected via `next.config.ts`. |
| **Cross-Site Request Forgery (CSRF)** | High | **HTTP-Only SameSite=Lax Cookies**: Session credentials are stored exclusively in HTTP-only, secure, `SameSite=lax` cookies. Mutating API endpoints enforce `Content-Type: application/json` which triggers browser CORS preflight checks. |
| **Broken Access Control (RBAC)** | Critical | **Server-Side Enforcement**: All authorization logic is executed in server-side guards (`requireAuth`, `requireAdmin`, `requireSuperAdmin` in `src/lib/auth/rbac.ts`). Frontend UI role displays are purely cosmetic. |
| **Insecure Direct Object References (IDOR)** | High | **User-Scoped Queries**: Customer endpoints (`/api/orders/[id]`, `/api/wishlist`, `/api/cart`) enforce `where: { id, userId: currentUser.id }`. Only staff with `ADMIN` or `SUPER_ADMIN` roles can inspect foreign customer orders. |
| **Price Manipulation Attack** | High | **Server-Side Canonical Recalculation**: Cart and checkout endpoints completely disregard client-sent prices, totals, or tax amounts. The server queries authoritative prices from the PostgreSQL database for each variant. |
| **Credential Theft & Brute Force** | High | **Argon2id Cryptographic Hashing & Rate Limiting**: Passwords hashed using Argon2id (memoryCost: 19456, timeCost: 2). Authentication routes are protected by sliding-window rate limiters. |
| **Sensitive Data Exposure** | Medium | **Structured Logger Sanitization**: The structured logger automatically scrubs keys matching `password`, `token`, `secret`, `cvv`, `creditCard` into `[REDACTED]`. Passwords and secrets are omitted from all API responses. |
| **Inventory Overselling Race Condition** | High | **Atomic Conditional PostgreSQL Updates**: Stock reservations utilize atomic row conditions (`WHERE availableQuantity >= :qty`). |
| **Double Spend / Double Order** | Medium | **Idempotency Keys**: Critical endpoints accept and verify `Idempotency-Key` headers to ensure identical response deduplication on network retries. |

---

## 2. Password Security Configuration (Argon2id)

```typescript
import { hash, verify } from "@node-rs/argon2";

// Memory-hard, side-channel resistant Argon2id configuration
hash(plainText, {
  memoryCost: 19456, // 19 MiB RAM allocation per hash
  timeCost: 2,       // 2 iterations
  outputLen: 32,     // 256-bit hash output
  parallelism: 1,    // Single thread execution
});
```

---

## 3. Rate Limiting Architecture

Sensitive endpoints are protected using an in-memory sliding window algorithm:
- `/api/auth/login` and `/api/auth/register`: 10 requests per 60 seconds per IP
- `/api/checkout`: 15 requests per 60 seconds per IP

The `MemoryRateLimiter` interface can be upgraded to Upstash Redis free tier or self-hosted Redis with zero modifications to consumer code.
