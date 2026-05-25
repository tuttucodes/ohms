# Supabase setup (optional)

OHMS runs **without** Supabase. Out of the box it uses the bundled catalogue
(`data/products.json`) and a local file-backed order store (`.data/orders.json`).

Supabase is only needed for:

- **Durable orders** that survive deploys and serverless cold starts.
- **Multi-instance admin** — orders shared across all running instances rather
  than stuck on one machine's filesystem.

When the env vars below are present, the data layer automatically switches to
Postgres (see `lib/supabase.ts`); otherwise it stays on the file/bundled
fallback. No code changes required.

## Setup steps

1. **Create a Supabase project** at https://supabase.com and open it.

2. **Run the SQL** in the project's SQL editor, in order:
   - `supabase/schema.sql` — `products` + `orders` tables, indexes, the
     `order_status` enum, the `updated_at` trigger, and RLS policies.
   - `supabase/storage.sql` — public `product-images` storage bucket for
     self-hosted catalogue images.

3. **Set the env vars** (e.g. in `.env.local`, from Project Settings → API):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-secret-key>
   ```

   The **service-role key is a secret** — server-side only, never expose it to
   the browser and never commit it.

4. **Seed the catalogue** into the `products` table. Next.js does not auto-load
   `.env.local` for standalone scripts, so pass the env vars explicitly:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:supabase
   ```

   or export them first, then run the script:

   ```bash
   set -a; source .env.local; set +a
   pnpm seed:supabase
   ```

   The script upserts in batches of 500 and prints the final row count.

## Security model (RLS)

- **products** — public read (`anon` may `SELECT`). Writes happen only via the
  seed script using the service-role key (which bypasses RLS).
- **orders** — no `anon`/`authenticated` access at all (explicit deny policies).
  Orders carry customer PII and payment references, so they are reachable only
  through the service-role key on the trusted server.

## Product images

`Product.images` stores bare filenames (e.g. `20536575a.jpg`). With the public
bucket, each image is served at:

```
{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/<filename>
```

Upload the image files into the `product-images` bucket (dashboard, CLI, or the
service-role key) to self-host them.
