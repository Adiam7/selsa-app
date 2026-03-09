'use client';

import React, { useState, useCallback } from 'react';
import styles from '../page.module.css';

export interface FilterOptions {
  sortBy?: 'popular' | 'new' | 'price-low' | 'price-high' | 'rating';
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  rating?: number; // 1-5 stars
}

interface FilterAndSortProps {
  onFilterChange?: (filters: FilterOptions) => void;
  onSortChange?: (sortBy: string) => void;
  maxPrice?: number;
  productCount?: number;
}

export const FilterAndSort: React.FC<FilterAndSortProps> = ({
  onFilterChange,
  onSortChange,
  maxPrice = 500,
  productCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'popular',
    priceMin: 0,
    priceMax: maxPrice,
    inStock: false,
    rating: 0,
  });

  const handleSortChange = useCallback(
    (sortBy: FilterOptions['sortBy']) => {
      setFilters((prev) => ({ ...prev, sortBy }));
      onSortChange?.(sortBy);
      onFilterChange?.({ ...filters, sortBy });
    },
    [filters, onFilterChange, onSortChange]
  );

  const handlePriceChange = useCallback(
    (priceMin: number, priceMax: number) => {
      const newFilters = { ...filters, priceMin, priceMax };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleStockFilter = useCallback(() => {
    const newFilters = { ...filters, inStock: !filters.inStock };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const handleRatingFilter = useCallback(
    (rating: number) => {
      const newFilters = { ...filters, rating: filters.rating === rating ? 0 : rating };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const resetFilters = useCallback(() => {
    const resetState: FilterOptions = {
      sortBy: 'popular',
      priceMin: 0,
      priceMax: maxPrice,
      inStock: false,
      rating: 0,
    };
    setFilters(resetState);
    onFilterChange?.(resetState);
  }, [maxPrice, onFilterChange]);

  return (
    <div className={styles.filterContainer}>
      {/* Filter Toggle Button (Mobile) */}
      <button
        className={styles.filterToggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >{t('⚙️ Filters & Sort')}<span className={styles.filterBadge}>
          {Object.values(filters).filter((v) => v).length}
        </span>
      </button>
      {/* Filter Panel */}
      <div className={`${styles.filterPanel} ${isOpen ? styles.filterPanelOpen : ''}`}>
        {/* Header */}
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>{t('Filters & Sort')}</h3>
          <button
            className={styles.filterCloseButton}
            onClick={() => setIsOpen(false)}
          >{t('✕')}</button>
        </div>

        {/* Sort Section */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterSectionTitle}>{t('Sort By')}</h4>
          <div className={styles.sortOptions}>
            {[
              { value: 'popular', label: '⭐ Popular' },
              { value: 'new', label: '🆕 Newest' },
              { value: 'price-low', label: '💰 Price: Low to High' },
              { value: 'price-high', label: '💎 Price: High to Low' },
              { value: 'rating', label: '⭐ Top Rated' },
            ].map((option) => (
              <button
                key={option.value}
                className={`${styles.sortOption} ${
                  filters.sortBy === option.value ? styles.sortOptionActive : ''
                }`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterSectionTitle}>{t('Price Range')}</h4>
          <div className={styles.priceRangeContainer}>
            <div className={styles.priceInputGroup}>
              <label>{t('Min')}</label>
              <input
                type="number"
                min="0"
                max={filters.priceMax}
                value={filters.priceMin}
                onChange={(e) =>
                  handlePriceChange(Number(e.target.value), filters.priceMax!)
                }
                className={styles.priceInput}
              />
            </div>
            <span className={styles.priceSeparator}>-</span>
            <div className={styles.priceInputGroup}>
              <label>{t('Max')}</label>
              <input
                type="number"
                min={filters.priceMin}
                max={maxPrice}
                value={filters.priceMax}
                onChange={(e) =>
                  handlePriceChange(filters.priceMin!, Number(e.target.value))
                }
                className={styles.priceInput}
              />
            </div>
          </div>
          <div className={styles.priceSlider}>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={filters.priceMin}
              onChange={(e) =>
                handlePriceChange(Number(e.target.value), filters.priceMax!)
              }
              className={styles.rangeSlider}
            />
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={filters.priceMax}
              onChange={(e) =>
                handlePriceChange(filters.priceMin!, Number(e.target.value))
              }
              className={styles.rangeSlider}
            />
          </div>
        </div>

        {/* Stock Filter Section */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterSectionTitle}>{t('Availability')}</h4>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={handleStockFilter}
              className={styles.checkbox}
            />
            <span>{t('In Stock Only')}</span>
          </label>
        </div>

        {/* Rating Filter Section */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterSectionTitle}>{t('Rating')}</h4>
          <div className={styles.ratingFilterOptions}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`${styles.ratingFilterOption} ${
                  filters.rating === rating ? styles.ratingFilterOptionActive : ''
                }`}
                onClick={() => handleRatingFilter(rating)}
              >
                <span className={styles.ratingFilterStars}>
                  {'⭐'.repeat(rating)}
                </span>
                <span>{t('& Up')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.sortBy !== 'popular' ||
          filters.inStock ||
          (filters.rating ?? 0) > 0 ||
          filters.priceMin !== 0 ||
          filters.priceMax !== maxPrice) && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>{t('Active:')}</span>
            <div className={styles.activeFiltersList}>
              {filters.sortBy && filters.sortBy !== 'popular' && (
                <span className={styles.filterTag}>{filters.sortBy}</span>
              )}
              {filters.inStock && <span className={styles.filterTag}>{t('In Stock')}</span>}
              {(filters.rating ?? 0) > 0 && (
                <span className={styles.filterTag}>{filters.rating}{t('+ Stars')}</span>
              )}
              {(filters.priceMin !== 0 || filters.priceMax !== maxPrice) && (
                <span className={styles.filterTag}>{t('$')}{filters.priceMin}{t('- $')}{filters.priceMax}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.filterActions}>
          <button className={styles.resetFiltersButton} onClick={resetFilters}>{t('↺ Reset')}</button>
          <button
            className={styles.applyFiltersButton}
            onClick={() => setIsOpen(false)}
          >{t('✓ Apply')}</button>
        </div>

        {/* Results Count */}
        <div className={styles.filterResults}>{t('Showing')}{productCount}{t('products')}</div>
      </div>
    </div>
  );
};

export default FilterAndSort;
