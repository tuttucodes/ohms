import "server-only";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import type { Product } from "@/lib/types";

/*
  Admin-managed product overrides.

  - New products and edits to seed products are stored here as a small JSON file
    (.data/custom-products.json). The catalogue merges these over the bundled
    seed (custom entries win by id), so admin changes show on the storefront.
  - Local/dev: persists to disk. Serverless/prod: configure Supabase for durable
    catalogue edits (the seed script + schema are provided).
*/

const DATA_DIR = path.join(process.cwd(), ".data");
const CUSTOM_FILE = path.join(DATA_DIR, "custom-products.json");

// Sync read with an mtime cache so storefront reads stay fast but pick up
// admin edits without a restart.
let cache: { mtimeMs: number; products: Product[] } | null = null;

export function readCustomSync(): Product[] {
  try {
    const stat = fs.statSync(CUSTOM_FILE);
    if (cache && cache.mtimeMs === stat.mtimeMs) return cache.products;
    const raw = fs.readFileSync(CUSTOM_FILE, "utf8");
    const products = JSON.parse(raw) as Product[];
    cache = { mtimeMs: stat.mtimeMs, products };
    return products;
  } catch {
    return [];
  }
}

async function writeCustom(products: Product[]): Promise<void> {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(CUSTOM_FILE, JSON.stringify(products, null, 2), "utf8");
  cache = null;
}

export async function listCustom(): Promise<Product[]> {
  return readCustomSync();
}

export async function upsertCustom(product: Product): Promise<Product> {
  const all = readCustomSync();
  const idx = all.findIndex((p) => p.id === product.id);
  const next =
    idx === -1
      ? [...all, product]
      : all.map((p) => (p.id === product.id ? product : p));
  await writeCustom(next);
  return product;
}

export async function deleteCustom(id: string): Promise<void> {
  const all = readCustomSync();
  await writeCustom(all.filter((p) => p.id !== id));
}

/** Generate a new product id that won't collide with the seed catalogue. */
export function newProductId(): string {
  return `C${Date.now().toString(36).toUpperCase()}`;
}
