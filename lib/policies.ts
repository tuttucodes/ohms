import { siteConfig } from "@/lib/config";

export interface Policy {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}

// Placeholder policy copy — review with your legal/ops team before launch.
export const POLICIES: Record<string, Policy> = {
  shipping: {
    slug: "shipping",
    title: "Shipping & Delivery",
    updated: "2026",
    sections: [
      {
        heading: "Delivery timelines",
        body: [
          "Orders are processed within 1–2 business days. Standard delivery takes 3–7 business days depending on your location.",
          "You'll receive tracking details by email and SMS once your order ships.",
        ],
      },
      {
        heading: "Shipping charges",
        body: [
          `Shipping is free on orders over ₹${siteConfig.shipping.freeAbove}. A flat fee of ₹${siteConfig.shipping.flatFee} applies to smaller orders.`,
        ],
      },
      {
        heading: "Serviceable areas",
        body: [
          "We currently ship across India. Enter your pincode at checkout to confirm serviceability.",
        ],
      },
    ],
  },
  returns: {
    slug: "returns",
    title: "Returns & Exchange",
    updated: "2026",
    sections: [
      {
        heading: "15-day returns",
        body: [
          "Most items can be returned within 15 days of delivery, provided they are unused, unwashed and have original tags intact.",
        ],
      },
      {
        heading: "How to return",
        body: [
          `Email ${siteConfig.contact.email} with your order ID to start a return. We'll arrange a pickup where available.`,
          "Refunds are issued to the original payment method within 5–7 business days of the returned item passing quality checks.",
        ],
      },
      {
        heading: "Non-returnable items",
        body: [
          "For hygiene reasons, innerwear and certain bath items are not eligible for return unless received damaged or defective.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "We collect the details you provide at checkout (name, contact, address) to fulfil orders, and limited usage data to improve the store.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Your information is used to process orders, provide support, and send order updates. We never sell your personal data.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "Payments are processed securely by Razorpay. We do not store card details on our servers.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    updated: "2026",
    sections: [
      {
        heading: "Using OHMS",
        body: [
          "By placing an order you agree to provide accurate information and to use the store for lawful purposes only.",
        ],
      },
      {
        heading: "Pricing & availability",
        body: [
          "Prices and availability are subject to change. We reserve the right to cancel orders affected by pricing errors or stock issues, with a full refund.",
        ],
      },
      {
        heading: "Contact",
        body: [`Questions about these terms? Reach us at ${siteConfig.contact.email}.`],
      },
    ],
  },
};

export const POLICY_SLUGS = Object.keys(POLICIES);
