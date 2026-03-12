// src/components/seo/JsonLd.tsx
/**
 * Reusable JSON-LD structured data components for SEO rich results.
 *
 * Renders <script type="application/ld+json"> in the document head via Next.js.
 * See https://developers.google.com/search/docs/appearance/structured-data
 */

import React from "react";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://selsa.com";

function jsonLdScript(data: Record<string, unknown>, key?: string) {
  return (
    <script
      key={key}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── Organization ────────────────────────────────────────────────────────── */

export interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

/**
 * Organization schema — place once in the root layout.
 * Helps Google Knowledge Panel and brand card.
 */
export function OrganizationJsonLd({
  name = "Selsa",
  url = SITE_URL,
  logo = `${SITE_URL}/logo.png`,
  sameAs = [],
}: OrganizationJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    ...(sameAs.length > 0 && { sameAs }),
  };
  return jsonLdScript(data, "org-jsonld");
}

/* ─── WebSite (SearchAction for sitelinks search-box) ─────────────────── */

export interface WebSiteJsonLdProps {
  name?: string;
  url?: string;
  searchUrl?: string;
}

export function WebSiteJsonLd({
  name = "Selsa Store",
  url = SITE_URL,
  searchUrl = `${SITE_URL}/shop?q={search_term_string}`,
}: WebSiteJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchUrl,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return jsonLdScript(data, "website-jsonld");
}

/* ─── BreadcrumbList ──────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList schema — place on any page with a breadcrumb trail.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  if (!items || items.length === 0) return null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return jsonLdScript(data, "breadcrumb-jsonld");
}

/* ─── Product ─────────────────────────────────────────────────────────────── */

export interface ProductJsonLdProps {
  name: string;
  description?: string;
  url: string;
  images: string[];
  sku?: string;
  brand?: string;
  /** ISO 4217 currency code */
  currency?: string;
  /** Lowest price among variants */
  priceLow: number;
  /** Highest price among variants (omit if same as priceLow) */
  priceHigh?: number;
  /** Whether the product is currently in stock */
  inStock?: boolean;
  /** Aggregate rating (1-5) */
  ratingValue?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Category name for breadcrumb context */
  category?: string;
}

/**
 * Product schema — place on product detail pages.
 * Enables rich product results, price range, and availability in SERPs.
 */
export function ProductJsonLd({
  name,
  description,
  url,
  images,
  sku,
  brand = "Selsa",
  currency = "USD",
  priceLow,
  priceHigh,
  inStock = true,
  ratingValue,
  reviewCount,
  category,
}: ProductJsonLdProps) {
  const offers: Record<string, unknown> =
    priceHigh && priceHigh !== priceLow
      ? {
          "@type": "AggregateOffer",
          priceCurrency: currency,
          lowPrice: priceLow.toFixed(2),
          highPrice: priceHigh.toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url,
        }
      : {
          "@type": "Offer",
          priceCurrency: currency,
          price: priceLow.toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url,
        };

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description && { description }),
    url,
    image: images.length === 1 ? images[0] : images,
    ...(sku && { sku }),
    brand: { "@type": "Brand", name: brand },
    offers,
    ...(category && { category }),
    ...(ratingValue &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue,
          reviewCount,
        },
      }),
  };
  return jsonLdScript(data, "product-jsonld");
}

/* ─── CollectionPage (for shop / category listing pages) ──────────────── */

export interface CollectionPageJsonLdProps {
  name: string;
  description?: string;
  url: string;
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
}: CollectionPageJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    ...(description && { description }),
    url,
  };
  return jsonLdScript(data, "collection-jsonld");
}
