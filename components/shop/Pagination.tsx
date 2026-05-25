"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-sunken disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {start > 1 && (
        <>
          <PageBtn n={1} active={page === 1} onClick={() => go(1)} />
          {start > 2 && <span className="px-1 text-muted">…</span>}
        </>
      )}
      {pages.map((p) => (
        <PageBtn key={p} n={p} active={p === page} onClick={() => go(p)} />
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted">…</span>}
          <PageBtn
            n={totalPages}
            active={page === totalPages}
            onClick={() => go(totalPages)}
          />
        </>
      )}
      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-sunken disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageBtn({
  n,
  active,
  onClick,
}: {
  n: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-medium transition-colors",
        active
          ? "bg-leaf-600 text-white"
          : "border border-border text-foreground hover:bg-surface-sunken",
      )}
    >
      {n}
    </button>
  );
}
