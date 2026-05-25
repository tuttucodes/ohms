import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategorySummaries } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  const summaries = getCategorySummaries();
  const categories = summaries.map((s) => s.category);
  const subcategories = summaries.flatMap((s) =>
    s.subcategories.map((sub) => sub.name),
  );

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-leaf-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-6 text-3xl">Add product</h1>
      <ProductForm categories={categories} subcategories={subcategories} />
    </div>
  );
}
