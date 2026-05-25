import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees, no decimals for whole amounts. */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Base URL for product images.
 * Defaults to the source CDN so the catalogue renders immediately.
 * Set NEXT_PUBLIC_IMAGE_BASE to a self-hosted/Supabase Storage origin to migrate.
 */
const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE ??
  "https://cdn.fcglcdn.com/brainbees/images/products";

export type ImageSize = "thumb" | "card" | "full";

const SIZE_PATH: Record<ImageSize, string> = {
  thumb: "219x265",
  card: "360x435",
  full: "600x800",
};

/** Build a full image URL for a stored filename at the requested size. */
export function productImage(
  filename: string | undefined,
  size: ImageSize = "card",
): string {
  if (!filename) return "/placeholder-product.svg";
  // Already an absolute or rooted URL (self-hosted) — return as-is.
  if (filename.startsWith("http") || filename.startsWith("/")) return filename;
  return `${IMAGE_BASE}/${SIZE_PATH[size]}/${filename}`;
}

/** Human label for an age range expressed in years (0.12 == ~1 year fractional). */
export function ageLabel(fromYears: number, toYears: number): string {
  const toMonths = (y: number) => Math.round(y * 12);
  const f = toMonths(fromYears);
  const t = toMonths(toYears);
  const fmt = (m: number) =>
    m >= 12 && m % 12 === 0 ? `${m / 12}y` : `${m}m`;
  if (f === 0 && t === 0) return "All ages";
  if (f === t) return fmt(t);
  return `${fmt(f)}–${fmt(t)}`;
}

/** Discount percentage from mrp/price, floored. */
export function discountPercent(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Stable URL slug from a product name + id. */
export function productSlug(name: string, id: string): string {
  const base = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base}-${id}`;
}

/** Extract the product id from a slug produced by productSlug. */
export function idFromSlug(slug: string): string {
  const m = slug.match(/-(\d+)$/);
  return m ? m[1] : slug;
}
