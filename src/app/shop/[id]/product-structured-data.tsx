// src/app/shop/[id]/product-structured-data.tsx
/**
 * Server component that renders Product + BreadcrumbList JSON-LD
 * for the product detail page.
 *
 * Rendered alongside <ProductView /> so structured data is in the
 * initial HTML (critical for SEO crawlers).
 */

import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import type { Product } from "@/types/printful_product";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://selsa.com";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

/**
 * Resolve a translatable name field to a plain string.
 */
function resolveName(
  name: string | { en?: string; ti?: string } | undefined | null
): string {
  if (!name) return "Product";
  if (typeof name === "string") return name;
  return name.en || Object.values(name).filter(Boolean)[0] || "Product";
}

function resolveDescription(
  desc: string | { en?: string; ti?: string } | undefined | null
): string | undefined {
  if (!desc) return undefined;
  if (typeof desc === "string") return desc;
  return desc.en || Object.values(desc).filter(Boolean)[0] || undefined;
}

interface Props {
  product: Product;
  /** The page path, e.g. "/shop/c-42" or "/shop/123" */
  pagePath: string;
  /** Catalog product ID for fetching review stats */
  catalogProductId?: number | null;
}

export default async function ProductStructuredData({ product, pagePath, catalogProductId }: Props) {
  const name =
    product.name_display || resolveName(product.name);
  const description =
    product.description_display || resolveDescription(product.description);
  const url = `${SITE_URL}${pagePath}`;

  // Fetch review stats if catalog product ID is available
  let ratingValue: number | undefined;
  let reviewCount: number | undefined;
  if (catalogProductId) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/reviews/${catalogProductId}/stats/`,
        { next: { revalidate: 300 } }
      );
      if (res.ok) {
        const stats = await res.json();
        if (stats.review_count > 0) {
          ratingValue = stats.average_rating;
          reviewCount = stats.review_count;
        }
      }
    } catch {
      // Non-critical — structured data just won't include reviews
    }
  }

  // Collect all available images
  const images: string[] = [];
  if (product.image_url) images.push(product.image_url);
  if (product.gallery?.length) images.push(...product.gallery);
  if (product.mockups?.length)
    images.push(...product.mockups.map((m) => m.url).filter(Boolean));
  // Deduplicate
  const uniqueImages = [...new Set(images)].slice(0, 10);

  // Price range from variants
  const prices = (product.variants || [])
    .filter((v) => v.is_available)
    .map((v) => (typeof v.price === "string" ? Number(v.price) : v.price))
    .filter((p) => Number.isFinite(p) && p > 0);

  const priceLow = prices.length > 0 ? Math.min(...prices) : 0;
  const priceHigh = prices.length > 0 ? Math.max(...prices) : priceLow;

  // Availability: at least one variant available
  const inStock = (product.variants || []).some((v) => v.is_available);

  // SKU from first variant
  const sku =
    (product.variants || []).find((v) => v.sku)?.sku ?? undefined;

  // Category — from product.category or fall back to "Apparel"
  const category =
    typeof product.category === "string" && product.category
      ? product.category
      : "Apparel";

  // Breadcrumbs: Home > Shop > [Category] > Product
  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Shop", url: `${SITE_URL}/shop` },
  ];
  if (category && category !== "Apparel") {
    breadcrumbs.push({
      name: category,
      url: `${SITE_URL}/category/${encodeURIComponent(category.toLowerCase())}`,
    });
  }
  breadcrumbs.push({ name, url });

  return (
    <>
      <ProductJsonLd
        name={name}
        description={description}
        url={url}
        images={uniqueImages}
        sku={sku ?? undefined}
        brand="Selsa"
        currency="USD"
        priceLow={priceLow}
        priceHigh={priceHigh}
        inStock={inStock}
        category={category}
        ratingValue={ratingValue}
        reviewCount={reviewCount}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );
}
