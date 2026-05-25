"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  function track(e: React.FormEvent) {
    e.preventDefault();
    const id = orderId.trim();
    if (id) router.push(`/order/${id}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-100 text-leaf-700">
          <PackageSearch className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl">Track your order</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your order ID (from your confirmation) to view its status.
        </p>
        <form onSubmit={track} className="mt-6 space-y-3 text-left">
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="OHMS-XXXXX-XXXX"
          />
          <Button type="submit" size="lg" className="w-full">
            Track order
          </Button>
        </form>
      </div>
    </div>
  );
}
