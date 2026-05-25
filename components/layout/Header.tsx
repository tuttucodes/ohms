"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, Search, ShoppingBag, X, Heart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SHOP_NAV } from "@/lib/config";
import { useCart, cartCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const count = cartCount(lines);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    setMenuOpen(false);
  };

  const navLink = (item: (typeof SHOP_NAV)[number]) => {
    const params = new URLSearchParams();
    if (item.category) params.set("category", item.category);
    if (item.subcategory) params.set("subcategory", item.subcategory);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        {/* Mobile menu trigger */}
        <button
          className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-surface-sunken lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Logo priority className="h-9 sm:h-11" />

        {/* Desktop search */}
        <form onSubmit={onSearch} className="ml-4 hidden flex-1 lg:block">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search soft & comfy picks…"
              className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/shop"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-sunken lg:inline-block"
          >
            Shop All
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-surface-sunken lg:hidden"
            onClick={() => router.push("/shop")}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/account"
            className="hidden h-10 w-10 place-items-center rounded-full text-foreground hover:bg-surface-sunken sm:grid"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <button
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-surface-sunken"
            aria-label={`Open bag, ${count} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[0.65rem] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop category strip */}
      <nav className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-6 pb-2 lg:flex">
        {SHOP_NAV.map((item) => (
          <Link
            key={item.label}
            href={navLink(item)}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-leaf-50 hover:text-leaf-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile menu */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-leaf-900/30 backdrop-blur-sm lg:hidden" />
          <Dialog.Content
            className="fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-xs flex-col bg-background shadow-[var(--shadow-lift)] outline-none lg:hidden data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
            aria-describedby={undefined}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <Dialog.Title asChild>
                <Logo className="h-9" href={null} />
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-sunken"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            <form onSubmit={onSearch} className="px-4 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm focus:border-leaf-500 focus:outline-none"
                />
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto px-2 py-2">
              {SHOP_NAV.map((item) => (
                <Link
                  key={item.label}
                  href={navLink(item)}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-[0.95rem] font-medium text-foreground",
                    "hover:bg-leaf-50 hover:text-leaf-700",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
