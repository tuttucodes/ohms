// Core domain types for the OHMS store.
// Kept framework-agnostic so the same shapes flow through the data layer,
// API routes, and UI components.

export interface Product {
  id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  discountPct: number;
  clubPrice: number;
  stock: number;
  category: string;
  subcategory: string;
  ageFromYears: number;
  ageToYears: number;
  size: string;
  colorHex: string;
  colorCount: number;
  sizeCount: number;
  rating: number;
  reviews: number;
  ratingDist: number[];
  bestseller: boolean;
  premium: boolean;
  images: string[];
}

export interface CartLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  size: string;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: CustomerInfo;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  ageGroup?: string;
  onSale?: boolean;
  sort?: "popularity" | "price-asc" | "price-desc" | "discount" | "newest";
  page?: number;
  pageSize?: number;
}

export interface ProductPage {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategorySummary {
  category: string;
  count: number;
  subcategories: { name: string; count: number }[];
}
