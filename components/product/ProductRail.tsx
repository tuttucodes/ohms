import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductRailProps {
  products: Product[];
}

/** Horizontal, snap-scrolling row of products. Mobile-first, no JS needed. */
export function ProductRail({ products }: ProductRailProps) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          priority={i < 3}
          className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]"
        />
      ))}
    </div>
  );
}
