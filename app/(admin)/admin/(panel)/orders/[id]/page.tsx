import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrder } from "@/lib/data/orders";
import { formatINR, productImage } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-leaf-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl">{order.id}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
          <div className="mt-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <OrderStatusUpdater orderId={order.id} current={order.status} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
          <h2 className="font-display text-lg font-semibold">Customer</h2>
          <p className="mt-2 font-medium">{order.customer.name}</p>
          <p className="text-muted">{order.customer.email}</p>
          <p className="text-muted">{order.customer.phone}</p>
          <p className="mt-2 text-muted">
            {order.customer.address}, {order.customer.city},{" "}
            {order.customer.state} — {order.customer.pincode}
          </p>
        </section>

        <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
          <h2 className="font-display text-lg font-semibold">Payment</h2>
          <dl className="mt-2 space-y-1">
            <Row label="Subtotal" value={formatINR(order.subtotal)} />
            <Row
              label="Shipping"
              value={order.shipping === 0 ? "Free" : formatINR(order.shipping)}
            />
            <Row label="Total" value={formatINR(order.total)} strong />
            <Row
              label="Razorpay order"
              value={order.razorpayOrderId ?? "— (test mode)"}
            />
            <Row
              label="Payment ID"
              value={order.razorpayPaymentId ?? "—"}
            />
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold">
          Items ({order.items.length})
        </h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                <Image
                  src={productImage(item.image, "thumb")}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted">
                  {formatINR(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {formatINR(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className={strong ? "font-bold" : "truncate font-medium"}>{value}</dd>
    </div>
  );
}
