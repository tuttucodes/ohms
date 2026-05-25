"use client";

import { ChevronDown } from "lucide-react";
import { useShopParams } from "@/lib/useShopParams";

const OPTIONS: { value: string; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest discount" },
];

export function SortSelect() {
  const { params, setParam } = useShopParams();
  const value = params.get("sort") ?? "popularity";

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => setParam({ sort: e.target.value })}
        aria-label="Sort products"
        className="h-10 appearance-none rounded-full border border-border bg-surface pl-4 pr-9 text-sm font-medium text-foreground focus:border-leaf-500 focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
