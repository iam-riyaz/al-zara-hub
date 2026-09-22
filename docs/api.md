# REST API Reference & Specification

All API endpoints return standard structured JSON envelopes with HTTP status codes:

### Success Response Format:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response Format:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error description",
    "details": { ... }
  }
}
```

---

## 1. Authentication APIs

### Register New User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password123",
    "firstName": "Alex",
    "lastName": "Chen",
    "phone": "+1-555-0201"
  }
  ```
- **Response**: `201 Created` with user profile and sets HTTP-only `alzara_session` cookie.

### User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password123"
  }
  ```
- **Response**: `200 OK` with user profile and sets HTTP-only `alzara_session` cookie.

### Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth**: Required (`Cookie: alzara_session`)
- **Response**: `200 OK` with current user object and role.

### Logout
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Auth**: Required
- **Response**: `200 OK` and clears session cookie.

---

## 2. Product Catalog APIs

### Search & List Products
- **Method**: `GET`
- **Path**: `/api/products`
- **Query Parameters**:
  - `search`: Keyword string (matches name, description, SKU, brand)
  - `category`: Category slug (e.g. `audio-headphones`)
  - `brand`: Brand name string
  - `minPrice`: Decimal lower bound
  - `maxPrice`: Decimal upper bound
  - `minRating`: Decimal minimum rating (1.0 - 5.0)
  - `inStock`: Boolean (`true` for in-stock only)
  - `sortBy`: `newest` | `price-asc` | `price-desc` | `rating-desc` | `name-asc`
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 12, max: 50)
- **Response**: `200 OK` with `{ items, total, page, limit, totalPages, hasNextPage, hasPrevPage }`.

### Product Details by Slug
- **Method**: `GET`
- **Path**: `/api/products/[slug]`
- **Response**: `200 OK` with product, images, options, variants with stock, and approved reviews.

### Category Taxonomy Tree
- **Method**: `GET`
- **Path**: `/api/categories`
- **Response**: `200 OK` with hierarchical parent categories and child subcategories with product counts.

---

## 3. Cart & Wishlist APIs

### Get Active Cart
- **Method**: `GET`
- **Path**: `/api/cart`
- **Auth**: Optional (automatically creates and tracks guest or authenticated cart)
- **Response**: `200 OK` with items, recalculated subtotal, sales tax, shipping amount, and total.

### Add Item to Cart
- **Method**: `POST`
- **Path**: `/api/cart/items`
- **Request Body**:
  ```json
  {
    "variantId": "cuid_variant_id",
    "quantity": 1
  }
  ```
- **Response**: `201 Created` with updated cart.

### Update Cart Item Quantity
- **Method**: `PATCH`
- **Path**: `/api/cart/items/[id]`
- **Request Body**: `{ "quantity": 3 }`
- **Response**: `200 OK` with recalculated cart.

### Remove Cart Item
- **Method**: `DELETE`
- **Path**: `/api/cart/items/[id]`
- **Response**: `200 OK` with recalculated cart.

### Get Wishlist
- **Method**: `GET`
- **Path**: `/api/wishlist`
- **Auth**: Required
- **Response**: `200 OK` with saved items.

### Add to Wishlist
- **Method**: `POST`
- **Path**: `/api/wishlist`
- **Request Body**: `{ "productId": "cuid_id", "variantId": "optional_cuid" }`

### Move Wishlist Item to Cart
- **Method**: `POST`
- **Path**: `/api/wishlist/move-to-cart`
- **Request Body**: `{ "productId": "cuid_id" }`

---

## 4. Checkout & Order APIs

### Validate Coupon Code
- **Method**: `POST`
- **Path**: `/api/coupons/validate`
- **Request Body**: `{ "code": "WELCOME10", "subtotal": 299.99 }`
- **Response**: `200 OK` with calculated discount amount and status.

### Initiate Checkout
- **Method**: `POST`
- **Path**: `/api/checkout`
- **Headers**: `Idempotency-Key: optional_unique_string`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "shippingAddress": {
      "firstName": "Alex",
      "lastName": "Chen",
      "phone": "+1-555-0201",
      "addressLine1": "450 Townsend St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94107",
      "country": "US"
    },
    "couponCode": "WELCOME10"
  }
  ```
- **Response**: `201 Created` with pending order details and payment intent transaction ID.

### Confirm Payment
- **Method**: `POST`
- **Path**: `/api/payments/confirm`
- **Request Body**:
  ```json
  {
    "orderId": "cuid_order_id",
    "transactionId": "txn_mock_...",
    "simulateFailure": false
  }
  ```
- **Response**: `200 OK` committing stock reservation and confirming order.

### Payment Webhook Simulation
- **Method**: `POST`
- **Path**: `/api/payments/webhook`
- **Headers**: `x-mock-signature: mock_signature_string`
- **Request Body**: Webhook event payload with event ID and orderId.

---

## 5. Administrative APIs (RBAC: ADMIN / SUPER_ADMIN)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/admin/products` | `GET` | ADMIN | List merchandise with variant inventory |
| `/api/admin/products` | `POST` | ADMIN | Create new product and restock initial inventory |
| `/api/admin/orders/[id]` | `PATCH` | ADMIN | Transition order state (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `/api/admin/inventory/[id]` | `PATCH` | ADMIN | Manually adjust stock level with audit reason |
| `/api/admin/categories` | `POST` | ADMIN | Add new category or subcategory |
| `/api/admin/coupons` | `GET` / `POST` | ADMIN | List and create promotional coupons |
| `/api/admin/users/[id]` | `PATCH` | ADMIN | Update user status or assign staff roles |
| `/api/admin/reviews/[id]` | `PATCH` | ADMIN | Moderate review status (`APPROVED` or `REJECTED`) |

---

## 6. System Health Check

- **Method**: `GET`
- **Path**: `/api/health`
- **Response**: `200 OK`
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "uptimeSeconds": 1420,
    "timestamp": "2026-09-22T09:50:00.000Z",
    "latencyMs": 4,
    "environment": "production"
  }
  ```
