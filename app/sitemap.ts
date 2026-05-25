import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getAllProducts } from "@/lib/data/products";
import { productSlug } from "@/lib/utils";
import { POLICY_SLUGS } from "@/lib/policies";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const policies: MetadataRoute.Sitemap = POLICY_SLUGS.map((slug) => ({
    url: `${base}/policies/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const products: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${base}/product/${productSlug(p.name, p.id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...policies, ...products];
}
