/**
 * Seed the Supabase `products` table from the bundled catalogue.
 *
 * Usage (env vars must be present in the shell — Next.js does NOT auto-load
 * .env.local for standalone tsx scripts):
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:supabase
 *
 * Or export them first (e.g. `set -a; source .env.local; set +a`) then run
 * `pnpm seed:supabase`. The service-role key bypasses RLS — keep it server-side
 * only, never commit it.
 *
 * Reads data/products.json, maps each camelCase Product to its snake_case
 * products row, and upserts in batches. Exits non-zero on any failure.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";

const BATCH_SIZE = 500;
const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.json");

/** Shape of a row in the public.products table (snake_case columns). */
interface ProductRow {
  id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  discount_pct: number;
  club_price: number;
  stock: number;
  category: string;
  subcategory: string;
  age_from_years: number;
  age_to_years: number;
  size: string;
  color_hex: string;
  color_count: number;
  size_count: number;
  rating: number;
  reviews: number;
  rating_dist: number[];
  bestseller: boolean;
  premium: boolean;
  images: string[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Map a camelCase Product to its snake_case products row. */
function toRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    mrp: p.mrp,
    price: p.price,
    discount_pct: p.discountPct,
    club_price: p.clubPrice,
    stock: p.stock,
    category: p.category,
    subcategory: p.subcategory,
    age_from_years: p.ageFromYears,
    age_to_years: p.ageToYears,
    size: p.size,
    color_hex: p.colorHex,
    color_count: p.colorCount,
    size_count: p.sizeCount,
    rating: p.rating,
    reviews: p.reviews,
    rating_dist: p.ratingDist,
    bestseller: p.bestseller,
    premium: p.premium,
    images: p.images,
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. ` +
        `Run as: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:supabase`,
    );
  }
  return value;
}

async function loadProducts(): Promise<Product[]> {
  const raw = await readFile(PRODUCTS_FILE, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${PRODUCTS_FILE}`);
  }
  return parsed as Product[];
}

async function seed(): Promise<void> {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const products = await loadProducts();
  console.log(`Loaded ${products.length} products from ${PRODUCTS_FILE}`);

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let upserted = 0;
  for (let start = 0; start < products.length; start += BATCH_SIZE) {
    const batch = products.slice(start, start + BATCH_SIZE).map(toRow);
    const { error } = await db
      .from("products")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      throw new Error(
        `Upsert failed at offset ${start}: ${error.message}`,
      );
    }

    upserted += batch.length;
    console.log(
      `Upserted ${upserted}/${products.length} (batch of ${batch.length})`,
    );
  }

  // Confirm the final row count from the database itself.
  const { count, error: countError } = await db
    .from("products")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Count query failed: ${countError.message}`);
  }

  console.log(`Done. products table now holds ${count ?? "?"} rows.`);
}

seed().catch((error: unknown) => {
  console.error(`Seed failed: ${getErrorMessage(error)}`);
  process.exit(1);
});
