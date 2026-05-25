import Link from "next/link";
import { listOrders } from "@/lib/data/orders";
import { formatINR } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted">{orders.length} total orders</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-12 text-center">
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted">
            Place a test order from the storefront checkout to see it here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="hidden px-4 py-3 sm:table-cell">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="hidden px-4 py-3 md:table-cell">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-surface-sunken/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs text-leaf-700 hover:underline"
                    >
                      {o.id}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{o.customer.name}</span>
                    <span className="block text-xs text-muted">
                      {o.customer.city}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
