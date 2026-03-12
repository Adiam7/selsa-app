import React from 'react';
import Link from 'next/link';
import { getFilteredProducts } from '@/lib/api/advanced';
import type { Product } from '@/types/product';
import { Metadata } from 'next';
import styles from './page.module.css';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse our complete product catalog',
};

export default async function CatalogPage() {
  const t = (key: string) => key;
  const result = await getFilteredProducts();
  const products = result.products;

  if (!products || products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>{t('📦')}</div>
          <h1 className={styles.emptyStateTitle}>{t('No Products Available')}</h1>
          <p className={styles.emptyStateDescription}>{t('We\'re currently updating our catalog. Please check back soon.')}</p>
          <Link href="/shop" className={styles.emptyStateCTA}>{t('Browse Store')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('Product Catalog')}</h1>
        <p className={styles.subtitle}>{t('Explore our complete collection of products')}</p>
      </div>
      <CatalogClient initialProducts={products} />
    </div>
  );
}
