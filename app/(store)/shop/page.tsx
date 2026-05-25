import type { Metadata } from "next";
import { Suspense } from "react";
import { queryProducts, getCategorySummaries, getAllProducts } from "@/lib/data/products";
import type { ProductQuery } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { MobileFilters } from "@/components/shop/MobileFilters";
import { SortSelect } from "@/components/shop/SortSelect";
import { Pagination } from "@/components/shop/Pagination";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Browse OHMS soft, comfy kidswear — bodysuits, nightwear, innerwear, dresses and more. Gentle fabrics for babies and kids.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function buildQuery(sp: SearchParams): ProductQuery {
  const num = (v: string | undefined) =>
    v !== undefined && v !== "" ? Number(v) : undefined;
  return {
    search: str(sp.search),
    category: str(sp.category),
    subcategory: str(sp.subcategory),
    ageGroup: str(sp.ageGroup),
    minPrice: num(str(sp.minPrice)),
    maxPrice: num(str(sp.maxPrice)),
    onSale: str(sp.onSale) === "1",
    sort: (str(sp.sort) as ProductQuery["sort"]) ?? "popularity",
    page: num(str(sp.page)) ?? 1,
    pageSize: 24,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = buildQuery(sp);
  const result = queryProducts(query);
  const categories = getCategorySummaries();
  const priceMax = Math.max(...getAllProducts().map((p) => p.price));

  const heading =
    query.search
      ? `Results for “${query.search}”`
      : query.subcategory ?? query.category ?? "All products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-600">
          Shop
        </p>
        <h1 className="mt-1 text-[clamp(1.75rem,1rem+3vw,2.75rem)]">{heading}</h1>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-3 border-y border-border py-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{result.total}</span>{" "}
          {result.total === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <MobileFilters
              categories={categories}
              priceMax={priceMax}
              total={result.total}
            />
          </Suspense>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28">
            <Suspense fallback={null}>
              <FilterSidebar categories={categories} priceMax={priceMax} />
            </Suspense>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <ProductGrid products={result.products} />
          <Suspense fallback={null}>
            <Pagination page={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
