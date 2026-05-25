# Deploying OHMS to Vercel

OHMS is a Next.js 16 (App Router, React 19) app managed with pnpm. It runs with
**zero environment variables** — bundled catalogue of ~900 products, test-mode
checkout, and a file-backed order store. That makes it safe to deploy to a Vercel
preview as-is, then progressively enable Razorpay (payments) and Supabase
(durable orders + catalogue) once you have keys.

> Important: on Vercel the serverless filesystem is **ephemeral and effectively
> read-only across requests**. Orders written to `.data/orders.json` and admin
> product edits written to `.data/custom-products.json` will not persist and are
> not shared between instances. The code already handles this gracefully (writes
> only happen at request time and never crash the build), but for any real use
> configure Supabase — see [Post-deploy](#post-deploy-enable-razorpay--supabase).

## One-click deploy

1. Go to <https://vercel.com/new> and **Import** `github.com/tuttucodes/ohms`.
2. Vercel auto-detects the framework as **Next.js** and the package manager as
   **pnpm** (from `pnpm-lock.yaml`). Leave the defaults:
   - Build command: `next build` (default)
   - Install command: `pnpm install` (default)
   - Output: handled by the Next.js adapter (default)
3. (Optional) add any env vars from the table below. For a first preview you can
   add **none**.
4. Click **Deploy**.

That is the whole first deploy. The build compiles cleanly with no env vars
(verified locally: `pnpm build` → static storefront pages + dynamic admin/API
routes + Proxy middleware, 22 pages generated).

## Environment variables

All variables are **optional** for a first preview. The columns below show what
each unlocks and whether it is required once you turn that feature on.

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical site URL for SEO/OG metadata. Set to your Vercel URL or custom domain. |
| `NEXT_PUBLIC_IMAGE_BASE` | Optional | Serve product images from a self-hosted origin instead of the default CDN. Only after running `scripts/download-images.mjs` and uploading. If set, add its origin to `next.config.ts` `images.remotePatterns`. |
| `ADMIN_PASSWORD` | Optional (set before exposing `/admin`) | Password for `/admin/login`. Defaults to `ohms-admin` if unset. |
| `ADMIN_SESSION_SECRET` | Optional (set before exposing `/admin`) | Long random string used to sign the admin session cookie (HMAC-SHA256). Has an insecure dev default if unset. |
| `RAZORPAY_KEY_ID` | Required for live payments | Razorpay key id. Without it, checkout runs in test mode. |
| `RAZORPAY_KEY_SECRET` | Required for live payments | Razorpay key secret (pairs with the key id). |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Enables `/api/razorpay/webhook` signature verification. |
| `NEXT_PUBLIC_SUPABASE_URL` | Required for durable storage | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key (public client). |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for durable storage | Service-role key for trusted server-side order/product writes. |

Notes:
- Supabase is considered "configured" only when **both** `NEXT_PUBLIC_SUPABASE_URL`
  and `SUPABASE_SERVICE_ROLE_KEY` are present. Otherwise the app uses the file
  fallback (non-durable on Vercel).
- Razorpay is "configured" only when **both** `RAZORPAY_KEY_ID` and
  `RAZORPAY_KEY_SECRET` are present. Otherwise checkout stays in test mode.
- For `NEXT_PUBLIC_*` vars, redeploy after changing them (they are inlined at
  build time).

## What works on the first (no-env) preview

- Full storefront: home, shop with filters/sort/pagination, product pages, cart,
  checkout (test mode), order confirmation, policies, about, contact, PWA.
- Admin dashboard at `/admin` (default password `ohms-admin`) — but product edits
  and orders will not persist across requests/instances until Supabase is set.

## Post-deploy: enable Razorpay + Supabase

### Razorpay (live payments)
1. In the Razorpay dashboard, grab your **Key ID** and **Key Secret**.
2. In Vercel → Project → Settings → Environment Variables, add
   `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (and `RAZORPAY_WEBHOOK_SECRET`
   if you wire up the webhook).
3. Redeploy. Checkout switches from `mode: "test"` to `mode: "live"`.

### Supabase (durable orders + catalogue edits)
1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/schema.sql` then
   `supabase/storage.sql`.
3. In Vercel, set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and
   optionally `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Seed the catalogue into Postgres (run locally against the same project, or
   any environment with the env vars set):
   ```bash
   pnpm seed:supabase
   ```
5. Redeploy. Orders and admin product edits now persist in Postgres instead of
   the ephemeral filesystem.

### Admin security (do this before exposing /admin publicly)
- Set `ADMIN_PASSWORD` to a strong password.
- Set `ADMIN_SESSION_SECRET` to a long random string (e.g. `openssl rand -hex 32`).
  The unset defaults are insecure dev-only values.

## Notes / caveats

- No `engines`/`packageManager` field is declared, so Vercel uses its default
  Node version and detects pnpm from the lockfile. If you need to pin Node, set
  the Node.js version in Vercel project settings or add an `engines.node` field.
- `proxy.ts` (Next 16's middleware replacement) protects `/admin` and runs on the
  edge runtime using **Web Crypto** (`crypto.subtle`) only — edge-safe.
- `lib/auth.ts` and `lib/razorpay.ts` use `node:crypto`, but only inside Node
  serverless route handlers / server components, which is supported on Vercel.
- Product images load from `cdn.fcglcdn.com` (allow-listed in
  `next.config.ts` `images.remotePatterns`) and are optimized to AVIF/WebP.
