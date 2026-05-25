# OHMS — Soft And Comfort

A production-grade, mobile-first **PWA e-commerce store** for OHMS kidswear, with a
storefront and an admin dashboard. Built with Next.js 16 (App Router), React 19,
Tailwind v4, Supabase (optional), and Razorpay.

> Runs with **zero configuration** out of the box: bundled catalogue of ~900
> products, file-backed orders, and a test-mode checkout. Add env keys to switch
> on real payments, durable storage, and self-hosted images.

## Features

**Storefront**
- Editorial home page (hero, categories, bestsellers, deals, shop-by-age, new in)
- Full shop with search, filters (category, subcategory, age, price, on-sale), sort, pagination
- Product detail pages with image gallery, related products, SEO metadata
- Persistent cart (slide-over drawer + full bag page), free-shipping progress
- Checkout with server-side re-pricing, Razorpay payment, order confirmation
- Installable PWA: offline page, service worker, app icons, install prompt

**Admin** (`/admin`)
- Password login with signed session cookie (proxy/middleware-protected)
- Dashboard: revenue, orders, catalogue health, recent orders
- Products: search, add, edit, delete (merges over the seed catalogue)
- Orders: list, detail, status updates

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, RSC), React 19 |
| Styling | Tailwind v4 (`@theme` tokens, OKLCH), Fraunces + Plus Jakarta Sans |
| State | Zustand (cart, persisted to localStorage) |
| Validation | Zod (all API boundaries) |
| Payments | Razorpay Checkout + HMAC signature verification |
| Storage | Supabase (Postgres + Storage) — optional; file fallback for local |
| PWA | Custom service worker + web manifest |

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Admin: visit `/admin/login` (default dev password: `ohms-admin`).

## Configuration

Copy `.env.example` to `.env.local`. Everything is optional — see the file for
what each variable unlocks (Razorpay, Supabase, admin password, image origin).

### Payments (Razorpay)
Without keys, checkout runs in **test mode** (orders are created and confirmed
without a live gateway, so the full flow is demoable). Add `RAZORPAY_KEY_ID` and
`RAZORPAY_KEY_SECRET` for real payments.

### Durable storage (Supabase)
Local/dev persists orders to `.data/orders.json` and admin product edits to
`.data/custom-products.json`. For production (serverless = ephemeral filesystem),
configure Supabase:

```bash
# 1. Create a Supabase project
# 2. Run supabase/schema.sql + supabase/storage.sql in the SQL editor
# 3. Set the three SUPABASE_* env vars
pnpm seed:supabase   # imports data/products.json into Postgres
```

### Self-hosting images
Product images are served from the source CDN by default. To self-host:

```bash
node scripts/download-images.mjs --main-only   # fast first pass (~900 imgs)
node scripts/download-images.mjs               # full galleries
```

Then upload `public/products` to Supabase Storage / a CDN and set
`NEXT_PUBLIC_IMAGE_BASE`. See `scripts/README-images.md`.

## Project structure

```
app/
  (store)/         storefront routes (home, shop, product, cart, checkout, order, about, contact, policies)
  (admin)/admin/   login + protected dashboard (panel) routes
  api/             razorpay (order/verify/webhook) + admin (login/logout/products/orders)
components/        ui primitives, layout, product, cart, checkout, admin, brand, pwa
lib/               data (products/orders/custom), config, types, pricing, razorpay, auth, validation
data/products.json bundled seed catalogue
supabase/          schema + storage SQL, seed docs
scripts/           image downloader, icon generator, supabase seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm seed:supabase` | Seed products into Supabase |
| `pnpm download:images` | Download product images locally |

## Deploy

Deploy on Vercel. Set env vars in the project settings. Configure Supabase for
durable orders/catalogue (serverless filesystem is ephemeral) and Razorpay for
live payments.
