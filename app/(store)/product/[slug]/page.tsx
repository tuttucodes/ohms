import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star, Truck, RefreshCw, ShieldCheck, Leaf } from "lucide-react";
import { getProductById, getRelated } from "@/lib/data/products";
import { idFromSlug, productImage, ageLabel, productSlug } from "@/lib/utils";
import { Price } from "@/components/product/Price";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema, breadcrumbSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductById(idFromSlug(slug));
  if (!product) return { title: "Product not found" };
  const canonical = `/product/${productSlug(product.name, product.id)}`;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      url: canonical,
      images: [productImage(product.images[0], "full")],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductById(idFromSlug(slug));
  if (!product) notFound();

  const related = getRelated(product, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          {
            name: product.subcategory,
            path: `/shop?subcategory=${encodeURIComponent(product.subcategory)}`,
          },
          { name: product.name, path: `/product/${productSlug(product.name, product.id)}` },
        ])}
      />
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-leaf-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-leaf-700">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/shop?subcategory=${encodeURIComponent(product.subcategory)}`}
          className="hover:text-leaf-700"
        >
          {product.subcategory}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="leaf">{product.subcategory}</Badge>
            {product.discountPct > 0 && (
              <Badge variant="sale">{product.discountPct}% OFF</Badge>
            )}
            {product.premium && <Badge variant="new">Premium</Badge>}
          </div>

          <h1 className="mt-3 text-[clamp(1.5rem,1rem+2vw,2.25rem)] leading-tight">
            {product.name}
          </h1>

          {product.rating > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2 py-0.5 font-semibold text-leaf-700">
                <Star className="h-3.5 w-3.5 fill-current" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-muted">{product.reviews} reviews</span>
            </div>
          )}

          <div className="mt-5">
            <Price price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
          </div>

          {/* Attributes */}
          <dl className="mt-6 grid grid-cols-2 gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 text-sm">
            <Attr label="Age" value={ageLabel(product.ageFromYears, product.ageToYears)} />
            {product.size && <Attr label="Size" value={product.size} />}
            {product.colorHex && (
              <div className="flex items-center gap-2">
                <dt className="text-muted">Colour</dt>
                <dd>
                  <span
                    className="inline-block h-5 w-5 rounded-full border border-border align-middle"
                    style={{ background: `#${product.colorHex}` }}
                  />
                </dd>
              </div>
            )}
            <Attr label="In stock" value={product.stock > 0 ? `${product.stock} units` : "—"} />
          </dl>

          <div className="mt-6">
            <AddToCart product={product} />
          </div>

          {/* Trust badges */}
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              [Truck, "Free over ₹599"],
              [RefreshCw, "15-day returns"],
              [ShieldCheck, "Secure payment"],
              [Leaf, "Skin-friendly"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Truck;
              return (
                <li key={label as string} className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-sunken py-3 text-center text-xs text-muted">
                  <I className="h-5 w-5 text-leaf-600" />
                  {label as string}
                </li>
              );
            })}
          </ul>

          {/* Description */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">Product details</h2>
            <p className="mt-2 text-pretty leading-relaxed text-foreground/80">
              {product.description}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" /> Soft, breathable fabric that is gentle on delicate skin.</li>
              <li className="flex gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" /> Designed for all-day comfort and easy movement.</li>
              <li className="flex gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" /> Easy-care: machine washable, holds colour and shape.</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            eyebrow="You may also like"
            title="Complete the look"
            href={`/shop?subcategory=${encodeURIComponent(product.subcategory)}`}
          />
          <ProductRail products={related} />
        </section>
      )}
    </div>
  );
}

function Attr({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
