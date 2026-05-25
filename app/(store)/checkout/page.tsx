import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted">
        Almost there — just your delivery details.
      </p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
