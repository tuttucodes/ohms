import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validation";
import { getProductById } from "@/lib/data/products";
import { createOrder, updateOrder } from "@/lib/data/orders";
import { shippingFor } from "@/lib/pricing";
import {
  razorpayConfigured,
  razorpayKeyId,
  createRazorpayOrder,
} from "@/lib/razorpay";
import { productImage } from "@/lib/utils";
import type { OrderItem } from "@/lib/types";

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body");
  }

  const parsed = createOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid order data");
  }

  // Re-price every line on the server — never trust client-sent prices.
  const items: OrderItem[] = [];
  for (const line of parsed.data.items) {
    const product = getProductById(line.productId);
    if (!product) return fail(`Product ${line.productId} is unavailable`);
    if (product.stock <= 0) return fail(`${product.name} is out of stock`);
    items.push({
      productId: product.id,
      name: product.name,
      image: productImage(product.images[0], "thumb"),
      price: product.price,
      quantity: line.quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const total = Math.round(subtotal + shipping);

  try {
    const order = await createOrder({
      items,
      customer: parsed.data.customer,
      subtotal,
      shipping,
      total,
    });

    if (razorpayConfigured) {
      const rp = await createRazorpayOrder(total, order.id);
      await updateOrder(order.id, { razorpayOrderId: rp.id });
      return NextResponse.json({
        success: true,
        data: {
          mode: "live",
          orderId: order.id,
          razorpayOrderId: rp.id,
          amount: rp.amount,
          currency: rp.currency,
          keyId: razorpayKeyId,
          total,
        },
      });
    }

    // Test mode — no gateway keys yet. The client confirms directly.
    return NextResponse.json({
      success: true,
      data: { mode: "test", orderId: order.id, amount: total * 100, total },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return fail(message, 500);
  }
}
