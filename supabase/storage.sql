-- OHMS Supabase Storage: self-hosted product images
-- Run this in the Supabase SQL editor after schema.sql.
--
-- Creates a PUBLIC bucket named `product-images` so the storefront can serve
-- catalogue photos directly. Product.images holds bare filenames (e.g.
-- "20536575a.jpg"); the public object URL is:
--   {NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/<filename>
--
-- Alternative: you can create this bucket from the Supabase dashboard
-- (Storage -> New bucket -> name "product-images" -> Public). The SQL below
-- is the idempotent, scriptable equivalent.

-- =====================================================================
-- Bucket
-- =====================================================================
-- `public = true` makes objects readable without a signed URL.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- =====================================================================
-- Policies
-- =====================================================================
-- Public read: anyone may download objects from this bucket.
-- (Object writes/uploads use the service_role key, which bypasses RLS, so no
-- public write policy is added.)
drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');
