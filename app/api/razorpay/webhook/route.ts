import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { getOrderByRazorpayId, updateOrder } from "@/lib/data/orders";

/**
 * Razorpay webhook. Configure the endpoint + secret in the Razorpay dashboard
 * (RAZORPAY_WEBHOOK_SECRET). Handles payment.captured / payment.failed so order
 * status is correct even if the browser never returns from checkout.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const body = await request.text();

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  let event: { event?: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const entity = (
    event.payload?.payment as { entity?: Record<string, unknown> } | undefined
  )?.entity;
  const razorpayOrderId = entity?.order_id as string | undefined;
  const paymentId = entity?.id as string | undefined;

  if (razorpayOrderId) {
    const order = await getOrderByRazorpayId(razorpayOrderId);
    if (order) {
      if (event.event === "payment.captured") {
        await updateOrder(order.id, {
          status: "paid",
          razorpayPaymentId: paymentId ?? null,
        });
      } else if (event.event === "payment.failed") {
        await updateOrder(order.id, { status: "failed" });
      }
    }
  }

  return NextResponse.json({ success: true });
}
