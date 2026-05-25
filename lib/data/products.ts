import "server-only";
import rawProducts from "@/data/products.json";
import type {
  Product,
  ProductQuery,
  ProductPage,
  CategorySummary,
} from "@/lib/types";
import { AGE_GROUPS } from "@/lib/config";
import { readCustomSync } from "@/lib/data/customProducts";

// Bundled seed catalogue. Admin-managed overrides (lib/data/customProducts)
// are merged on top so edits/additions appear on the storefront.
const SEED: readonly Product[] = (rawProducts as Product[]).map((p) =>
  Object.freeze(p),
);

const DEFAULT_PAGE_SIZE = 24;

/** Live catalogue = seed merged with admin custom products (custom wins by id). */
function getCatalog(): Product[] {
  const custom = readCustomSync();
  if (custom.length === 0) return SEED as Product[];
  const byId = new Map<string, Product>();
  for (const p of SEED) byId.set(p.id, p);
  for (const p of custom) byId.set(p.id, p);
  return [...byId.values()];
}

export function getAllProducts(): Product[] {
  return getCatalog();
}

export function getProductById(id: string): Product | undefined {
  return getCatalog().find((p) => p.id === id);
}

/** Build category → subcategory counts for navigation and filter UIs. */
export function getCategorySummaries(): CategorySummary[] {
  const map = new Map<string, Map<string, number>>();
  for (const p of getCatalog()) {
    if (!map.has(p.category)) map.set(p.category, new Map());
    const subs = map.get(p.category)!;
    subs.set(p.subcategory, (subs.get(p.subcategory) ?? 0) + 1);
  }
  return [...map.entries()].map(([category, subs]) => ({
    category,
    count: [...subs.values()].reduce((a, b) => a + b, 0),
    subcategories: [...subs.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  }));
}

function matchesAgeGroup(p: Product, groupLabel: string): boolean {
  const group = AGE_GROUPS.find((g) => g.label === groupLabel);
  if (!group) return true;
  // Overlap between product range and the requested band.
  return p.ageFromYears <= group.to && p.ageToYears >= group.from;
}

/** Filter, sort and paginate the catalogue. Pure: never mutates PRODUCTS. */
export function queryProducts(query: ProductQuery = {}): ProductPage {
  const {
    search,
    category,
    subcategory,
    minPrice,
    maxPrice,
    ageGroup,
    onSale,
    sort = "popularity",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = query;

  const term = search?.trim().toLowerCase();

  let result = getCatalog().filter((p) => {
    if (category && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    if (typeof minPrice === "number" && p.price < minPrice) return false;
    if (typeof maxPrice === "number" && p.price > maxPrice) return false;
    if (onSale && p.discountPct <= 0) return false;
    if (ageGroup && !matchesAgeGroup(p, ageGroup)) return false;
    if (term) {
      const haystack =
        `${p.name} ${p.description} ${p.category} ${p.subcategory}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  result = sortProducts(result, sort);

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    products: result.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

function sortProducts(
  list: Product[],
  sort: NonNullable<ProductQuery["sort"]>,
): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "discount":
      return copy.sort((a, b) => b.discountPct - a.discountPct);
    case "newest":
      return copy.sort((a, b) => Number(b.id) - Number(a.id));
    case "popularity":
    default:
      // Composite score: rating volume + rating + a nudge for in-stock items.
      return copy.sort((a, b) => popularityScore(b) - popularityScore(a));
  }
}

function popularityScore(p: Product): number {
  return p.reviews * 2 + p.rating * 10 + (p.stock > 0 ? 5 : 0) + p.discountPct / 10;
}

// ---- Curated selections for the storefront ----

export function getBestSellers(limit = 8): Product[] {
  return getCatalog()
    .filter((p) => p.stock > 0)
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, limit);
}

export function getTopDeals(limit = 8): Product[] {
  return getCatalog()
    .filter((p) => p.discountPct > 0 && p.stock > 0)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, limit);
}

export function getNewArrivals(limit = 8): Product[] {
  return getCatalog()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, limit);
}

export function getRelated(product: Product, limit = 6): Product[] {
  return getCatalog()
    .filter(
      (p) => p.id !== product.id && p.subcategory === product.subcategory,
    )
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, limit);
}

export function getCatalogStats() {
  const catalog = getCatalog();
  const total = catalog.length;
  const inStock = catalog.filter((p) => p.stock > 0).length;
  const onSale = catalog.filter((p) => p.discountPct > 0).length;
  const lowStock = catalog.filter((p) => p.stock > 0 && p.stock <= 5).length;
  return { total, inStock, onSale, lowStock };
}
