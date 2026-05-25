import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Truck, Clock } from "lucide-react";
import { getOrder } from "@/lib/data/orders";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

const statusLabel: Record<string, string> = {
  pending: "Payment pending",
  paid: "Confirmed",
  failed: "Payment failed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const paid = order.status === "paid" || order.status === "shipped" || order.status === "delivered";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-100">
          {paid ? (
            <CheckCircle2 className="h-9 w-9 text-leaf-600" />
          ) : (
            <Clock className="h-9 w-9 text-amber-500" />
          )}
        </div>
        <h1 className="mt-5 text-3xl">
          {paid ? "Thank you!" : "Order received"}
        </h1>
        <p className="mt-2 text-muted">
          {paid
            ? "Your order is confirmed. We're getting it ready with love."
            : "We've recorded your order. Payment is still being confirmed."}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="rounded-full bg-surface-sunken px-3 py-1 font-mono text-sm">
            {order.id}
          </span>
          <Badge variant={paid ? "new" : "stock"}>
            {statusLabel[order.status] ?? order.status}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6 flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-surface px-6 py-5">
        {[
          [CheckCircle2, "Confirmed", paid],
          [Package, "Packed", false],
          [Truck, "Shipped", false],
        ].map(([Icon, label, done], i) => {
          const I = Icon as typeof Package;
          return (
            <div key={label as string} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  done ? "bg-leaf-600 text-white" : "bg-surface-sunken text-muted"
                }`}
              >
                <I className="h-5 w-5" />
              </span>
              <span className="text-xs text-muted">{label as string}</span>
            </div>
          );
        })}
      </div>

      {/* Items */}
      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.productId} className="flex gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm leading-snug">{item.name}</p>
                <p className="text-xs text-muted">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">
                {formatINR(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="text-foreground">{formatINR(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Shipping</dt>
            <dd className="text-foreground">
              {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <dt>Total paid</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
        <h2 className="font-display text-lg font-semibold">Delivering to</h2>
        <p className="mt-2 font-medium">{order.customer.name}</p>
        <p className="text-muted">
          {order.customer.address}, {order.customer.city}, {order.customer.state}{" "}
          — {order.customer.pincode}
        </p>
        <p className="text-muted">
          {order.customer.phone} · {order.customer.email}
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
