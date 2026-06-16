# Nova Retail — Futuristic AI-Powered Retail Platform

A commercial-grade, futuristic e-commerce platform built to scale from a local
business to a national/international marketplace. **Milestone 1** ships a real,
runnable storefront vertical slice on top of a foundation (M0) designed for the
full platform.

> Stack: Next.js 16 (App Router) · React 19 · TypeScript · TailwindCSS v4 ·
> Framer Motion · Prisma + PostgreSQL · NextAuth v5 (JWT + RBAC) · Razorpay ·
> Redis · MinIO (S3) · Zustand · TanStack Query · Vitest · Playwright · Docker.

## What works today (M1)

- **Storefront**: glassmorphism nav, animated hero, catalog with search / filter /
  sort / pagination, product detail (gallery, variants, specs, JSON-LD), smart
  cart drawer + full cart page.
- **Auth**: NextAuth Credentials sign-up / sign-in, JWT sessions, granular RBAC
  (SUPER_ADMIN / ADMIN / STAFF / VENDOR / CUSTOMER), server-guarded routes.
- **Checkout → Razorpay**: server-validated cart, INR order creation, inventory
  reservation, **idempotent** webhook settlement (HMAC verified), order
  confirmation + account order history. Falls back to a safe mock-pay flow when
  no Razorpay keys are set, so it's demoable out of the box.
- **Cross-cutting**: Zod validation, Redis rate limiting, secure headers, WCAG
  2.2 AA components, SEO (OpenGraph, Product JSON-LD, sitemap, robots), PWA
  (manifest + service worker), Pino logging, feature flags, audit + inventory
  transaction trails.
- **Admin**: RBAC-guarded executive dashboard stub (full suite = M2).

## Architecture (built as seams for the full platform)

`src/lib/payments` (PaymentProvider → Razorpay), `src/lib/storage` (Storage →
MinIO), `src/lib/search` (SearchProvider → Postgres), `src/lib/ai` (AIGateway
stub), `src/lib/events` (typed domain events). Swap/extend each without touching
business logic. Multi-tenant keys (`Tenant`/`Store`) and `vendorId` make the
schema marketplace-ready.

## Prerequisites

- Node.js ≥ 20.9 (tested on 24)
- Docker (for Postgres + Redis + MinIO)

## Quick start

```bash
cp .env.example .env          # fill RAZORPAY_* for live payments (optional in dev)
docker compose up -d          # postgres + redis + minio + adminer
npm install
npm run db:migrate            # apply migrations
npm run db:seed               # 12 products, 3 categories, demo users, flags
npm run dev                   # http://localhost:3000
```

Demo accounts: `admin@nova.test / Admin@12345` · `customer@nova.test / Customer@12345`

## Razorpay

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` and
`NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env` to go live. Point a Razorpay webhook at
`POST /api/v1/webhooks/razorpay` (events: `payment.captured`, `order.paid`).
Without keys, checkout settles via `/api/v1/payments/mock-confirm` (dev-only,
auto-disabled in live mode).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev / prod build / serve |
| `npm run typecheck` / `lint` | TS + ESLint |
| `npm run test` / `test:e2e` | Vitest unit · Playwright E2E |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma migrate / seed / studio |

## Testing

- **Unit** (Vitest): pricing/GST, Razorpay HMAC signature, RBAC.
- **E2E** (Playwright): browse → product → add to cart → checkout → confirmation.

## Deployment

`Dockerfile` builds a standalone image; `docker compose` runs the stack locally.
CI (`.github/workflows/ci.yml`) runs typecheck → lint → tests → build against a
Postgres service. Deploy the app to Vercel and point `DATABASE_URL` / `REDIS_URL`
/ S3 / Razorpay envs at managed services.

## Roadmap

- **M2** Admin suite · EAV attributes/filters · GDPR export/deletion · suppliers
- **M3** AI: semantic search, recommendations, live shopping assistant (Claude)
- **M4** Marketing + loyalty + CMS · BullMQ jobs
- **M5** Analytics center · real-time (WebSocket/SSE)
- **M6** Full PWA push/bg-sync · Lighthouse 95+ · Sweden launch (Stripe, SEK/EUR, i18n) · DR
