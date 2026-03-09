/**
 * Search Results Component
 * Display search results with filtering and sorting
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useSearch } from '../context/SearchContext';
import LazyImage from './LazyImage';
import styles from '../styles/page.module.css';

export interface SearchResultsProps {
  onProductSelect?: (productId: string) => void;
  onCategorySelect?: (categoryId: string) => void;
}

type ResultFilter = 'all' | 'products' | 'categories';
type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating';

/**
 * Search Results Component
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  onProductSelect,
  onCategorySelect,
}) => {
  const { query, results, isLoading } = useSearch();
  const [filterBy, setFilterBy] = useState<ResultFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const filteredAndSorted = useMemo(() => {
    let filtered = results;

    // Apply filter
    if (filterBy === 'products') {
      filtered = filtered.filter((r) => r.type === 'product');
    } else if (filterBy === 'categories') {
      filtered = filtered.filter((r) => r.type === 'category');
    }

    // Apply sort
    let sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'relevance':
      default:
        sorted.sort((a, b) => b.relevance - a.relevance);
    }

    return sorted;
  }, [results, filterBy, sortBy]);

  const productCount = results.filter((r) => r.type === 'product').length;
  const categoryCount = results.filter((r) => r.type === 'category').length;

  if (!query.trim()) {
    return (
      <div className={styles.searchResultsEmpty}>
        <div className={styles.searchResultsEmptyIcon}>{t('🔍')}</div>
        <h2 className={styles.searchResultsEmptyTitle}>{t('Start searching to explore products')}</h2>
        <p className={styles.searchResultsEmptyText}>{t('Use the search bar above to find products and categories')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.searchResultsLoading}>
        <div className={styles.searchLoadingSpinner} />
        <p>{t('Searching...')}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.searchResultsEmpty}>
        <div className={styles.searchResultsEmptyIcon}>❌</div>
        <h2 className={styles.searchResultsEmptyTitle}>{t('No results for "')}{query}{t('"')}</h2>
        <p className={styles.searchResultsEmptyText}>{t('Try using different keywords or browse categories')}</p>
      </div>
    );
  }

  return (
    <div className={styles.searchResultsContainer}>
      {/* Header */}
      <div className={styles.searchResultsHeader}>
        <h1 className={styles.searchResultsTitle}>{t('Search Results for "')}{query}{t('"')}</h1>
        <p className={styles.searchResultsCount}>{t('Found')}{results.length}{t('result')}{results.length !== 1 ? 's' : ''}{' '}
          {productCount > 0 && `(${productCount} products)`}
          {categoryCount > 0 && `(${categoryCount} categories)`}
        </p>
      </div>
      {/* Controls */}
      <div className={styles.searchResultsControls}>
        <div className={styles.searchResultsFilter}>
          <label htmlFor="result-filter">{t('Filter:')}</label>
          <select
            id="result-filter"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as ResultFilter)}
            className={styles.searchResultsFilterSelect}
          >
            <option value="all">{t('All Results')}</option>
            <option value="products">{t('Products Only')}</option>
            <option value="categories">{t('Categories Only')}</option>
          </select>
        </div>

        <div className={styles.searchResultsSort}>
          <label htmlFor="result-sort">{t('Sort:')}</label>
          <select
            id="result-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.searchResultsSortSelect}
          >
            <option value="relevance">{t('Most Relevant')}</option>
            <option value="price-low">{t('Price: Low to High')}</option>
            <option value="price-high">{t('Price: High to Low')}</option>
            <option value="rating">{t('Highest Rated')}</option>
          </select>
        </div>
      </div>
      {/* Results Grid */}
      <div className={styles.searchResultsGrid}>
        {filteredAndSorted.length > 0 ? (
          filteredAndSorted.map((result) => (
            <div
              key={result.id}
              className={styles.searchResultCard}
              onClick={() => {
                if (result.type === 'product') {
                  onProductSelect?.(result.id);
                } else {
                  onCategorySelect?.(result.id);
                }
              }}
            >
              {/* Relevance Badge */}
              <div className={styles.searchResultBadge}>
                {result.relevance}{t('% match')}</div>

              {result.type === 'product' ? (
                <>
                  {/* Product Image */}
                  <div className={styles.searchResultCardImage}>
                    {result.image ? (
                      <LazyImage
                        src={result.image}
                        alt={result.name_display || result.name}
                        width={250}
                        height={250}
                      />
                    ) : (
                      <div className={styles.searchResultCardImagePlaceholder}>{t('📦')}</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={styles.searchResultCardContent}>
                    <h3 className={styles.searchResultCardName}>
                      {result.name_display || result.name}
                    </h3>

                    <div className={styles.searchResultCardMeta}>
                      {result.category && (
                        <span className={styles.searchResultCardCategory}>
                          {result.category}
                        </span>
                      )}
                      {result.rating && (
                        <span className={styles.searchResultCardRating}>{t('⭐')}{result.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {result.price && (
                      <div className={styles.searchResultCardPrice}>{t('$')}{result.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Category Icon */}
                  <div className={styles.searchResultCardImage}>
                    <div className={styles.searchResultCardImagePlaceholder}>{t('📁')}</div>
                  </div>

                  {/* Category Info */}
                  <div className={styles.searchResultCardContent}>
                    <h3 className={styles.searchResultCardName}>
                      {result.name_display || result.name}
                    </h3>
                    <p className={styles.searchResultCardSubtitle}>{t('Browse this category')}</p>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className={styles.searchResultsEmpty}>
            <p>{t('No results match your filters')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
