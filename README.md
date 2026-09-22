# Al-Zara Hub — Enterprise E-Commerce Platform

[![CI Pipeline](https://github.com/iam-riyaz/al-zara-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/iam-riyaz/al-zara-hub/actions)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-teal?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Zero Cost](https://img.shields.io/badge/Cost-$0.00%20Free%20Tier-emerald)](https://github.com/iam-riyaz/al-zara-hub)

> A production-style, portfolio-grade e-commerce platform built from scratch with **zero paid services, zero paid APIs, and zero paid SaaS tiers**.

---

## Key Features

### Storefront Experience
- **Catalog & Faceted Search**: Full-text keyword search across merchandise, brand filters, category hierarchies, price bounds, rating filters, and stock toggles.
- **Product Details & Multi-Variant Matrix**: Interactive image gallery, real-time stock status, variant options (Size/Color), customer reviews with verified buyer badges.
- **Persistent Cart & Guest Merge**: Seamless guest cart tracking with automatic account merging upon customer sign-in; server-side price recalculation (never trust client prices).
- **Wishlist**: Optimistic heart toggles and one-click "Move to Cart" action.
- **Multi-Step Checkout**: Shipping address management, coupon code engine (`WELCOME10`, `FLAT50`), sales tax calculation, and simulated gateway payments.
- **Order Tracking**: Chronological fulfillment status timeline (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).

### SaaS Administrative Dashboard (`/admin`)
- **Executive Overview**: Total revenue, average order value, active merchandise count, customer directory, and low-stock warning indicators.
- **Product Management**: Full CRUD modal with variant generation and initial warehouse stock allocation.
- **Category Taxonomy**: Interactive hierarchical tree supporting infinite parent-child categories.
- **Inventory & Stock Management**: Real-time stock counts across available, reserved, and sold pools with manual adjustment modal.
- **Order Fulfillment**: Enforces strict lifecycle state transitions using an `OrderStateMachine`.
- **Coupon Builder**: Create fixed or percentage promotional coupons with start/end dates, minimum spend thresholds, and redemption caps.
- **Review Moderation**: Approve or reject customer product ratings.
- **Immutable Audit Trail**: Chronological log of administrative actions, pricing adjustments, and security modifications.

### Technical & Production Engineering
- **Modular Monolith**: Clean domain separation (`src/features/*`) with provider SPI abstractions (`src/lib/*`).
- **Atomic Concurrency Protection**: Eliminates overselling via PostgreSQL atomic conditional updates during simultaneous checkouts.
- **Two-Phase Checkout**: Database transaction holds stock reservations; external gateway communication executes outside the DB transaction.
- **Argon2id Cryptography**: Memory-hard password hashing and secure stateless JWT sessions in HTTP-only cookies.
- **Idempotency**: Prevents double-billing and duplicate order generation on network retries.
- **Observability**: Health check endpoint `/api/health` with database latency monitoring; structured JSON logging with sensitive data redaction.

---

## Demo Credentials

For testing and evaluation, pre-seeded demo accounts are available:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `superadmin@alzara.com` | `Admin@123456` | Full platform control & audit logs |
| **Admin** | `admin1@alzara.com` | `Admin@123456` | Merchandise, orders, and moderation |
| **Customer** | `alex.chen@example.com` | `User@123456` | Storefront, cart, wishlist, orders |

---

## Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v20+ (Tested on v24)
- [Docker Desktop](https://www.docker.com/) (for local PostgreSQL 16)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/iam-riyaz/al-zara-hub.git
cd al-zara-hub
npm install
```

### 2. Configure Environment & Launch Database
```bash
# Copy sample environment configuration
cp .env.example .env

# Start local PostgreSQL 16 container
docker compose up -d

# Run migrations and seed demo data (40+ products, categories, historical orders)
npm run db:migrate
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing Suite

Run the full automated test suite (18 unit & integration tests covering concurrency, coupons, state machines, and rate limiting):

```bash
# Run unit & integration tests
npm run test

# Run TypeScript strict typecheck
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## Free-Tier Production Deployment

Deploy the entire platform at **$0.00 cost**:
1. Provision a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Connect your GitHub repository to [Vercel](https://vercel.com).
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`).
4. Run `npm run db:migrate` and `npm run db:seed`.
5. For detailed step-by-step instructions, see [docs/deployment.md](docs/deployment.md).

---

## Architecture Documentation

- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database.md)
- [REST API Reference](docs/api.md)
- [Security & Hardening](docs/security.md)
- [Free Deployment Guide](docs/deployment.md)
- [Final Architectural Report](docs/final-report.md)

---

## License
Distributed under the MIT License. Built for enterprise portfolio demonstration.
