import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";

/**
 * Razorpay is optional at build/dev time. When keys are absent the checkout
 * runs in "test" mode: orders are created and can be marked paid without a live
 * gateway, so the full flow is demoable. Add keys to switch to real payments.
 */
export const razorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
);

export const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? "";

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/** Create a Razorpay order. `amountInRupees` is converted to paise. */
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string,
): Promise<RazorpayOrder> {
  if (!razorpayConfigured) {
    throw new Error("Razorpay is not configured");
  }
  const order = await getClient().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
    payment_capture: true,
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

/** Verify the checkout signature returned by Razorpay (HMAC-SHA256). */
export function verifyPaymentSignature(args: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  if (!razorpayConfigured) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
    .digest("hex");
  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(expected);
  const b = Buffer.from(args.signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Verify a webhook payload signature against the webhook secret. */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
