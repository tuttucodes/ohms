"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useCart,
  cartSubtotal,
  cartMrpTotal,
  shippingFor,
} from "@/lib/store/cart";
import { useHydrated } from "@/lib/useHydrated";
import { customerSchema, type CustomerInput } from "@/lib/validation";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { loadRazorpay, type RazorpayResponse } from "@/lib/loadRazorpay";

const FIELDS: {
  name: keyof CustomerInput;
  label: string;
  placeholder: string;
  type?: string;
  half?: boolean;
}[] = [
  { name: "name", label: "Full name", placeholder: "Priya Sharma" },
  { name: "email", label: "Email", placeholder: "you@email.com", type: "email" },
  { name: "phone", label: "Phone", placeholder: "10-digit mobile", half: true },
  { name: "pincode", label: "Pincode", placeholder: "560001", half: true },
  { name: "address", label: "Address", placeholder: "House no, street, area" },
  { name: "city", label: "City", placeholder: "Bengaluru", half: true },
  { name: "state", label: "State", placeholder: "Karnataka", half: true },
];

export function CheckoutForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { lines, clear } = useCart();
  const [form, setForm] = useState<CustomerInput>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotal(lines);
  const saved = cartMrpTotal(lines) - subtotal;
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (!hydrated) {
    return <Skeleton className="h-[28rem] w-full" />;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center">
        <p className="text-lg font-semibold">Your bag is empty</p>
        <Button asChild className="mt-4">
          <a href="/shop">Browse products</a>
        </Button>
      </div>
    );
  }

  const update = (key: keyof CustomerInput, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function handlePay() {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: parsed.data,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Could not start payment");

      const data = json.data;

      if (data.mode === "test") {
        // No gateway keys configured — confirm the demo order directly.
        await confirm(data.orderId, { test: true });
        return;
      }

      // Live Razorpay checkout.
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment gateway");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: siteConfig.name,
        description: "OHMS order",
        order_id: data.razorpayOrderId,
        image: "/logo-mark.svg",
        prefill: {
          name: parsed.data.name,
          email: parsed.data.email,
          contact: parsed.data.phone,
        },
        theme: { color: "#5aa630" },
        handler: (response: RazorpayResponse) =>
          confirm(data.orderId, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast.message("Payment cancelled");
          },
        },
      });
      rzp.open();
    } catch (error: unknown) {
      setSubmitting(false);
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    }
  }

  async function confirm(
    orderId: string,
    proof: Record<string, string | boolean>,
  ) {
    try {
      const res = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...proof }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Verification failed");
      clear();
      router.push(`/order/${orderId}`);
    } catch (error: unknown) {
      setSubmitting(false);
      toast.error(error instanceof Error ? error.message : "Verification failed");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Form */}
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold">Delivery details</h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.half ? "col-span-1" : "col-span-2"}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {f.label}
              </label>
              <Input
                type={f.type ?? "text"}
                value={form[f.name]}
                placeholder={f.placeholder}
                onChange={(e) => update(f.name, e.target.value)}
                aria-invalid={!!errors[f.name]}
                className={errors[f.name] ? "border-coral-500" : ""}
              />
              {errors[f.name] && (
                <p className="mt-1 text-xs text-coral-600">{errors[f.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Your order</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                  <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-leaf-700 text-[0.65rem] font-bold text-white">
                    {l.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs leading-snug">{l.name}</p>
                  <p className="mt-0.5 text-xs font-semibold">
                    {formatINR(l.price * l.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="text-foreground">{formatINR(subtotal)}</dd>
            </div>
            {saved > 0 && (
              <div className="flex justify-between text-coral-600">
                <dt>Savings</dt>
                <dd>− {formatINR(saved)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <dt>Shipping</dt>
              <dd className="text-foreground">
                {shipping === 0 ? "Free" : formatINR(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          <Button
            onClick={handlePay}
            disabled={submitting}
            size="lg"
            className="mt-5 w-full"
          >
            <Lock className="h-4 w-4" />
            {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-leaf-600" />
            Secured by Razorpay · UPI, cards, netbanking
          </p>
        </div>
      </aside>
    </div>
  );
}
