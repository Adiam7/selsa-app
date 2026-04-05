"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { resolveBackendAssetUrl } from "@/lib/utils/utils";
import { getProductName } from "@/utils/i18nDisplay";
import type { CatalogProduct, CatalogProductVariant } from "@/types/catalog";

function getLowestVariantPrice(variants: CatalogProductVariant[] = []) {
  if (!variants || variants.length === 0) return 0;
  const prices = variants.map((v: CatalogProductVariant) => {
    const candidate = v.price ?? v.retail_price ?? v.price_usd ?? 0;
    return Number(candidate) || 0;
  });
  const min = Math.min(...prices);
  return isFinite(min) ? min : 0;
}

export default function ShopClient({
  products,
  count,
  page,
  limit,
  categorySlug,
}: {
  products: CatalogProduct[];
  count: number;
  page: number;
  limit: number;
  categorySlug?: string;
}) {
  const { t, i18n } = useTranslation();
  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <p className="text-gray-500">
          {categorySlug
            ? `No products found for "${decodeURIComponent(categorySlug)}".`
            : "No products found."}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(count / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, count);

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pageTitle = categorySlug
    ? decodeURIComponent(
        categorySlug.split("/").slice(-1)[0].replace(/-/g, " ")
      )
    : "All Products";

  const slugArray = categorySlug ? categorySlug.split("/") : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-center">
      <h1 className="text-3xl font-bold mt-auto mb-6 text-left">
        {pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)}{" "}
      </h1>
      {/* ✅ Breadcrumb Navigation */}
      <nav className="text-m text-gray-500 mb-4 text-left">
        <Link href="/" className="hover:text-gray-800">
          {t("Home")}
        </Link>
        <span> / </span>
        <Link href="/shop" className="hover:text-gray-800">
          {t("Store")}
        </Link>
        {slugArray.map((s, i) => {
          const categoryPath = slugArray.slice(0, i + 1).join("/");
          const path = `/shop?category=${encodeURIComponent(categoryPath)}`;
          return (
            <span key={i}>
              <span> / </span>
              <Link
                href={path}
                className={`hover:text-gray-800 ${
                  i === slugArray.length - 1
                    ? "font-semibold text-gray-800"
                    : ""
                }`}
              >
                {decodeURIComponent(s)}
              </Link>
            </span>
          );
        })}
      </nav>
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 product-container">
        {products.map((product: CatalogProduct) => {
          const price = getLowestVariantPrice(product.variants || []);
          const productName = getProductName(product, i18n.language);
          const isLocal = product?.source === "local";
          const isBook =
            String((product as CatalogProduct & { sku?: string })?.sku || "").startsWith("Book-") ||
            (Array.isArray(product?.variants)
              ? product.variants.some((v: CatalogProductVariant) => String(v?.sku || "").startsWith("Book-"))
              : false);
          const printfulId = product?.printful_id || product?.external_product_id;
          const href = isLocal
            ? `/shop/c-${product.id}`
            : printfulId
              ? `/shop/${printfulId}`
              : `/shop/cp-${product.id}`;
          const key = isLocal
            ? `local-${product.id}`
            : `printful-${printfulId ?? product.id}`;
          return (
            <Link
              key={key}
              href={href}
              className="rounded-xl p-4 hover:shadow-md transition hovercontainer"
            >
              <div className="relative w-full aspect-square mb-2 arrowButton">
                {product.image_url ? (
                  <Image
                    src={resolveBackendAssetUrl(product.image_url) || "/placeholder.jpg"}
                    alt={productName}
                    width={250}
                    height={250}
                    className={`${isBook ? "object-contain" : "object-cover"} w-full h-64 rounded-xl`}
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-64 rounded-xl flex items-center justify-center">{t('No Image')}</div>
                )}
              </div>
              <div className="text-center">
                <p className="mt-3 font-semibold text-base">{productName}</p>
                <p className="text-gray-700">${price.toFixed(2)}</p>
              </div>
            </Link>
          );
        })}
      </div>
      {/* Pagination */}
      <div className="mt-10 flex flex-col items-center space-y-3">
        <p className="text-sm text-gray-500 items-center">
          {startItem}{t('–')}{endItem}{t('of')}{count}{t('items')}</p>

        <div className="flex items-center space-x-2">
          {generatePageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-gray-400">{t('...')}</span>
            ) : (
              <Link
                key={i}
                href={`?page=${p}${
                  categorySlug ? `&category=${encodeURIComponent(categorySlug)}` : ""
                }`}
                className={`px-3 py-1 rounded-md border text-sm font-medium transition ${
                  p === page
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={`?page=${page + 1}${
                categorySlug ? `&category=${encodeURIComponent(categorySlug)}` : ""
              }`}
              className="ml-2 px-4 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-m font-medium"
            >{t('Next >')}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
