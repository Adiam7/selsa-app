"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FilterOptions,
  SortOptions,
  FilterFacets,
  getFilterFacets,
} from "@/lib/api/advanced";

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterOptions, sort: SortOptions) => void;
  initialFilters?: FilterOptions;
  initialSort?: SortOptions;
}

export default function ProductFilters({
  onFiltersChange,
  initialFilters = {},
  initialSort = { field: "name", direction: "asc" },
}: ProductFiltersProps) {
  const [facets, setFacets] = useState<FilterFacets | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [sort, setSort] = useState<SortOptions>(initialSort);
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceMin, setPriceMin] = useState<string>(
    initialFilters.minPrice?.toString() || ""
  );
  const [priceMax, setPriceMax] = useState<string>(
    initialFilters.maxPrice?.toString() || ""
  );

  // Fetch facets on mount
  useEffect(() => {
    getFilterFacets().then(setFacets);
  }, []);

  // Notify parent when filters or sort change
  const applyFilters = useCallback(
    (newFilters: FilterOptions, newSort: SortOptions) => {
      setFilters(newFilters);
      setSort(newSort);
      onFiltersChange(newFilters, newSort);
    },
    [onFiltersChange]
  );

  const handleCategoryChange = (categorySlug: string) => {
    const newFilters = {
      ...filters,
      category: filters.category === categorySlug ? undefined : categorySlug,
    };
    applyFilters(newFilters, sort);
  };

  const handlePriceApply = () => {
    const min = priceMin ? parseFloat(priceMin) : undefined;
    const max = priceMax ? parseFloat(priceMax) : undefined;
    applyFilters({ ...filters, minPrice: min, maxPrice: max }, sort);
  };

  const handleInStockToggle = () => {
    applyFilters({ ...filters, inStock: !filters.inStock }, sort);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as [SortOptions["field"], SortOptions["direction"]];
    const newSort: SortOptions = { field, direction };
    applyFilters(filters, newSort);
  };

  const handleClearAll = () => {
    setPriceMin("");
    setPriceMax("");
    const cleared: FilterOptions = {};
    const defaultSort: SortOptions = { field: "name", direction: "asc" };
    applyFilters(cleared, defaultSort);
  };

  const hasActiveFilters =
    filters.category || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div className="product-filters">
      {/* Mobile toggle */}
      <button
        className="filters-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded ? "true" : "false"}
      >
        <span>Filters</span>
        {hasActiveFilters && <span className="filter-badge" />}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`filters-content ${isExpanded ? "expanded" : ""}`}>
        {/* Sort */}
        <div className="filter-section">
          <label className="filter-label" htmlFor="sort-select">Sort by</label>
          <select
            id="sort-select"
            className="filter-select"
            title="Sort products by"
            value={`${sort.field}-${sort.direction}`}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest-desc">Newest First</option>
            <option value="newest-asc">Oldest First</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <label className="filter-label">
            Price Range
            {facets && (
              <span className="filter-hint">
                ${Math.floor(facets.price_range.min)} – ${Math.ceil(facets.price_range.max)}
              </span>
            )}
          </label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder={facets ? `$${Math.floor(facets.price_range.min)}` : "Min"}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={handlePriceApply}
              onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
              className="price-input"
              min="0"
              step="0.01"
            />
            <span className="price-separator">–</span>
            <input
              type="number"
              placeholder={facets ? `$${Math.ceil(facets.price_range.max)}` : "Max"}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={handlePriceApply}
              onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
              className="price-input"
              min="0"
              step="0.01"
            />
            <button onClick={handlePriceApply} className="price-apply" title="Apply price filter">
              →
            </button>
          </div>
        </div>

        {/* Category */}
        {facets && facets.categories.length > 0 && (
          <div className="filter-section">
            <label className="filter-label">Category</label>
            <div className="category-list">
              {facets.categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`category-chip ${filters.category === cat.slug ? "active" : ""}`}
                >
                  {cat.name}
                  <span className="category-count">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In Stock */}
        <div className="filter-section">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!filters.inStock}
              onChange={handleInStockToggle}
            />
            <span>In stock only</span>
          </label>
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <button className="clear-filters" onClick={handleClearAll}>
            Clear all filters
          </button>
        )}
      </div>

      <style jsx>{`
        .product-filters {
          width: 100%;
        }

        .filters-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          position: relative;
        }

        .filter-badge {
          width: 8px;
          height: 8px;
          background: #2563eb;
          border-radius: 50%;
        }

        .filters-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 16px 0;
        }

        @media (max-width: 768px) {
          .filters-content {
            display: none;
          }
          .filters-content.expanded {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .filters-toggle {
            display: none;
          }
          .filters-content {
            display: flex;
          }
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .filter-hint {
          font-size: 11px;
          font-weight: 400;
          color: #9ca3af;
          text-transform: none;
          letter-spacing: normal;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          color: #374151;
          background: white;
          cursor: pointer;
          outline: none;
        }

        .filter-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          color: #374151;
          outline: none;
          min-width: 0;
        }

        .price-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .price-separator {
          color: #9ca3af;
          font-size: 14px;
          flex-shrink: 0;
        }

        .price-apply {
          padding: 8px 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .price-apply:hover {
          background: #e5e7eb;
        }

        .category-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 13px;
          color: #374151;
          background: white;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .category-chip:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        .category-chip.active {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        .category-count {
          font-size: 11px;
          opacity: 0.7;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .filter-checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #2563eb;
        }

        .clear-filters {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #ef4444;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.15s;
          align-self: flex-start;
        }

        .clear-filters:hover {
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
}
