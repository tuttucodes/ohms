"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product } from "@/lib/types";
import { productImage } from "@/lib/utils";
import { shippingFor } from "@/lib/pricing";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === product.id,
          );
          if (existing) {
            // Immutable update — new array, new line object.
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.productId === product.id
                  ? { ...l, quantity: Math.min(l.quantity + quantity, 99) }
                  : l,
              ),
            };
          }
          const line: CartLine = {
            productId: product.id,
            name: product.name,
            image: productImage(product.images[0], "thumb"),
            price: product.price,
            mrp: product.mrp,
            size: product.size,
            quantity,
          };
          return { isOpen: true, lines: [...state.lines, line] };
        }),

      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId
                    ? { ...l, quantity: Math.min(quantity, 99) }
                    : l,
                ),
        })),

      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "ohms-cart" },
  ),
);

// ---- Derived selectors (pure helpers) ----

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function cartMrpTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.mrp * l.quantity, 0);
}

export { shippingFor };
