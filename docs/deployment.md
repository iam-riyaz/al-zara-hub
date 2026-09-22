# Free Deployment Guide & Production Architecture

This project is engineered to run **100% free with zero paid API tiers, SaaS subscriptions, or credit-card locked dependencies**.

---

## 1. Verified Free Infrastructure Options

| Component | Primary Free Option | Alternative Free Option | Self-Hosted Fallback |
|---|---|---|---|
| **Web / Next.js Hosting** | **Vercel** (Hobby Free Tier) | **Render** / **Netlify** Free Tier | Docker Container (`Dockerfile`) |
| **PostgreSQL Database** | **Neon** (Free 0.5 GB Serverless Postgres) | **Supabase** (Free 500 MB Tier) | Local / VPS Docker Compose |
| **Payment Gateway** | **MockPaymentProvider** (Built-in) | Open Sandbox Provider | Simulated webhook callbacks |
| **Asset Storage** | **LocalStorageProvider** (Built-in) | Cloudflare R2 (10GB Free) | `/public/uploads` local disk |
| **Email Service** | **MockEmailProvider** (Built-in) | Resend (3000 free emails/mo) | Console / file output |

---

## 2. Step-by-Step Production Deployment (Vercel + Neon Free Tier)

### Step 1: Provision Free PostgreSQL Database (Neon)
1. Navigate to [Neon.tech](https://neon.tech) and create a free account (GitHub sign-in available, no credit card required).
2. Create a new project: `alzara-production-db`.
3. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://neondb_owner:password@ep-cool-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Step 2: Deploy to Vercel Free Tier
1. Push your code to your GitHub repository (`main` branch).
2. Sign in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **Add New Project** and import `al-zara-hub`.
4. Under **Environment Variables**, configure:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: Generate a random 32+ character string (e.g. `openssl rand -hex 32`)
   - `SESSION_SECRET`: Generate a random 32+ character string
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL (e.g. `https://al-zara-hub.vercel.app`)
   - `STORAGE_PROVIDER`: `local`
   - `PAYMENT_PROVIDER`: `mock`
   - `EMAIL_PROVIDER`: `mock`
   - `MOCK_PAYMENT_ENABLED`: `true`
   - `NODE_ENV`: `production`
5. Click **Deploy**.

### Step 3: Run Database Migrations & Demo Seed
From your local terminal, point to the production database and run migrations:
```bash
# Apply schema to production database
DATABASE_URL="<your_neon_url>" npm run db:migrate

# Populate demo catalog (40+ products, categories, admin credentials)
DATABASE_URL="<your_neon_url>" npm run db:seed
```

### Step 4: Verify Live Production
1. Navigate to `https://<your-project>.vercel.app/api/health`
   Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "environment": "production"
   }
   ```
2. Navigate to `/login` and sign in using the demo Super Admin account:
   - Email: `superadmin@alzara.com`
   - Password: `Admin@123456`

---

## 3. Fallback: Self-Hosted Docker Deployment

If cloud free tiers become unavailable, run the entire stack on any Linux VPS or local machine using Docker:

```bash
# 1. Start local PostgreSQL 16 container
docker compose up -d

# 2. Run migrations and seed
npm run db:migrate
npm run db:seed

# 3. Build and launch application container
docker build -t al-zara-hub .
docker run -p 3000:3000 --env-file .env al-zara-hub
```
The application will be live at `http://localhost:3000` with 100% full functionality.
