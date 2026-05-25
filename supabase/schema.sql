-- OHMS Supabase schema
-- Mirrors lib/types.ts (Product, Order) with snake_case columns.
-- Run this in the Supabase SQL editor (or via the CLI) before seeding.
--
-- Design notes:
--   * Products are public, read-only data: anon may SELECT, nothing else.
--   * Orders hold customer PII + payment refs: anon has NO access at all.
--     Only the service_role key (used by the trusted server, lib/supabase.ts)
--     touches orders. service_role bypasses RLS, so RLS here is the deny wall
--     for the public anon key.

-- =====================================================================
-- Extensions
-- =====================================================================
-- pg_trgm is optional but improves trigram/full-text relevance. Safe to keep.
create extension if not exists pg_trgm;

-- =====================================================================
-- products
-- =====================================================================
-- camelCase Product fields map to snake_case columns:
--   discountPct -> discount_pct, clubPrice -> club_price,
--   ageFromYears -> age_from_years, ageToYears -> age_to_years,
--   colorHex -> color_hex, colorCount -> color_count,
--   sizeCount -> size_count, ratingDist -> rating_dist.
-- age_*_years are numeric because ages can be fractional (e.g. 0.12 = months).
create table if not exists public.products (
  id              text primary key,
  name            text        not null,
  description     text        not null default '',
  mrp             numeric     not null default 0,
  price           numeric     not null default 0,
  discount_pct    numeric     not null default 0,
  club_price      numeric     not null default 0,
  stock           integer     not null default 0,
  category        text        not null default '',
  subcategory     text        not null default '',
  age_from_years  numeric     not null default 0,
  age_to_years    numeric     not null default 0,
  size            text        not null default '',
  color_hex       text        not null default '',
  color_count     integer     not null default 0,
  size_count      integer     not null default 0,
  rating          numeric     not null default 0,
  reviews         integer     not null default 0,
  rating_dist     int[]       not null default '{}',
  bestseller      boolean     not null default false,
  premium         boolean     not null default false,
  images          text[]      not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes for the common filter/sort paths used by lib/data/products.ts.
create index if not exists products_category_idx     on public.products (category);
create index if not exists products_subcategory_idx  on public.products (subcategory);
create index if not exists products_price_idx         on public.products (price);
create index if not exists products_discount_pct_idx  on public.products (discount_pct);

-- Full-text search over name + description (storefront search box).
create index if not exists products_search_idx
  on public.products
  using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')));

-- =====================================================================
-- orders
-- =====================================================================
-- Status mirrors the OrderStatus union in lib/types.ts.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled'
    );
  end if;
end$$;

-- items / customer are stored as jsonb (OrderItem[] / CustomerInfo).
create table if not exists public.orders (
  id                  text primary key,
  items               jsonb              not null default '[]'::jsonb,
  customer            jsonb              not null default '{}'::jsonb,
  subtotal            numeric            not null default 0,
  shipping            numeric            not null default 0,
  total               numeric            not null default 0,
  status              public.order_status not null default 'pending',
  razorpay_order_id   text,
  razorpay_payment_id text,
  created_at          timestamptz        not null default now(),
  updated_at          timestamptz        not null default now()
);

create index if not exists orders_status_idx
  on public.orders (status);
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);
create index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id);

-- =====================================================================
-- updated_at trigger (orders)
-- =====================================================================
-- Keeps updated_at fresh on every row update as a server-side safety net,
-- independent of the application also setting it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- products: anyone (anon + authenticated) may read the catalogue.
-- Writes are only done by the seed script via the service_role key, which
-- bypasses RLS — so we deliberately add no write policy here.
drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (true);

-- orders: NO access for anon or authenticated client roles.
-- These explicit deny-by-omission policies use `false` so the intent is
-- unambiguous: the only way to read/write orders is the service_role key
-- (server-side, RLS-exempt). Never expose orders to the public anon key.
drop policy if exists orders_no_anon_select on public.orders;
create policy orders_no_anon_select
  on public.orders
  for select
  to anon, authenticated
  using (false);

drop policy if exists orders_no_anon_write on public.orders;
create policy orders_no_anon_write
  on public.orders
  for all
  to anon, authenticated
  using (false)
  with check (false);
