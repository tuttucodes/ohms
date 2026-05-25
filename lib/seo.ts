import { siteConfig } from "@/lib/config";
import { productImage, productSlug } from "@/lib/utils";
import type { Product } from "@/lib/types";

const base = siteConfig.url.replace(/\/$/, "");

/** Organization schema — brand identity for search engines. */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: base,
    logo: `${base}/ohms-logo.png`,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    founder: { "@type": "Person", name: siteConfig.founder.name },
    address: {
      "@type": "PostalAddress",
      streetAddress: "6, Semmedu Thottam, Kangayam Road",
      addressLocality: "Tirupur",
      addressRegion: "Tamil Nadu",
      postalCode: "641604",
      addressCountry: "IN",
    },
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.facebook,
      siteConfig.social.linkedin,
    ],
  };
}

/** WebSite schema with a sitelinks search box pointing at the shop. */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Product schema with offer + optional rating. */
export function productSchema(product: Product): Record<string, unknown> {
  const url = `${base}/product/${productSlug(product.name, product.id)}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.slice(0, 4).map((img) => productImage(img, "full")),
    sku: product.id,
    brand: { "@type": "Brand", name: siteConfig.name },
    category: `${product.category} > ${product.subcategory}`,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (product.rating > 0 && product.reviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviews,
    };
  }
  return schema;
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}
