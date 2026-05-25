"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Remove "${name.slice(0, 40)}…"? Seed products are set out of stock.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      toast.success("Product removed");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      aria-label={`Delete ${name}`}
      className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-coral-100 hover:text-coral-600 disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
