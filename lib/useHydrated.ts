"use client";

import { useEffect, useState } from "react";

/** True after the first client render — gates persisted (localStorage) state
 * to avoid SSR/client hydration mismatches. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
