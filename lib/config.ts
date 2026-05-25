// Central brand + store configuration.
// Everything customer-facing that isn't a product lives here so it's edited in one place.

export const siteConfig = {
  name: "OHMS",
  legalName: "Ohms Fusion Knitwear India Private Limited",
  tagline: "Soft And Comfort",
  description:
    "OHMS makes soft, comfy, skin-friendly clothing and essentials for babies and kids. Knitted with care in Tirupur, India — gentle on little ones, easy on parents.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ohmsclothings.com",
  contact: {
    email: "info@ohmsclothings.com",
    phone: "+91 99948 99229",
    phoneAlt: "+91 99948 33328",
    whatsapp: "+91 99948 99229",
    address:
      "Ohms Fusion Knitwear India Pvt. Ltd., 6, Semmedu Thottam, Kangayam Road, Tirupur, Tamil Nadu, India – 641 604",
    city: "Tirupur",
  },
  founder: {
    name: "Manikandan Muthusamy",
    role: "Founder & Managing Director",
    linkedin: "https://www.linkedin.com/in/mkohms/",
  },
  social: {
    instagram: "https://instagram.com/ohmsclothings",
    facebook: "https://facebook.com/ohmsclothings",
    youtube: "https://youtube.com/@ohmsclothings",
    linkedin: "https://www.linkedin.com/in/mkohms/",
  },
  // Free shipping threshold (INR) and flat fee below it.
  shipping: {
    freeAbove: 599,
    flatFee: 49,
  },
  currency: "INR",
  developer: { name: "Kernel & Oak" },
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
