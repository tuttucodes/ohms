import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductById, getCategorySummaries } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

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
      <h1 className="mb-1 text-3xl">Edit product</h1>
      <p className="mb-6 font-mono text-xs text-muted">{product.id}</p>
      <ProductForm
        product={product}
        categories={categories}
        subcategories={subcategories}
      />
    </div>
  );
}
