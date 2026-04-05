/**
 * Category Detail Page with API Integration
 * Includes filtering, sorting, infinite scroll, and search
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { getFilteredProducts, getProductsPaginated, FilterOptions, SortOptions } from '@/lib/api/advanced';
import { useSearch } from '@/app/category/context/SearchContext';
import { useWishlist } from '@/app/category/context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { LazyImage } from '@/app/category/components/LazyImage';
import { InfiniteScroll } from '@/app/category/components/InfiniteScroll';
import { LoadMore } from '@/app/category/components/LoadMore';
import styles from './CategoryDetail.module.css';

interface CategoryDetailProps {
  categoryName: string;
}

export function CategoryDetail({ categoryName }: CategoryDetailProps) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'name', direction: 'asc' });
  const [filters, setFilters] = useState<FilterOptions>({ category: categoryName });
  
  const { query } = useSearch();
  const { isInWishlist, addToWishlist } = useWishlist();

  const getProductName = useCallback((product: Product): string => {
    if (product.name_display) return product.name_display;
    if (typeof product.name === 'string') return product.name;
    return product.name.en || product.name.ti || '';
  }, []);

  // Load initial products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const result = await getProductsPaginated(1, 20);
        const categoryFiltered = result.products.filter(
          (p) => p.category === categoryName
        );
        setProducts(categoryFiltered);
        setFilteredProducts(categoryFiltered);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [categoryName]);

  // Apply filters and sort
  useEffect(() => {
    const applyFiltersAndSort = async () => {
      try {
        const result = await getFilteredProducts(filters, sortBy);
        let filtered = Array.isArray(result) ? result : result.products;
        
        // Apply search query
        if (query) {
          filtered = filtered.filter((p) =>
            getProductName(p).toLowerCase().includes(query.toLowerCase())
          );
        }

        setFilteredProducts(filtered);
      } catch (error) {
        console.error('Failed to apply filters:', error);
      }
    };

    applyFiltersAndSort();
  }, [filters, sortBy, query, getProductName]);

  // Load more products
  const handleLoadMore = useCallback(async () => {
    try {
      const nextPage = page + 1;
      const result = await getProductsPaginated(nextPage, 20);
      const categoryFiltered = result.products.filter(
        (p) => p.category === categoryName
      );
      
      setProducts((prev) => [...prev, ...categoryFiltered]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more products:', error);
    }
  }, [page, categoryName]);

  const handleAddToWishlist = useCallback((product: Product) => {
    addToWishlist({
      id: `wishlist_${product.printful_id}`,
      productId: `${product.printful_id}`,
      productName: getProductName(product),
      productImage: product.image_url || product.gallery?.[0] || '',
      productPrice: product.variants?.[0]?.price || 0,
      productRating: undefined,
    });
  }, [addToWishlist, getProductName]);

  return (
    <div className={styles.container}>
      {/* Filters & Sorting */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label htmlFor="sort-select" className={styles.label}>{t('Sort By')}</label>
          <select
            id="sort-select"
            value={sortBy.field}
            onChange={(e) =>
              setSortBy({ ...sortBy, field: e.target.value as any })
            }
            className={styles.select}
          >
            <option value="name">{t('Name')}</option>
            <option value="price">{t('Price')}</option>
            <option value="rating">{t('Rating')}</option>
            <option value="newest">{t('Newest')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="price-range" className={styles.label}>{t('Price Range')}</label>
          <input
            id="price-range"
            type="range"
            min="0"
            max="500"
            title="Filter by price"
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: parseInt(e.target.value) })
            }
            className={styles.range}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              onChange={(e) =>
                setFilters({ ...filters, inStock: e.target.checked })
              }
            />{t('In Stock Only')}</label>
        </div>
      </div>
      {/* Results */}
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultCount}>
          {filteredProducts.length}{t('Products Found')}</h2>
        {query && (
          <p className={styles.searchQuery}>{t('Searching for:')}<strong>{query}</strong>
          </p>
        )}
      </div>
      {/* Product Grid */}
      <div className={styles.grid}>
        {filteredProducts.map((product) => (
          <div key={product.printful_id} className={styles.productCard}>
            <div className={styles.imageWrapper}>
              <LazyImage
                src={product.image_url || product.gallery?.[0] || '/placeholder.png'}
                alt={getProductName(product)}
                placeholder="blur"
              />
              {isInWishlist(`${product.printful_id}`) && (
                <div className={styles.wishlistBadge}>{t('❤️ Saved')}</div>
              )}
            </div>

            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{getProductName(product)}</h3>
              
              <div className={styles.productMeta}>
                {product.category && (
                  <span className={styles.category}>{product.category}</span>
                )}
                <span className={styles.rating}>{t('⭐ 4.5')}</span>
              </div>

              <div className={styles.priceSection}>
                <span className={styles.price}>{t('$')}{product.variants?.[0]?.price || 'N/A'}
                </span>
                {product.variants?.[0]?.is_available ? (
                  <span className={styles.inStock}>{t('In Stock')}</span>
                ) : (
                  <span className={styles.outOfStock}>{t('Out of Stock')}</span>
                )}
              </div>

              <div className={styles.actions}>
                <Link
                  href={`/product/${product.printful_id}`}
                  className={styles.viewBtn}
                >{t('View Details')}</Link>
                <button
                  onClick={() => handleAddToWishlist(product)}
                  className={`${styles.wishlistBtn} ${
                    isInWishlist(`${product.printful_id}`) ? styles.active : ''
                  }`}
                  title="Add to wishlist"
                >{t('❤️')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Infinite Scroll / Load More */}
      {hasMore && filteredProducts.length > 0 && (
        <LoadMore
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          itemCount={filteredProducts.length}
          totalCount={products.length}
        />
      )}
      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>{t('🔍')}</p>
          <h3 className={styles.emptyTitle}>{t('No Products Found')}</h3>
          <p className={styles.emptyDescription}>{t('Try adjusting your filters or search terms')}</p>
        </div>
      )}
    </div>
  );
}

export default CategoryDetail;
