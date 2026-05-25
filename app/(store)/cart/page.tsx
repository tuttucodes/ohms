"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import {
  useCart,
  cartSubtotal,
  cartMrpTotal,
  shippingFor,
} from "@/lib/store/cart";
import { useHydrated } from "@/lib/useHydrated";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const hydrated = useHydrated();
  const { lines, setQuantity, remove } = useCart();
  const subtotal = cartSubtotal(lines);
  const mrpTotal = cartMrpTotal(lines);
  const saved = mrpTotal - subtotal;
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-48" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-leaf-50">
          <ShoppingBag className="h-11 w-11 text-leaf-400" />
        </div>
        <h1 className="mt-6 text-2xl">Your bag is empty</h1>
        <p className="mt-2 text-muted">
          Let&apos;s find something soft and comfy for your little one.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/shop">Browse the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl">Your bag</h1>
      <p className="mt-1 text-sm text-muted">
        {lines.length} {lines.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <ul className="space-y-3">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-3 sm:p-4"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-sunken">
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="line-clamp-2 text-sm font-medium leading-snug sm:text-base">
                  {line.name}
                </p>
                {line.size && (
                  <p className="mt-0.5 text-xs text-muted">Size: {line.size}</p>
                )}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-bold">{formatINR(line.price)}</span>
                  {line.mrp > line.price && (
                    <span className="text-xs text-muted line-through">
                      {formatINR(line.mrp)}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-foreground"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-foreground"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(line.productId)}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-coral-600"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="text-foreground">{formatINR(subtotal)}</dd>
              </div>
              {saved > 0 && (
                <div className="flex justify-between text-coral-600">
                  <dt>You save</dt>
                  <dd>− {formatINR(saved)}</dd>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd className="text-foreground">
                  {shipping === 0 ? "Free" : formatINR(shipping)}
                </dd>
              </div>
              {shipping > 0 && (
                <p className="rounded-xl bg-leaf-50 px-3 py-2 text-xs text-leaf-800">
                  Add {formatINR(siteConfig.shipping.freeAbove - subtotal)} more
                  for free shipping.
                </p>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-5 w-full">
              <Link href="/checkout">
                Checkout <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-muted hover:text-leaf-700"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
