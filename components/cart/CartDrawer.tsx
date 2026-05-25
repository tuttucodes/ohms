"use client";

import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  useCart,
  cartSubtotal,
  cartMrpTotal,
  shippingFor,
} from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { lines, isOpen, close, setQuantity, remove } = useCart();
  const subtotal = cartSubtotal(lines);
  const mrpTotal = cartMrpTotal(lines);
  const saved = mrpTotal - subtotal;
  const shipping = shippingFor(subtotal);
  const remainingForFree = siteConfig.shipping.freeAbove - subtotal;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-leaf-900/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-[var(--shadow-lift)] outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5 text-leaf-600" />
              Your Bag
              <span className="text-muted">({lines.length})</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-sunken"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-leaf-50">
                <ShoppingBag className="h-9 w-9 text-leaf-400" />
              </div>
              <div>
                <p className="text-lg font-semibold">Your bag is empty</p>
                <p className="mt-1 text-sm text-muted">
                  Soft, comfy picks are just a tap away.
                </p>
              </div>
              <Dialog.Close asChild>
                <Button asChild variant="primary">
                  <Link href="/shop">Start shopping</Link>
                </Button>
              </Dialog.Close>
            </div>
          ) : (
            <>
              {remainingForFree > 0 && (
                <div className="mx-5 mt-4 rounded-2xl bg-leaf-50 px-4 py-2.5 text-sm text-leaf-800">
                  Add <strong>{formatINR(remainingForFree)}</strong> more for free
                  shipping 🌿
                </div>
              )}

              <ul className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
                {lines.map((line) => (
                  <li
                    key={line.productId}
                    className="flex gap-3 rounded-2xl p-2 transition-colors hover:bg-surface-sunken"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 text-sm font-medium leading-snug">
                        {line.name}
                      </p>
                      {line.size && (
                        <p className="mt-0.5 text-xs text-muted">{line.size}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            onClick={() =>
                              setQuantity(line.productId, line.quantity - 1)
                            }
                            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(line.productId, line.quantity + 1)
                            }
                            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold">
                          {formatINR(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(line.productId)}
                      className="self-start text-muted/70 hover:text-coral-600"
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <footer className="border-t border-border px-5 py-4">
                {saved > 0 && (
                  <p className="mb-2 text-center text-sm font-medium text-coral-600">
                    You save {formatINR(saved)} 🎉
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Shipping</span>
                  <span className="text-foreground">
                    {shipping === 0 ? "Free" : formatINR(shipping)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatINR(subtotal + shipping)}</span>
                </div>
                <Dialog.Close asChild>
                  <Button asChild variant="primary" size="lg" className="mt-4 w-full">
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button asChild variant="ghost" size="sm" className="mt-1 w-full">
                    <Link href="/cart">View full bag</Link>
                  </Button>
                </Dialog.Close>
              </footer>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
