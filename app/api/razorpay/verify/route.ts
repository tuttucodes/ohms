import { NextResponse } from "next/server";
import { verifyOrderSchema } from "@/lib/validation";
import { getOrder, updateOrder } from "@/lib/data/orders";
import { razorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";

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

  const parsed = verifyOrderSchema.safeParse(payload);
  if (!parsed.success) return fail("Invalid verification data");
  const { orderId, razorpayOrderId, razorpayPaymentId, signature, test } =
    parsed.data;

  const order = await getOrder(orderId);
  if (!order) return fail("Order not found", 404);
  if (order.status === "paid") {
    return NextResponse.json({ success: true, data: { orderId } });
  }

  // Live mode — require a valid Razorpay signature.
  if (razorpayConfigured) {
    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return fail("Missing payment verification fields");
    }
    // Cross-check the client-supplied Razorpay order id against the one stored
    // for this order — prevents reusing a valid payment from a different order.
    if (order.razorpayOrderId !== razorpayOrderId) {
      return fail("Order id mismatch", 400);
    }
    const valid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    });
    if (!valid) {
      await updateOrder(orderId, { status: "failed" });
      return fail("Payment signature verification failed", 402);
    }
    await updateOrder(orderId, { status: "paid", razorpayPaymentId });
    return NextResponse.json({ success: true, data: { orderId } });
  }

  // Test mode — gateway not configured. Only allow the demo confirmation path
  // when keys are genuinely absent, so this can never bypass real payments.
  if (test) {
    await updateOrder(orderId, { status: "paid" });
    return NextResponse.json({
      success: true,
      data: { orderId, mode: "test" },
    });
  }

  return fail("Payment could not be verified");
}
