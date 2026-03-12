"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import ProductFilters from "@/components/ProductFilters";
import {
  FilterOptions,
  SortOptions,
  getFilteredProducts,
} from "@/lib/api/advanced";
import type { Product } from "@/types/product";
import styles from "./page.module.css";

export default function CatalogClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialProducts.length);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [activeSort, setActiveSort] = useState<SortOptions>({ field: "name", direction: "asc" });

  const handleFiltersChange = useCallback(
    async (filters: FilterOptions, sort: SortOptions) => {
      setLoading(true);
      setActiveFilters(filters);
      setActiveSort(sort);

      try {
        const result = await getFilteredProducts(filters, sort);
        setProducts(result.products);
        setTotalCount(result.total);
      } catch {
        // Keep current data on error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getDisplayName = (product: Product): string => {
    if (product.name_display) return product.name_display;
    if (typeof product.name === "string") return product.name;
    if (typeof product.name === "object" && product.name) {
      return (product.name as any).en ?? (product.name as any).ti ?? "";
    }
    return "";
  };

  return (
    <>
      <div className={styles.catalogLayout}>
        {/* Sidebar filters */}
        <aside className={styles.sidebar}>
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={activeFilters}
            initialSort={activeSort}
          />
        </aside>

        {/* Product grid */}
        <div className={styles.mainContent}>
          <div className={styles.resultsMeta}>
            <p className={styles.resultCount}>
              {totalCount} product{totalCount !== 1 ? "s" : ""}
              {activeFilters.category && (
                <span> in <strong>{activeFilters.category}</strong></span>
              )}
              {activeFilters.minPrice || activeFilters.maxPrice ? (
                <span>
                  {" "}· ${activeFilters.minPrice || 0}–${activeFilters.maxPrice || "∞"}
                </span>
              ) : null}
            </p>
          </div>

          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
            </div>
          )}

          {!loading && products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🔍</div>
              <h2 className={styles.emptyStateTitle}>No products match your filters</h2>
              <p className={styles.emptyStateDescription}>
                Try adjusting your filters or clearing them to see all products.
              </p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((product: Product) => (
                <Link
                  key={product.id || product.printful_id}
                  href={`/product/${product.printful_id || product.id}`}
                  className={styles.productCard}
                >
                  <div className={styles.productImage}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={getDisplayName(product)}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.placeholderImage}>📷</div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{getDisplayName(product)}</h3>
                    {product.category && (
                      <p className={styles.productCategory}>
                        {typeof product.category === "string"
                          ? product.category
                          : ""}
                      </p>
                    )}
                    {product.variants && product.variants[0]?.price && (
                      <p className={styles.productPrice}>
                        ${Number(product.variants[0].price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
