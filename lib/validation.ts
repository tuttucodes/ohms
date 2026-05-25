import { z } from "zod";

/** A cart line as sent from the client — only id + quantity are trusted. */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  address: z.string().trim().min(6, "Enter your full address").max(240),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a valid 6-digit pincode"),
});

export const createOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Your bag is empty"),
  customer: customerSchema,
});

export const verifyOrderSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  signature: z.string().optional(),
  test: z.boolean().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Admin product create/edit payload. discountPct is derived server-side. */
export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(2000),
  price: z.number().min(0),
  mrp: z.number().min(0),
  stock: z.number().int().min(0),
  category: z.string().trim().min(2).max(80),
  subcategory: z.string().trim().min(2).max(80),
  size: z.string().trim().max(120).optional().default(""),
  colorHex: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{6}$/, "Use a 6-digit hex (no #)")
    .optional()
    .or(z.literal("")),
  ageFromYears: z.number().min(0).max(99),
  ageToYears: z.number().min(0).max(99),
  images: z.array(z.string().trim().min(1)).min(1, "Add at least one image"),
  premium: z.boolean().optional().default(false),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "failed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export type ProductInput = z.infer<typeof productInputSchema>;
