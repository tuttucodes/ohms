"use client";

import { Check } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { AGE_GROUPS } from "@/lib/config";
import { useShopParams } from "@/lib/useShopParams";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: CategorySummary[];
  priceMax: number;
}

const PRICE_BANDS = [
  { label: "Under ₹200", min: 0, max: 199 },
  { label: "₹200 – ₹400", min: 200, max: 400 },
  { label: "₹400 – ₹600", min: 400, max: 600 },
  { label: "₹600 & above", min: 600, max: 100000 },
];

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const { params, setParam } = useShopParams();

  const activeCategory = params.get("category");
  const activeSub = params.get("subcategory");
  const activeAge = params.get("ageGroup");
  const onSale = params.get("onSale") === "1";
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  return (
    <div className="space-y-7">
      <FilterGroup title="Offers">
        <button
          onClick={() => setParam({ onSale: onSale ? null : "1" })}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border px-4 py-2.5 text-sm transition-colors",
            onSale
              ? "border-coral-500 bg-coral-100 text-coral-600"
              : "border-border text-foreground hover:border-leaf-300",
          )}
        >
          On sale only
          {onSale && <Check className="h-4 w-4" />}
        </button>
      </FilterGroup>

      <FilterGroup title="Category">
        <ul className="space-y-1">
          <FilterRow
            label="All products"
            active={!activeCategory && !activeSub}
            onClick={() => setParam({ category: null, subcategory: null })}
          />
          {categories.map((c) => (
            <li key={c.category}>
              <FilterRow
                label={c.category}
                count={c.count}
                active={activeCategory === c.category && !activeSub}
                onClick={() =>
                  setParam({ category: c.category, subcategory: null })
                }
              />
              {c.subcategories.length > 1 && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-border pl-3">
                  {c.subcategories.map((s) => (
                    <FilterRow
                      key={s.name}
                      label={s.name}
                      count={s.count}
                      small
                      active={activeSub === s.name}
                      onClick={() =>
                        setParam({ subcategory: s.name, category: null })
                      }
                    />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Age">
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((g) => (
            <button
              key={g.label}
              onClick={() =>
                setParam({ ageGroup: activeAge === g.label ? null : g.label })
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeAge === g.label
                  ? "border-leaf-600 bg-leaf-600 text-white"
                  : "border-border text-foreground hover:border-leaf-300",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="space-y-1">
          {PRICE_BANDS.map((b) => {
            const active =
              minPrice === String(b.min) && maxPrice === String(b.max);
            return (
              <FilterRow
                key={b.label}
                label={b.label}
                active={active}
                onClick={() =>
                  setParam(
                    active
                      ? { minPrice: null, maxPrice: null }
                      : { minPrice: b.min, maxPrice: b.max },
                  )
                }
              />
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-semibold text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterRow({
  label,
  count,
  active,
  onClick,
  small,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <li className="list-none">
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-left transition-colors",
          small ? "text-[0.8rem]" : "text-sm",
          active
            ? "bg-leaf-50 font-semibold text-leaf-700"
            : "text-foreground hover:bg-surface-sunken",
        )}
      >
        <span className="truncate">{label}</span>
        {typeof count === "number" && (
          <span className="text-xs text-muted">{count}</span>
        )}
      </button>
    </li>
  );
}
