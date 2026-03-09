import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFilteredProducts } from '@/lib/api/advanced';
import type { Product } from '@/types/product';
import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse our complete product catalog',
};

export default async function CatalogPage() {
  const t = (key: string) => key;
  const products = await getFilteredProducts();

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
                  alt={product.name_display || product.name}
                  loading="lazy"
                />
              ) : (
                <div className={styles.placeholderImage}>{t('📷')}</div>
              )}
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name_display || product.name}</h3>
              {product.category && (
                <p className={styles.productCategory}>{product.category}</p>
              )}
              {product.variants && product.variants[0]?.price && (
                <p className={styles.productPrice}>{t('$')}{product.variants[0].price.toFixed(2)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
