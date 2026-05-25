import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Order, OrderStatus, OrderItem, CustomerInfo } from "@/lib/types";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

/*
  Order store with two backends:
  - Supabase (when configured) — durable, production.
  - Local JSON file (.data/orders.json) — zero-config local/dev fallback.

  Note: the file backend persists only on a writable filesystem (local dev).
  On serverless hosting, configure Supabase for durable orders.
*/

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function readFileOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeFileOrders(orders: Order[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export interface NewOrderInput {
  items: OrderItem[];
  customer: CustomerInfo;
  subtotal: number;
  shipping: number;
  total: number;
  razorpayOrderId?: string | null;
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const now = new Date().toISOString();
  const order: Order = {
    id: `OHMS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
    items: input.items,
    customer: input.customer,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    status: "pending",
    razorpayOrderId: input.razorpayOrderId ?? null,
    razorpayPaymentId: null,
    createdAt: now,
    updatedAt: now,
  };

  if (supabaseConfigured) {
    const db = getSupabaseAdmin()!;
    const { error } = await db.from("orders").insert(toRow(order));
    if (error) throw new Error(`Failed to create order: ${error.message}`);
    return order;
  }

  const orders = await readFileOrders();
  orders.unshift(order);
  await writeFileOrders(orders);
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (supabaseConfigured) {
    const db = getSupabaseAdmin()!;
    const { data } = await db.from("orders").select("*").eq("id", id).single();
    return data ? fromRow(data) : null;
  }
  const orders = await readFileOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrderByRazorpayId(
  razorpayOrderId: string,
): Promise<Order | null> {
  if (supabaseConfigured) {
    const db = getSupabaseAdmin()!;
    const { data } = await db
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();
    return data ? fromRow(data) : null;
  }
  const orders = await readFileOrders();
  return orders.find((o) => o.razorpayOrderId === razorpayOrderId) ?? null;
}

export async function listOrders(): Promise<Order[]> {
  if (supabaseConfigured) {
    const db = getSupabaseAdmin()!;
    const { data } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map(fromRow);
  }
  return readFileOrders();
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<Order, "status" | "razorpayPaymentId" | "razorpayOrderId">>,
): Promise<Order | null> {
  const updatedAt = new Date().toISOString();
  if (supabaseConfigured) {
    const db = getSupabaseAdmin()!;
    const row: Record<string, unknown> = { updated_at: updatedAt };
    if (patch.status) row.status = patch.status;
    if ("razorpayPaymentId" in patch) row.razorpay_payment_id = patch.razorpayPaymentId;
    if ("razorpayOrderId" in patch) row.razorpay_order_id = patch.razorpayOrderId;
    const { data, error } = await db
      .from("orders")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }
  const orders = await readFileOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  // Immutable update — replace the entry with a new object.
  const next: Order = { ...orders[idx], ...patch, updatedAt };
  const copy = [...orders];
  copy[idx] = next;
  await writeFileOrders(copy);
  return next;
}

export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  return updateOrder(id, { status });
}

// ---- Supabase row mapping (snake_case columns) ----

function toRow(o: Order) {
  return {
    id: o.id,
    items: o.items,
    customer: o.customer,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    razorpay_order_id: o.razorpayOrderId,
    razorpay_payment_id: o.razorpayPaymentId,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

function fromRow(r: Record<string, unknown>): Order {
  return {
    id: r.id as string,
    items: (r.items as OrderItem[]) ?? [],
    customer: r.customer as CustomerInfo,
    subtotal: Number(r.subtotal),
    shipping: Number(r.shipping),
    total: Number(r.total),
    status: r.status as OrderStatus,
    razorpayOrderId: (r.razorpay_order_id as string) ?? null,
    razorpayPaymentId: (r.razorpay_payment_id as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
