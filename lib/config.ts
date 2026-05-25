// Central brand + store configuration.
// Everything customer-facing that isn't a product lives here so it's edited in one place.

export const siteConfig = {
  name: "OHMS",
  tagline: "Soft And Comfort",
  description:
    "OHMS makes soft, comfy, skin-friendly clothing and essentials for babies and kids. Thoughtfully designed, gentle on little ones, easy on parents.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ohms.example.com",
  // Placeholder contact details — replace with real OHMS details.
  contact: {
    email: "care@ohms.com",
    phone: "+91 90000 00000",
    whatsapp: "+91 90000 00000",
    address: "OHMS Retail Pvt. Ltd., Bengaluru, Karnataka, India",
  },
  social: {
    instagram: "https://instagram.com/ohms",
    facebook: "https://facebook.com/ohms",
    youtube: "https://youtube.com/@ohms",
  },
  // Free shipping threshold (INR) and flat fee below it.
  shipping: {
    freeAbove: 599,
    flatFee: 49,
  },
  currency: "INR",
} as const;

// Marketing copy for the announcement bar (rotates).
export const announcements = [
  "Free shipping on orders over ₹599",
  "Softest fabrics for the softest skin 🌿",
  "New arrivals every week — gentle on babies, kind to the planet",
];

// Ordered category navigation. `key` matches Product.category / subcategory.
export const SHOP_NAV: { label: string; category?: string; subcategory?: string }[] = [
  { label: "New In" },
  { label: "Bodysuits & Rompers", subcategory: "Onesies & Rompers" },
  { label: "T-shirts", subcategory: "T-shirts" },
  { label: "Nightwear", subcategory: "Nightwear" },
  { label: "Innerwear & Thermals", subcategory: "Inner Wear & Thermals" },
  { label: "Pyjamas & Leggings", subcategory: "Pajamas & Leggings" },
  { label: "Dresses", subcategory: "Frocks and Dresses" },
  { label: "Bottoms", subcategory: "Shorts, Skirts & Jeans" },
  { label: "Sets & Suits", subcategory: "Sets & Suits" },
  { label: "Caps & Mittens", subcategory: "Caps, Gloves & Mittens" },
  { label: "Bath & Towels", subcategory: "Bath Time" },
  { label: "Feeding", category: "Feeding & Nursing" },
];

export const AGE_GROUPS = [
  { label: "0–6 months", from: 0, to: 0.5 },
  { label: "6–12 months", from: 0.5, to: 1 },
  { label: "1–2 years", from: 1, to: 2 },
  { label: "2–4 years", from: 2, to: 4 },
  { label: "4+ years", from: 4, to: 99 },
] as const;
