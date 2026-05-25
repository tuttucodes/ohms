"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Plus, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { productImage, productSlug, ageLabel, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/product/Price";
import { useCart } from "@/lib/store/cart";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority, className }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const [hovered, setHovered] = useState(false);

  const href = `/product/${productSlug(product.name, product.id)}`;
  const primary = productImage(product.images[0], "card");
  const secondary = product.images[1]
    ? productImage(product.images[1], "card")
    : primary;
  const outOfStock = product.stock <= 0;

  return (
    <article
      className={cn("group relative flex flex-col", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-surface-sunken shadow-[var(--shadow-soft)] transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            priority={priority}
            className={cn(
              "object-cover transition-opacity duration-500",
              hovered && secondary !== primary ? "opacity-0" : "opacity-100",
            )}
          />
          {secondary !== primary && (
            <Image
              src={secondary}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className={cn(
                "scale-105 object-cover transition-opacity duration-500",
                hovered ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {/* Top-left tags */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.discountPct > 0 && (
              <Badge variant="sale">{product.discountPct}% OFF</Badge>
            )}
            {product.premium && <Badge variant="new">Premium</Badge>}
          </div>

          {/* Age chip */}
          <div className="absolute right-3 top-3">
            <Badge variant="outline" className="bg-surface/85 backdrop-blur">
              {ageLabel(product.ageFromYears, product.ageToYears)}
            </Badge>
          </div>

          {outOfStock && (
            <div className="absolute inset-0 grid place-items-center bg-surface/55 backdrop-blur-[1px]">
              <span className="rounded-full bg-leaf-900/85 px-4 py-1.5 text-xs font-semibold text-white">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Quick add — appears on hover (desktop), always tappable on mobile */}
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => add(product)}
        aria-label={`Add ${product.name} to bag`}
        className={cn(
          "absolute right-3 bottom-[5.5rem] z-10 grid h-11 w-11 place-items-center rounded-full bg-leaf-600 text-white shadow-[var(--shadow-lift)] transition-all duration-300",
          "hover:bg-leaf-700 active:scale-95 disabled:opacity-0",
          "sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100",
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>

      <div className="mt-3 flex flex-col gap-1.5 px-0.5">
        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="truncate">{product.subcategory}</span>
          {product.rating > 0 && (
            <span className="ml-auto inline-flex items-center gap-0.5 text-leaf-700">
              <Star className="h-3 w-3 fill-current" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-leaf-700">
            {product.name}
          </h3>
        </Link>
        <Price price={product.price} mrp={product.mrp} size="sm" className="mt-0.5" />
      </div>
    </article>
  );
}
