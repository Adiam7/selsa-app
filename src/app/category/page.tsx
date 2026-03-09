// src/app/category/page.tsx

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/api/categories';
import { getSafeCategoryImageUrl } from '@/lib/utils/utils';
import { getCategoryAnalytics, getTrendingProducts, prefetchProductData } from '@/lib/api/advanced';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';
import { useTranslation } from 'react-i18next';
import type { Category } from '@/types/category';

export default function CategoryPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await prefetchProductData();
        
        const results = await Promise.allSettled([
          getCategories(),
          getCategoryAnalytics(),
        ]);

        if (results[0].status === 'fulfilled') {
          setCategories(results[0].value || []);
        }
        if (results[1].status === 'fulfilled') {
          setAnalytics(results[1].value || []);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`${styles.page} ${styles.loadingContainer}`}>
        <div className={styles.spinner}></div>
        <h1 className={styles.loadingText}>{t('Loading Categories...')}</h1>
      </div>
    );
  }

  if (error || !categories || categories.length === 0) {
    return (
      <div className={`${styles.page} ${styles.emptyState}`}>
        <div className={styles.emptyStateContent}>
          <div className={styles.emptyStateIcon}>{t('📦')}</div>
          <h1 className={styles.emptyStateTitle}>{t('No Categories Available')}</h1>
          <p className={styles.emptyStateDescription}>{t('We\'re currently updating our catalog. Please check back soon.')}</p>
          <Link href="/shop" className={styles.emptyStateButton}>{t('Browse Store')}</Link>
        </div>
      </div>
    );
  }

  // Group categories by level
  const topLevelCategories = categories.filter((cat: Category) => !cat.parent);
  const subCategories = categories.filter((cat: Category) => cat.parent && !cat.parent);
  const leafCategories = categories.filter((cat: Category) => cat.level && cat.level >= 2);

  // Helper function to render category section
  const renderCategorySection = (categoryList: Category[], title: string, level: 'top' | 'sub' | 'leaf') => {
    if (!categoryList || categoryList.length === 0) return null;
    return (
      <section key={title} className={styles.gridSection}>
        <div className={styles.container}>
          {/* <h2 className={styles.title}>
            {title}
          </h2> */}
          {/* <p className={styles.subtitle}>
            {title === "Top-Level Categories" && "Browse our main product categories"}
            {title === "Subcategories" && "Explore our specialized subcategories"}
            {title === "Leaf Categories" && "Find specific product categories"}
          </p> */}
          
          <div className={styles.grid}>
            {categoryList.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`${styles.card} ${level === 'top' ? styles.topCategory : level === 'sub' ? styles.subCategory : styles.leafCategory}`}
                style={{ '--animation-delay': `${index * 50}ms` } as React.CSSProperties}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={getSafeCategoryImageUrl(category)}
                    alt={category.name_display || category.name}
                    width={260}
                    height={260}
                    priority={false}
                    className={styles.image}
                  />
                  {/* <div className={styles.imageOverlay}></div> */}
                  {level === 'top' && <div className={styles.overlayTitle}>{category.name_display || category.name}</div>}
                </div>
                <div className={`${styles.info} ${level === 'sub' ? styles.subCategoryInfo : level === 'leaf' ? styles.leafCategoryInfo : ''}`}>
                  {/* <h3 className={`${styles.name} ${level === 'top' ? styles.topCategoryName : level === 'sub' ? styles.subCategoryName : styles.leafCategoryName}`}>
                    {category.name}
                  </h3> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <section className={styles.header}>
        <div className={styles.breadcrumb}>
          {/* <Link href="/shop" className={styles.breadcrumbLink}>
            <ArrowLeft size={24} />
          </Link> */}
          <h1 className={styles.title}>{t('Categories')}</h1>
        </div>
      </section>
      {/* Analytics Section - Disabled */}
      {/* Top-Level Categories Section */}
      {renderCategorySection(topLevelCategories, "Top-Level Categories", 'top')}
      {/* Subcategories Section */}
      {renderCategorySection(subCategories, "Subcategories", 'sub')}
      {/* Leaf Categories Section */}
      {renderCategorySection(leafCategories, "Leaf Categories", 'leaf')}
    </div>
  );
}
