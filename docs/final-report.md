# Al-Zara Hub — Final Architectural & Engineering Report

A complete technical synthesis of the **Al-Zara Hub** production-style e-commerce platform built from zero to deployment.

---

## 1. Project Overview
Al-Zara Hub is an enterprise-grade commercial e-commerce web application engineered with Next.js 16 (Turbopack, App Router, React 19), PostgreSQL 16, Prisma ORM, Tailwind CSS, and Argon2id security. The platform implements complete customer storefront experiences and an advanced SaaS-quality administrative portal, adhering strictly to a **zero-paid cost mandate**.

---

## 2. Architecture
Engineered as a **Modular Monolith** organized into distinct domain bounded contexts:
- **Presentation Layer**: Next.js App Router (Server Components for SEO and fast initial paint; Client Components for reactive micro-interactions).
- **Domain Services Layer**: High-cohesion TypeScript services in `src/features/` managing catalog, cart, wishlist, pricing, concurrency, order lifecycle, payments, reviews, and audits.
- **Provider SPI Layer**: Abstracted interfaces (`src/lib/*`) decoupling payment, file storage, email, caching, and rate limiting from third-party vendor lock-in.
- **Persistence Layer**: PostgreSQL with Prisma ORM connection pooling and ACID transactions.

---

## 3. Technology Stack
- **Framework**: Next.js 16.3.5 (App Router, Server Actions, Route Handlers)
- **Runtime & UI**: Node.js v24, React 19, TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4, Lucide React icons, next-themes (Light & Dark modes)
- **Database & ORM**: PostgreSQL 16 (Docker Alpine / Neon Free Tier) & Prisma ORM 6.4.1
- **Security & Auth**: `@node-rs/argon2` (Argon2id hashing), `jose` (JWT sessions in HTTP-only cookies)
- **Validation**: Zod 3.24
- **Testing**: Vitest 4.1, jsdom, React Testing Library

---

## 4. Database Schema
Comprehensive relational design spanning **25 models and 14 enums**:
- Normalized relational model with composite keys (`[userId, productId]`, `[cartId, variantId]`).
- Financial snapshot pattern: `OrderItem` stores immutable product name, variant SKU, unit price, tax, discount, and total to preserve accounting integrity.
- Optimized B-Tree indexes on `email`, `slug`, `sku`, `categoryId`, `status`, `basePrice`, `ratingAverage`, `orderNumber`, and `idempotencyKey`.

---

## 5. Authentication Architecture
- Password hashing powered by native **Argon2id** (`memoryCost: 19456`, `timeCost: 2`, `outputLen: 32`).
- Stateless signed sessions utilizing HS256 JWT tokens encapsulated in encrypted, `SameSite=Lax`, `HTTP-Only` cookies (`alzara_session`).
- Automatic session hydration in Server Components via `getCurrentUser()` helper.

---

## 6. Authorization Architecture (RBAC)
- Multi-tier Role-Based Access Control: `USER`, `ADMIN`, `SUPER_ADMIN`.
- Server-side authorization guards: `requireAuth()`, `requireRole()`, `requireAdmin()`, `requireSuperAdmin()`.
- Client-side UI checks are strictly decorative; all sensitive API routes and server actions verify database roles server-side.

---

## 7. Product Architecture
- Hierarchical categories supporting recursive parent-child taxonomies (e.g. `Electronics` -> `Audio & Headphones`).
- Multi-variant product modeling: `Product` -> `ProductOption` -> `ProductOptionValue` -> `ProductVariant` -> `ProductVariantOptionValue`.
- Multi-image galleries with primary display indicators and variant linking.
- Full faceted search filtering by keyword, category, brand, price range, rating threshold, stock status, and multiple sort vectors.

---

## 8. Cart Architecture
- Unified guest and authenticated cart support.
- Guest sessions tracked via secure UUID cookies (`alzara_guest_cart`).
- Automatic guest cart merging into user accounts upon registration or login.
- **Price Integrity Rule**: Client-sent prices are strictly ignored. The server queries authoritative database prices on every operation.

---

## 9. Checkout Architecture
- Multi-step checkout workflow: Cart -> Address -> Shipping Option -> Coupon Application -> Stock Reservation -> Payment Intent -> Confirmation.
- **Two-Phase Transaction Decoupling**: Database transactions atomically reserve stock and snapshot orders; external gateway communication happens outside open database transactions to eliminate connection pool starvation.

---

