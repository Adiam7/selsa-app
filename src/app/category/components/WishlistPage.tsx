/**
 * Wishlist Page Component
 * Display, manage and compare wishlist items
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { WishlistButton } from './WishlistButton';
import { LazyImage } from './LazyImage';
import styles from '../styles/page.module.css';

export interface WishlistPageProps {
  onProductSelect?: (productId: string) => void;
}

type SortOption = 'added' | 'price-low' | 'price-high' | 'rating';

/**
 * Wishlist Page Component
 * Displays all wishlist items with compare and share features
 */
export const WishlistPage: React.FC<WishlistPageProps> = ({
  onProductSelect,
}) => {
  const {
    wishlist,
    getWishlistCount,
    getWishlistTotal,
    clearWishlist,
    compareProducts,
    shareWishlist,
  } = useWishlist();
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sort wishlist items
  const sortedWishlist = useMemo(() => {
    const sorted = [...wishlist];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.productPrice - b.productPrice);
      case 'price-high':
        return sorted.sort((a, b) => b.productPrice - a.productPrice);
      case 'rating':
        return sorted.sort(
          (a, b) => (b.productRating || 0) - (a.productRating || 0)
        );
      case 'added':
      default:
        return sorted.sort((a, b) => b.addedAt - a.addedAt);
    }
  }, [wishlist, sortBy]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === wishlist.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(wishlist.map((item) => item.productId));
    }
  };

  const handleShare = async () => {
    const shareUrl = shareWishlist();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getComparisonTotal = () => {
    const compared = compareProducts(selectedProducts);
    return compared.reduce((sum, item) => sum + item.productPrice, 0);
  };

  if (wishlist.length === 0) {
    return (
      <div className={styles.wishlistEmpty}>
        <div className={styles.wishlistEmptyIcon}>♡</div>
        <h2 className={styles.wishlistEmptyTitle}>{t('Your wishlist is empty')}</h2>
        <p className={styles.wishlistEmptyText}>{t('Start adding products to your wishlist to save them for later')}</p>
      </div>
    );
  }

  return (
    <div className={styles.wishlistPage}>
      {/* Header */}
      <div className={styles.wishlistHeader}>
        <div className={styles.wishlistHeaderContent}>
          <h1 className={styles.wishlistTitle}>{t('My Wishlist')}</h1>
          <p className={styles.wishlistSubtitle}>
            {getWishlistCount()}{t('items • $')}{getWishlistTotal().toFixed(2)}{t('total')}</p>
        </div>

        <div className={styles.wishlistActions}>
          <button
            className={styles.wishlistShareBtn}
            onClick={() => setShowShareModal(true)}
          >
            <span>{t('📤')}</span>{t('Share')}</button>
          <button
            className={styles.wishlistClearBtn}
            onClick={clearWishlist}
          >{t('Clear All')}</button>
        </div>
      </div>
      {/* Controls */}
      <div className={styles.wishlistControls}>
        <div className={styles.wishlistSort}>
          <label htmlFor="wishlist-sort">{t('Sort by:')}</label>
          <select
            id="wishlist-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.wishlistSortSelect}
          >
            <option value="added">{t('Recently Added')}</option>
            <option value="price-low">{t('Price: Low to High')}</option>
            <option value="price-high">{t('Price: High to Low')}</option>
            <option value="rating">{t('Highest Rated')}</option>
          </select>
        </div>

        <div className={styles.wishlistCompare}>
          <label>
            <input
              type="checkbox"
              checked={selectedProducts.length === wishlist.length}
              onChange={handleSelectAll}
              className={styles.wishlistCheckbox}
            />{t('Select All (')}{selectedProducts.length}/{wishlist.length}{t(')')}</label>
          {selectedProducts.length > 1 && (
            <button
              className={styles.wishlistCompareBtn}
              onClick={() => {
                // Compare functionality would be implemented here
                console.log('Compare products:', selectedProducts);
              }}
            >{t('Compare (')}{selectedProducts.length}{t(')')}</button>
          )}
        </div>
      </div>
      {/* Wishlist Grid */}
      <div className={styles.wishlistGrid}>
        {sortedWishlist.map((item) => (
          <div
            key={item.id}
            className={`${styles.wishlistCard} ${
              selectedProducts.includes(item.productId)
                ? styles.wishlistCardSelected
                : ''
            }`}
          >
            {/* Checkbox */}
            <div className={styles.wishlistCardCheckbox}>
              <input
                type="checkbox"
                checked={selectedProducts.includes(item.productId)}
                onChange={() => handleSelectProduct(item.productId)}
                className={styles.wishlistCheckbox}
              />
            </div>

            {/* Product Image */}
            <div
              className={styles.wishlistCardImage}
              onClick={() => onProductSelect?.(item.productId)}
            >
              <LazyImage
                src={item.productImage}
                alt={item.productName}
                width={250}
                height={250}
              />
            </div>

            {/* Product Info */}
            <div className={styles.wishlistCardContent}>
              <h3 className={styles.wishlistCardName}>{item.productName}</h3>

              {item.productRating && (
                <div className={styles.wishlistCardRating}>
                  <span className={styles.wishlistCardStars}>
                    {'★'.repeat(Math.round(item.productRating))}
                    {'☆'.repeat(5 - Math.round(item.productRating))}
                  </span>
                  <span className={styles.wishlistCardRatingValue}>
                    {item.productRating.toFixed(1)}
                  </span>
                </div>
              )}

              <div className={styles.wishlistCardPrice}>{t('$')}{item.productPrice.toFixed(2)}
              </div>

              <p className={styles.wishlistCardDate}>{t('Added')}{new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className={styles.wishlistCardActions}>
              <button className={styles.wishlistCardAddCart}>{t('Add to Cart')}</button>
              <WishlistButton
                productId={item.productId}
                productName={item.productName}
                productImage={item.productImage}
                productPrice={item.productPrice}
                productRating={item.productRating}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Comparison Panel */}
      {selectedProducts.length > 0 && (
        <div className={styles.wishlistComparison}>
          <div className={styles.wishlistComparisonContent}>
            <p>{t('Selected:')}<strong>{selectedProducts.length}{t('items')}</strong>{t('•\n              Total:')}<strong>${getComparisonTotal().toFixed(2)}</strong>
            </p>
          </div>
          <button className={styles.wishlistComparisonBtn}>{t('Compare Selected')}</button>
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && (
        <div className={styles.wishlistShareModal}>
          <div className={styles.wishlistShareModalContent}>
            <button
              className={styles.wishlistShareModalClose}
              onClick={() => setShowShareModal(false)}
            >{t('✕')}</button>
            <h2 className={styles.wishlistShareModalTitle}>{t('Share Wishlist')}</h2>
            <p className={styles.wishlistShareModalText}>{t('Share your wishlist with friends and family')}</p>
            <div className={styles.wishlistShareLink}>
              <input
                type="text"
                readOnly
                value={shareWishlist()}
                className={styles.wishlistShareInput}
              />
              <button
                className={styles.wishlistShareCopyBtn}
                onClick={handleShare}
              >
                {copiedShare ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className={styles.wishlistShareMethods}>
              <button className={styles.wishlistShareMethod}>{t('Share via Email')}</button>
              <button className={styles.wishlistShareMethod}>{t('Share on Social')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
