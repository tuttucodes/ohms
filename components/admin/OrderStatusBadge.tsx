import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

const MAP: Record<OrderStatus, "new" | "sale" | "stock" | "leaf" | "outline"> = {
  paid: "new",
  delivered: "new",
  shipped: "leaf",
  pending: "stock",
  failed: "sale",
  cancelled: "outline",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={MAP[status] ?? "outline"}>{status}</Badge>;
}
