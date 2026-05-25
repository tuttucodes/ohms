import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { queryProducts } from "@/lib/data/products";
import { productImage, formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { Pagination } from "@/components/shop/Pagination";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Number(sp.page ?? "1") || 1;
  const result = queryProducts({
    search: q || undefined,
    page,
    pageSize: 20,
    sort: "newest",
  });

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total} products in the catalogue
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </Button>
      </header>

      <div className="mb-4">
        <AdminSearch
          initial={q}
          basePath="/admin/products"
          placeholder="Search products…"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="hidden px-4 py-3 sm:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="hidden px-4 py-3 sm:table-cell">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                      <Image
                        src={productImage(p.images[0], "thumb")}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="line-clamp-2 max-w-xs text-xs font-medium">
                      {p.name}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">
                  {p.subcategory}
                </td>
                <td className="px-4 py-3 font-semibold">{formatINR(p.price)}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {p.stock > 0 ? (
                    p.stock <= 5 ? (
                      <Badge variant="stock">{p.stock} left</Badge>
                    ) : (
                      p.stock
                    )
                  ) : (
                    <Badge variant="sale">Out</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-leaf-50 hover:text-leaf-700"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
