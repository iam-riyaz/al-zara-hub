# System Architecture & Technical Design

## 1. Architectural Philosophy

Al-Zara Hub is built as a high-performance, domain-driven **Modular Monolith**. While microservices introduce distributed network latency, distributed transactions, and infrastructure hosting overhead (violating the zero-cost requirement), a clean modular monolith offers:

- **Strict Domain Boundaries**: Grouped by bounded context in `src/features/<domain>/`
- **Low-Latency In-Process Calls**: Domain services communicate in-process without network serialization overhead.
- **Provider SPI Abstraction**: Cross-cutting concerns (payment, storage, email, caching, rate limiting) are defined via interfaces (`src/lib/*`), allowing drop-in replacement with cloud services or free open-source adapters without modifying business logic.
- **Single-Deployment Simplicity**: Deployed as a single unified Next.js App Router artifact to free serverless hosting tiers.

```mermaid
flowchart TD
    subgraph Client [Client Viewport]
        Browser[Storefront User / Admin Staff]
    end

    subgraph Edge [Next.js App Layer]
        Router[App Router Server Components]
        API[API Route Handlers]
        MW[Security Headers & Rate Limiting]
    end

    subgraph Domains [Domain Services Layer]
        AuthSvc[Auth & RBAC Service]
        CatalogSvc[Product & Category Service]
        CartSvc[Cart & Wishlist Service]
        OrderSvc[Order & Checkout Service]
        InvSvc[Inventory Concurrency Service]
        CouponSvc[Coupon Engine]
        ReviewSvc[Review Moderation Service]
        AuditSvc[Audit Logging Service]
    end

    subgraph SPI [Provider SPI Abstractions]
        PayProv[PaymentProvider: MockPaymentProvider]
        StorProv[StorageProvider: LocalStorageProvider]
        EmailProv[EmailProvider: MockEmailProvider]
        CacheProv[CacheProvider: MemoryCacheProvider]
    end

    subgraph Data [Data Persistence]
        Prisma[Prisma ORM Client Singleton]
        PG[(PostgreSQL 16 Engine)]
    end

    Browser --> MW
    MW --> Router
    MW --> API
    Router --> Domains
    API --> Domains
    Domains --> SPI
    Domains --> Prisma
    Prisma --> PG
```

---

## 2. Request & Execution Flows

### 2.1 Customer Checkout Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant CartUI as Cart / Checkout UI
    participant CheckoutAPI as POST /api/checkout
    participant OrderSvc as OrderService
    participant InvSvc as InventoryService
    participant DB as PostgreSQL Transaction
    participant PaymentSvc as PaymentProvider (Mock)
    participant ConfirmAPI as POST /api/payments/confirm

    Customer->>CartUI: Click "Proceed to Checkout"
    CartUI->>CheckoutAPI: Submit address, coupon & Idempotency-Key
    CheckoutAPI->>OrderSvc: Execute Phase 1 (DB Transaction)
    OrderSvc->>DB: Begin Transaction
    OrderSvc->>DB: Verify Cart & Calculate Canonical Prices
    OrderSvc->>InvSvc: Reserve Stock Atomically
    InvSvc->>DB: UPDATE Inventory SET available = available - qty, reserved = reserved + qty WHERE available >= qty
    OrderSvc->>DB: Create Order (Status: PENDING, Payment: PENDING)
    OrderSvc->>DB: Snapshot OrderItems, Addresses, History
    OrderSvc->>DB: Commit Transaction
    OrderSvc->>PaymentSvc: Execute Phase 2: createPaymentIntent()
    PaymentSvc-->>CheckoutAPI: Return clientSecret & transactionId
    CheckoutAPI-->>CartUI: Prompt Gateway Payment Confirmation
    CartUI->>ConfirmAPI: Confirm payment with transactionId
    ConfirmAPI->>OrderSvc: confirmOrderPayment()
    OrderSvc->>DB: Commit Sale (reserved -> sold)
    OrderSvc->>DB: Transition Order (PENDING -> CONFIRMED, Payment: PAID)
    OrderSvc-->>Customer: Render Order Confirmation Receipt
```

---

## 3. Directory Layout & Layer Responsibilities

```
src/
├── app/                  # Next.js Presentation Layer
│   ├── (store)/          # Storefront customer views (SSR & Client Components)
│   ├── admin/            # SaaS administrative console (RBAC protected)
│   └── api/              # Public & Admin REST Route Handlers
├── features/             # Domain Logic Layer (Modular Monolith)
│   ├── auth/             # Authentication & session services
│   ├── products/         # Catalog search, filtering & specs
│   ├── categories/       # Taxonomy & hierarchical tree queries
│   ├── cart/             # Guest and authenticated cart operations
│   ├── wishlist/         # Saved merchandise & move-to-bag
│   ├── orders/           # Lifecycle state machine & snapshots
│   ├── inventory/        # Concurrency locks & warehouse stock
│   ├── coupons/          # Promotional discount rules engine
│   ├── reviews/          # Verified ratings & moderation
│   ├── admin/            # Aggregate analytical queries
│   └── audit/            # Administrative change logs
├── lib/                  # Infrastructure & Cross-Cutting Concerns
│   ├── auth/             # Argon2id password hashing & jose JWT sessions
│   ├── db/               # Prisma singleton with connection pooling
│   ├── payments/         # PaymentProvider interface & Mock provider
│   ├── storage/          # StorageProvider interface & Local provider
│   ├── email/            # EmailProvider interface & Mock provider
│   ├── rate-limit/       # In-memory sliding window rate limiter
│   ├── cache/            # TTL in-memory caching provider
│   └── errors/           # Custom domain AppError classes & handlers
└── components/           # Reusable UI Component Library
    ├── ui/               # Primitive controls (Button, Input, Card, Badge)
    ├── storefront/       # Header, Footer, ProductCard, Gallery, Reviews
    └── shared/           # ThemeProvider, ThemeToggle
```
