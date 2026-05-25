import Link from "next/link";
import { ArrowRight, Truck, Leaf, ShieldCheck, RefreshCw } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CategoryTiles, type CategoryTile } from "@/components/home/CategoryTiles";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  getBestSellers,
  getTopDeals,
  getNewArrivals,
  queryProducts,
} from "@/lib/data/products";
import { SHOP_NAV, AGE_GROUPS } from "@/lib/config";
import { productImage } from "@/lib/utils";

export default function HomePage() {
  const bestSellers = getBestSellers(8);
  const deals = getTopDeals(8);
  const newArrivals = getNewArrivals(8);

  // Hero imagery — pick a few visually rich styles.
  const heroPool = queryProducts({
    subcategory: "Frocks and Dresses",
    pageSize: 6,
  }).products;
  const heroImages = (heroPool.length >= 3 ? heroPool : bestSellers)
    .slice(0, 3)
    .map((p) => productImage(p.images[0], "full"));

  // Category tiles from the shop nav, with a representative image + count.
  const tiles: CategoryTile[] = SHOP_NAV.filter((n) => n.subcategory)
    .slice(0, 8)
    .map((n) => {
      const page = queryProducts({ subcategory: n.subcategory, pageSize: 1 });
      const img = page.products[0]?.images[0];
      return {
        label: n.label,
        subcategory: n.subcategory!,
        image: productImage(img, "card"),
        count: page.total,
      };
    })
    .filter((t) => t.count > 0);

  return (
    <>
      <Hero images={heroImages} />

      {/* Value strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 sm:grid-cols-4 sm:px-6">
          {[
            [Truck, "Free shipping", "Over ₹599"],
            [Leaf, "Soft & breathable", "Skin-friendly fabrics"],
            [ShieldCheck, "Quality tested", "Built for play"],
            [RefreshCw, "Easy returns", "15-day window"],
          ].map(([Icon, title, sub]) => {
            const I = Icon as typeof Truck;
            return (
              <div key={title as string} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-700">
                  <I className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {title as string}
                  </p>
                  <p className="truncate text-xs text-muted">{sub as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          subtitle="From first onesies to playtime favourites."
          href="/shop"
        />
        <CategoryTiles tiles={tiles} />
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <SectionHeading
          eyebrow="Loved by parents"
          title="Bestsellers"
          href="/shop?sort=popularity"
        />
        <ProductRail products={bestSellers} />
      </section>

      {/* Deals band */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-leaf-900 px-6 py-10 text-white sm:px-10">
          <div className="grain absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-200">
                Limited time
              </span>
              <h2 className="mt-1 text-[clamp(1.75rem,1rem+3vw,3rem)] text-white">
                Up to 50% off softness
              </h2>
              <p className="mt-1 text-sm text-leaf-100/80">
                Stock up on comfy essentials while they last.
              </p>
            </div>
            <Button asChild size="lg" variant="accent">
              <Link href="/shop?onSale=1">
                Shop deals <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="relative mt-8">
            <ProductRail products={deals} />
          </div>
        </div>
      </section>

      {/* Shop by age */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Just right" title="Shop by age" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {AGE_GROUPS.map((g) => (
            <Link
              key={g.label}
              href={`/shop?ageGroup=${encodeURIComponent(g.label)}`}
              className="group flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-leaf-300 hover:shadow-[var(--shadow-soft)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-leaf-100 font-display text-lg font-bold text-leaf-700">
                {g.label.split(" ")[0].split("–")[0]}
              </span>
              <span className="text-sm font-medium text-foreground">
                {g.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Fresh in"
          title="New arrivals"
          href="/shop?sort=newest"
        />
        <ProductRail products={newArrivals} />
      </section>
    </>
  );
}
