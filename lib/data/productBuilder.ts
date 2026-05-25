import type { Product } from "@/lib/types";
import type { ProductInput } from "@/lib/validation";
import { discountPercent } from "@/lib/utils";

/** Map a validated admin product input onto a full Product, deriving discount. */
export function buildProduct(input: ProductInput, id: string): Product {
  return {
    id,
    name: input.name,
    description: input.description,
    mrp: input.mrp,
    price: input.price,
    discountPct: discountPercent(input.mrp, input.price),
    clubPrice: input.price,
    stock: input.stock,
    category: input.category,
    subcategory: input.subcategory,
    ageFromYears: input.ageFromYears,
    ageToYears: input.ageToYears,
    size: input.size ?? "",
    colorHex: input.colorHex ?? "",
    colorCount: 1,
    sizeCount: 1,
    rating: 0,
    reviews: 0,
    ratingDist: [],
    bestseller: false,
    premium: input.premium ?? false,
    images: input.images,
  };
}
