'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from '../page.module.css';
import ProductBadges, { BadgeProps } from './ProductBadges';

interface Product {
  printful_id: string;
  name: string;
  name_display?: string;
  image_url: string;
  description?: string;
  description_display?: string;
  variants?: Array<{
    price: string;
    size?: string;
    color?: string;
  }>;
  rating?: number;
  review_count?: number;
  stock_status?: 'high' | 'low' | 'out';
  is_new?: boolean;
  discount?: number;
  is_trending?: boolean;
}

interface QuickViewModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (productId: string) => void;
  onAddToFavorites?: (productId: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
  onAddToFavorites,
}) => {
  const { t } = useTranslation();
  const productId = (product as any)?.printful_id || (product as any)?.external_product_id;
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const variant = product.variants?.[selectedVariant];
  const price = variant?.price ? Number(variant.price).toFixed(2) : '0.00';

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.modalBackdrop}
        onClick={handleBackdropClick}
        ref={modalRef}
        role="presentation"
      />
      {/* Modal Container */}
      <div className={styles.quickViewModal} role="dialog" aria-modal="true">
        {/* Close Button */}
        <button
          className={styles.modalCloseButton}
          onClick={onClose}
          aria-label="Close modal"
          title="Close (Esc)"
        >{t('✕')}</button>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          {/* Left: Product Image */}
          <div className={styles.modalImageSection}>
            <div className={styles.modalImageWrapper}>
              <Image
                src={product.image_url}
                alt={product.name_display || product.name}
                width={400}
                height={400}
                className={styles.modalImage}
              />

              {/* Badges on Image */}
              <div style={{ position: 'absolute', top: 0, left: 0 }}>
                <ProductBadges
                  badges={{
                    isNew: product.is_new,
                    discount: product.discount,
                    rating: product.rating,
                    reviewCount: product.review_count,
                    stockStatus: product.stock_status,
                    isTrending: product.is_trending,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className={styles.modalDetailsSection}>
            {/* Title */}
            <h2 className={styles.modalTitle}>{product.name_display || product.name}</h2>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className={styles.modalRating}>
                <span className={styles.ratingStars}>
                  {'⭐'.repeat(Math.round(product.rating))}
                </span>
                <span className={styles.ratingValue}>
                  {product.rating.toFixed(1)}{t('(')}{product.review_count || 0}{t('reviews)')}</span>
              </div>
            )}

            {/* Price */}
            <div className={styles.modalPrice}>
              {product.discount ? (
                <>
                  <span className={styles.originalPrice}>{t('$')}{(Number(price) * (1 + product.discount / 100)).toFixed(2)}
                  </span>
                  <span className={styles.salePrice}>${price}</span>
                  <span className={styles.discountBadge}>{product.discount}{t('% OFF')}</span>
                </>
              ) : (
                <span className={styles.salePrice}>${price}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className={styles.modalDescription}>{product.description_display || product.description}</p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className={styles.variantsSection}>
                <label className={styles.variantLabel}>{t('Select Option:')}</label>
                <div className={styles.variantOptions}>
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      className={`${styles.variantButton} ${
                        selectedVariant === index ? styles.variantButtonActive : ''
                      }`}
                      onClick={() => setSelectedVariant(index)}
                    >
                      {v.size || v.color || `Option ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {product.stock_status && (
              <div className={styles.stockStatus}>
                <span
                  className={`${styles.stockDot} ${
                    product.stock_status === 'high'
                      ? styles.stockHigh
                      : product.stock_status === 'low'
                        ? styles.stockLow
                        : styles.stockOut
                  }`}
                />
                <span>
                  {product.stock_status === 'high' && 'In Stock'}
                  {product.stock_status === 'low' && 'Low Stock'}
                  {product.stock_status === 'out' && 'Out of Stock'}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.modalActions}>
              <button
                className={styles.addToCartButton}
                onClick={() => productId && onAddToCart?.(productId)}
                disabled={product.stock_status === 'out'}
              >{t('🛒 Add to Cart')}</button>

              <button
                className={`${styles.addToFavoritesButton} ${
                  isFavorite ? styles.addToFavoritesButtonActive : ''
                }`}
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  if (productId) onAddToFavorites?.(productId);
                }}
                title="Add to favorites"
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>

              <button
                className={styles.shareButton}
                onClick={() => {
                  const url = `${window.location.origin}/shop/${productId}`;
                  navigator.clipboard.writeText(url);
                  alert('Product link copied!');
                }}
                title="Copy product link"
              >{t('🔗 Share')}</button>
            </div>

            {/* Additional Info */}
            <div className={styles.modalFooter}>
              {productId ? (
                <a href={`/shop/${productId}`} className={styles.viewFullDetails}>{t('View Full Details →')}</a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
