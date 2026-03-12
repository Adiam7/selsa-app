"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { searchItems, SearchResult } from "@/lib/api/advanced";
import ProductFilters from "@/components/ProductFilters";
import {
  FilterOptions,
  SortOptions,
  getFilteredProducts,
} from "@/lib/api/advanced";
import type { Product } from "@/types/product";
import styles from "./page.module.css";

export default function SearchPageClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);

  // Additional filtered products from sidebar filters
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilteredView, setShowFilteredView] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setShowFilteredView(false);
      try {
        const data = await searchItems(query);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleFiltersChange = useCallback(
    async (filters: FilterOptions, sort: SortOptions) => {
      setFilterLoading(true);
      setShowFilteredView(true);
      try {
        const result = await getFilteredProducts(
          { ...filters, search: query },
          sort
        );
        setFilteredProducts(result.products);
      } catch {
        // keep existing results on error
      } finally {
        setFilterLoading(false);
      }
    },
    [query]
  );

  const getProductLink = (result: SearchResult) => {
    if (result.type === "category") {
      return `/category/${result.slug || result.id.replace("category-", "")}`;
    }
    // Product
    const id = result.id.replace("product-", "");
    return `/product/${result.slug || id}`;
  };

  const getDisplayName = (product: Product): string => {
    if (product.name_display) return product.name_display;
    if (typeof product.name === "string") return product.name;
    if (typeof product.name === "object" && product.name) {
      return (product.name as any).en ?? (product.name as any).ti ?? "";
    }
    return "";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t("Search Catalog")}</h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products and categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            {t("Search")}
          </button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>{t("Searching...")}</p>
        </div>
      ) : results.length > 0 ? (
        <div className={styles.searchLayout}>
          {/* Sidebar filters for refining search results */}
          <aside className={styles.searchSidebar}>
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={{ search: query }}
              initialSort={{ field: "name", direction: "asc" }}
            />
          </aside>

          <div className={styles.searchMain}>
            <p className={styles.resultCount}>
              {showFilteredView ? filteredProducts.length : results.length} result
              {(showFilteredView ? filteredProducts.length : results.length) !== 1 ? "s" : ""}{" "}
              for &ldquo;{query}&rdquo;
            </p>

            {filterLoading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner} />
              </div>
            )}

            {/* Filtered grid view */}
            {showFilteredView ? (
              <div className={styles.filteredGrid}>
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id || product.printful_id}
                    href={`/product/${product.printful_id || product.id}`}
                    className={styles.gridCard}
                  >
                    <div className={styles.gridImage}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={getDisplayName(product)} />
                      ) : (
                        <span className={styles.gridPlaceholder}>📷</span>
                      )}
                    </div>
                    <div className={styles.gridInfo}>
                      <h3>{getDisplayName(product)}</h3>
                      {product.variants?.[0]?.price && (
                        <p className={styles.gridPrice}>
                          ${Number(product.variants[0].price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Default search results list */
              <div className={styles.resultsList}>
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={getProductLink(result)}
                    className={styles.resultItem}
                  >
                    {result.image && (
                      <div className={styles.resultImage}>
                        <img src={result.image} alt={result.name} />
                      </div>
                    )}
                    <div className={styles.resultContent}>
                      <h3>{result.name}</h3>
                      <p className={styles.resultType}>
                        {result.type === "product" ? "🛍️ Product" : "📂 Category"}
                      </p>
                      {result.type === "product" && result.price && (
                        <p className={styles.resultPrice}>${result.price.toFixed(2)}</p>
                      )}
                      {result.category && (
                        <p className={styles.resultCategory}>
                          {result.category}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : query ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h2>{t("No results found")}</h2>
          <p>{t("Try searching for something else or browse our categories")}</p>
          <Link href="/category" className={styles.noResultsLink}>
            {t("Browse Categories")}
          </Link>
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{t("Enter a search query to find products and categories")}</p>
        </div>
      )}
    </div>
  );
}
