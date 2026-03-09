'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './page.module.css';
import ProductBadges from './components/ProductBadges';
import QuickViewModal from './components/QuickViewModal';
import FilterAndSort, { FilterOptions } from './components/FilterAndSort';
import SkeletonLoader from './components/SkeletonLoader';

// This component is a client-side wrapper for interactive features
interface Category {
  slug: string;
  name: string;
  name_display?: string;
  image_url: string;
  product_count?: number;
  is_new?: boolean;
  is_trending?: boolean;
}

interface ClientCategoryPageProps {
  categories: Category[];
}

export const ClientCategoryPage: React.FC<ClientCategoryPageProps> = ({
  categories,
}) => {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'popular',
    priceMin: 0,
    priceMax: 500,
    inStock: false,
    rating: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickView = (product: Category) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleAddToCart = (productId: string) => {
    alert(`Added product ${productId} to cart!`);
    handleModalClose();
  };

  const handleAddToFavorites = (productId: string) => {
    alert(`Added product ${productId} to favorites!`);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className={styles.page}>
      {/* Filter & Sort Section */}
      <FilterAndSort
        onFilterChange={handleFilterChange}
        productCount={categories.length}
      />
      {/* Categories Grid */}
      {isLoading ? (
        <SkeletonLoader count={12} type="grid" />
      ) : (
        <div className={styles.container}>
          {categories.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>{t('📁')}</div>
              <h2 className={styles.emptyStateTitle}>{t('No Categories Found')}</h2>
              <p className={styles.emptyStateDescription}>{t('We couldn\'t find any categories matching your filters.')}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {categories.map((category) => (
                <div key={category.slug} className={styles.card}>
                  <Link href={`/category/${category.slug}`} className={styles.cardLink}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={category.image_url}
                        alt={category.name_display || category.name}
                        width={300}
                        height={300}
                        className={styles.image}
                        loading="lazy"
                      />
                      <div className={styles.imageOverlay}>
                        <h2 className={styles.overlayTitle}>{category.name_display || category.name}</h2>
                      </div>

                      {/* Badges */}
                      {(category.is_new || category.is_trending) && (
                        <div style={{ position: 'absolute', top: 0, left: 0 }}>
                          <ProductBadges
                            badges={{
                              isNew: category.is_new,
                              isTrending: category.is_trending,
                            }}
                            showRating={false}
                            showStock={false}
                          />
                        </div>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <p className={styles.name}>{category.name_display || category.name}</p>
                      {category.product_count && (
                        <p className={styles.productCount}>
                          {category.product_count}{t('products')}</p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleModalClose}
        onAddToCart={handleAddToCart}
        onAddToFavorites={handleAddToFavorites}
      />
    </div>
  );
};

export default ClientCategoryPage;
