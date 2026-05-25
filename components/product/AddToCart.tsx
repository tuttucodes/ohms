"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    add(product, qty);
    toast.success(`Added ${qty} × ${product.name.slice(0, 30)}… to your bag`);
  };

  const handleBuyNow = () => {
    add(product, qty);
    router.push("/checkout");
  };

  if (outOfStock) {
    return (
      <Button variant="soft" size="lg" disabled className="w-full">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-12 w-12 place-items-center rounded-full text-muted hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="grid h-12 w-12 place-items-center rounded-full text-muted hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={handleAdd} variant="primary" size="lg" className="flex-1">
          <ShoppingBag className="h-5 w-5" />
          Add to bag
        </Button>
      </div>
      <Button onClick={handleBuyNow} variant="dark" size="lg" className="w-full">
        <Zap className="h-5 w-5" />
        Buy it now
      </Button>
      {product.stock <= 5 && (
        <p className="text-center text-xs font-medium text-coral-600">
          Only {product.stock} left — order soon!
        </p>
      )}
    </div>
  );
}
