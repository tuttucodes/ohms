import { siteConfig } from "@/lib/config";

/** Shipping fee for a given subtotal (INR). Free above the threshold. */
export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= siteConfig.shipping.freeAbove ? 0 : siteConfig.shipping.flatFee;
}
