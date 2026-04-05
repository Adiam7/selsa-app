'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { WishlistButton } from './WishlistButton';
import ProductBadges from './ProductBadges';
import styles from '../page.module.css';
import { getProductName } from '@/utils/i18nDisplay';
import { resolveBackendAssetUrl } from '@/lib/utils/utils';
import type { Product } from '@/types/product';

interface ProductCardWithWishlistProps {
  product: Product;
  priority?: boolean;
}

export const ProductCardWithWishlist: React.FC<ProductCardWithWishlistProps> = ({ product, priority = false }) => {
  const { i18n } = useTranslation();

  const productHref = useMemo(() => {
    const source = String(product?.source || '').toLowerCase();
    const isLocal = source === 'local';
    if (isLocal) {
      return `/shop/c-${product?.id}`;
    }

    const printfulId = product?.printful_id || product?.external_product_id;
    if (printfulId) {
      return `/shop/${printfulId}`;
    }

    // Fallback: open via catalog id (server route will fetch catalog product).
    return `/shop/cp-${product?.id}`;
  }, [product]);
  
  const displayName = useMemo(() => {
    return getProductName(product, i18n.language);
  }, [product, i18n.language]);

  const imageSrc = useMemo(() => {
    return (
      resolveBackendAssetUrl(product?.image_url) ||
      resolveBackendAssetUrl(product?.default_image) ||
      '/placeholder.jpg'
    );
  }, [product]);

  return (
    <div className={styles.productCard}>
      <Link
        href={productHref}
        className={styles.productCardLink}
      >
        <div className={styles.productImageWrapper}>
          <Image
            src={imageSrc}
            alt={displayName}
            width={250}
            height={250}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            className={styles.productImage}
          />
          <div className={styles.productOverlay} />
        </div>
        <div className={styles.productInfo}>
          <p className={styles.productName}>{displayName}</p>
          <p className={styles.productPrice}>${Number(product.variants?.[0]?.price ?? 0).toFixed(2) || "N/A"}
          </p>
        </div>
      </Link>
      {/* Product Badges */}
      <ProductBadges
        badges={{
          isNew: product.is_new || false,
          discount: product.discount && product.discount > 0 ? product.discount : undefined,
          rating: product.rating || undefined,
          reviewCount: product.review_count || 0,
          stockStatus: product.stock_status || 'high',
          isTrending: product.is_trending || false,
        }}
        showRating={false}
      />
      {/* Wishlist Button - NO provider wrapper here */}
      <Suspense fallback={null}>
        <div className={styles.favoriteButtonWrapper}>
          <WishlistButton
            productId={String(product?.printful_id || product?.external_product_id || product?.id)}
            productName={displayName}
            productImage={product.image_url || '/placeholder.png'}
            productPrice={Number(product.variants?.[0]?.price ?? 0)}
            productRating={product.rating ?? undefined}
            size="md"
            showLabel={false}
          />
        </div>
      </Suspense>
    </div>
  );
};
