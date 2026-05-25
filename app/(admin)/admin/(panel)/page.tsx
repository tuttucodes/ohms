import Link from "next/link";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getCatalogStats } from "@/lib/data/products";
import { listOrders } from "@/lib/data/orders";
import { formatINR } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const catalog = getCatalogStats();
  const orders = await listOrders();
  const paid = orders.filter((o) =>
    ["paid", "shipped", "delivered"].includes(o.status),
  );
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const recent = orders.slice(0, 6);

  const stats = [
    { label: "Revenue", value: formatINR(revenue), icon: IndianRupee, tone: "leaf" },
    { label: "Orders", value: String(orders.length), icon: ShoppingCart, tone: "leaf" },
    { label: "Products", value: String(catalog.total), icon: Package, tone: "leaf" },
    { label: "Pending", value: String(pending), icon: Clock, tone: "amber" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted">Welcome back — here&apos;s your store at a glance.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  s.tone === "amber"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-leaf-100 text-leaf-700"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm text-leaf-700 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
            {recent.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted">
                No orders yet. Place a test order from the storefront to see it here.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-xs text-leaf-700 hover:underline"
                        >
                          {o.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{o.customer.name}</td>
                      <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Catalog health */}
        <div>
          <h2 className="font-display text-xl font-semibold">Catalogue</h2>
          <div className="mt-3 space-y-3 rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <Stat label="In stock" value={catalog.inStock} icon={Package} />
            <Stat label="On sale" value={catalog.onSale} icon={TrendingUp} />
            <Stat label="Low stock (≤5)" value={catalog.lowStock} icon={Clock} />
            <Link
              href="/admin/products"
              className="mt-2 inline-flex items-center gap-1 text-sm text-leaf-700 hover:underline"
            >
              Manage products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4 text-leaf-600" /> {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
