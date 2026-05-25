"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { Button } from "@/components/ui/button";

interface MobileFiltersProps {
  categories: CategorySummary[];
  priceMax: number;
  total: number;
}

export function MobileFilters({
  categories,
  priceMax,
  total,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-leaf-900/30 backdrop-blur-sm lg:hidden" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[88vh] flex-col rounded-t-[var(--radius-card)] bg-background lg:hidden data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="font-display text-lg font-semibold">
              Filters
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-sunken"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FilterSidebar categories={categories} priceMax={priceMax} />
          </div>
          <div className="border-t border-border p-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Show {total} results
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