## 10. Inventory Architecture & Concurrency Control
- Strict atomic concurrency protection prevents overselling during flash sales.
- Uses PostgreSQL atomic conditional updates:
  ```sql
  UPDATE "Inventory"
  SET "availableQuantity" = "availableQuantity" - :qty,
      "reservedQuantity" = "reservedQuantity" + :qty
  WHERE "variantId" = :variantId AND "availableQuantity" >= :qty
  ```
- If stock is insufficient, affected row count is 0 and throws `InventoryError`.
- State transitions track `availableQuantity`, `reservedQuantity`, and `soldQuantity` with immutable audit rows in `InventoryTransaction`.

---

## 11. Payment Architecture
- Provider SPI interface (`IPaymentProvider`) allowing seamless integration of Stripe, Razorpay, or PayPal.
- **MockPaymentProvider**: Complete local implementation simulating success, card declines, and webhook signature verification without cloud credentials.
- Idempotency key tracking prevents duplicate charges on rapid double-clicks.

---

## 12. Order Architecture & State Machine
- Centralized `OrderStateMachine` validating lifecycle transitions:
  `PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`.
- Validates cancellation only from active states (`PENDING`, `CONFIRMED`, `PROCESSING`), immediately restocking reserved quantities.
- Step-by-step history tracked in `OrderStatusHistory`.

---

## 13. Admin Dashboard Architecture
- SaaS-grade administrative operations console:
  - **Overview**: Real-time sales revenue, order volumes, low-stock warnings, and top products.
  - **Merchandise**: Searchable product table and creation modal with variant & inventory allocation.
  - **Taxonomy**: Hierarchical category tree manager.
  - **Inventory**: Warehouse stock tracking with low-stock alerts and manual adjustment modals.
  - **Orders**: Live fulfillment management with state machine transitions.
  - **Coupons**: Promotional discount code builder with usage caps.
  - **Reviews**: Moderation queue to approve or reject customer feedback.
  - **Audit Trail**: Chronological immutable log of staff actions.

---

## 14. Security
- Protection against SQL injection via Prisma parameterized queries.
- HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`).
- In-memory sliding-window rate limiters protecting `/api/auth/*` and `/api/checkout`.
- IDOR mitigation through user-scoped queries.
- Sensitive data redaction in structured JSON application logging.

---

## 15. Performance
- Server Components render static UI on server with 0 client JS bundle overhead.
- In-memory TTL caching for categories, featured products, and analytics queries.
- Database indexes on all primary lookup keys, foreign keys, and sorting fields.
- Multi-stage Docker production image with minimal runtime size.

---

## 16. Testing
- Comprehensive automated test suite executed via Vitest:
  - Unit tests: Argon2id password hashing, coupon discount calculations, order state machine transitions, rate limiters, cart price recalculations.
  - Integration tests: Concurrency race conditions (simultaneous checkout of the last available unit), expired coupon rejection, out-of-stock rejection, idempotency key deduplication.
- **Result**: 100% pass rate (18 tests in 7 test suites).

---

## 17. Deployment
- Deployable to **Vercel Hobby Tier** paired with **Neon Free PostgreSQL Tier** with zero hosting fees.
- Health check route `/api/health` continuously monitors application status, database connectivity, and round-trip query latency.
- Self-hosted fallback verified via multi-stage `Dockerfile` and `docker-compose.yml`.

---

## 18. Free-Tier Services Used
1. **Neon / Supabase Free Tier**: Free PostgreSQL database with connection pooling.
2. **Vercel / Render Free Tier**: Next.js App Router serverless hosting.
3. **GitHub & GitHub Actions**: Source control and free CI automated testing pipeline.
4. **Unsplash CDN**: High-resolution royalty-free product assets.
5. **Local Providers**: Local storage, mock payments, and mock email logging.

---

## 19. Known Limitations
- The in-memory rate limiter and cache are process-bound. In multi-instance serverless deployments, an external free Redis adapter (e.g. Upstash free tier) should be connected.
- File uploads in development write to `/public/uploads`. In serverless deployments with read-only file systems, configure Cloudflare R2 (10GB free tier) or AWS S3.

---

## 20. Future Scaling Strategy
1. **Read Replicas & Connection Pooling**: Attach PgBouncer or Prisma Accelerate for 100k+ concurrent read traffic.
2. **Full-Text Trigram Search**: Enable PostgreSQL `pg_trgm` extension for fuzzy typo-tolerant product searches.
3. **Redis Caching**: Upgrade `MemoryCacheProvider` to distributed Redis cache with tag invalidation.
4. **Service Extraction**: Individual bounded contexts (`orders`, `catalog`, `payments`) can be extracted into dedicated microservices without restructuring domain services.
