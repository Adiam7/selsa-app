"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { searchItems } from "@/lib/api/advanced";
import styles from "./page.module.css";

interface SearchResult {
  id: string;
  type: "product" | "category";
  name: string;
  name_display?: string;
  image?: string;
  price?: number;
  rating?: number;
  category?: string;
  relevance: number;
}

export default function SearchPageClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
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
        <div className={styles.results}>
          <p className={styles.resultCount}>
            {t("Found")}
            {results.length}
            {t("result")}
            {results.length !== 1 ? "s" : ""}
            {t("for \"")}
            {query}
            {t("\"")}
          </p>

          <div className={styles.resultsList}>
            {results.map((result) => (
              <div key={result.id} className={styles.resultItem}>
                {result.image && (
                  <div className={styles.resultImage}>
                    <img src={result.image} alt={result.name_display || result.name} />
                  </div>
                )}
                <div className={styles.resultContent}>
                  <h3>{result.name_display || result.name}</h3>
                  <p className={styles.resultType}>
                    {result.type === "product" ? "🛍️ Product" : "📂 Category"}
                  </p>
                  {result.type === "product" && result.price && (
                    <p className={styles.resultPrice}>${result.price.toFixed(2)}</p>
                  )}
                  {result.category && (
                    <p className={styles.resultCategory}>
                      {t("Category:")}
                      {result.category}
                    </p>
                  )}
                  <p className={styles.relevance}>
                    {t("Relevance:")}
                    {result.relevance}
                    {t("%")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>{t("🔍")}</div>
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
