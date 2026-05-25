"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface AdminSearchProps {
  initial?: string;
  placeholder?: string;
  basePath: string;
}

export function AdminSearch({ initial = "", placeholder, basePath }: AdminSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="h-10 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm focus:border-leaf-500 focus:outline-none"
      />
    </form>
  );
}
