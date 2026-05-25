"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * URL is the source of truth for shop filters. This hook reads the current
 * params and returns a setter that merges changes and resets pagination.
 */
export function useShopParams() {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      // Any filter change resets to page 1.
      if (!("page" in updates)) next.delete("page");
      router.push(next.toString() ? `/shop?${next.toString()}` : "/shop", {
        scroll: false,
      });
    },
    [params, router],
  );

  return { params, setParam };
}
