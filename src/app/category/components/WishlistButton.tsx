/**
 * Wishlist Button Component
 * Add/Remove products from wishlist with visual feedback
 */

'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '../page.module.css';
import { useFavorite } from '@/features/favourites/hooks/useFavorite';
import { useWishlist } from '../context/WishlistContext';

export interface WishlistButtonProps {
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onWishlistChange?: (isAdded: boolean) => void;
}

/**
 * Wishlist Button Component
 * Toggles product wishlist status with animation
 * Uses server-side favorite status via useFavorite hook
 */
export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  productName,
  productImage,
  productPrice,
  productRating,
  size = 'md',
  showLabel = false,
  onWishlistChange,
}) => {
  const { data: session } = useSession();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Only fetch favorites if user is logged in
  const { isFavorited, isLoading, isToggling, toggle } = useFavorite({
    contentType: 'products.product',
    objectId: productId,
    enabled: !!session?.user, // Only fetch if authenticated
  });



  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!session?.user) {
      alert('Please log in to add favorites');
      return;
    }

    // Don't allow multiple clicks while loading
    if (isLoading || isToggling) return;

    const newState = !isFavorited;
    
    try {
      // Call toggle which updates server + optimistic update
      await toggle();

      // Update local wishlist context
      if (newState) {
        await addToWishlist({
          id: `wishlist_${productId}`,
          productId,
          productName,
          productImage,
          productPrice,
          productRating,
        });
      } else {
        await removeFromWishlist(productId);
      }

      // Show feedback
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);

      onWishlistChange?.(newState);
    } catch (error: unknown) {
      // Check if it's an auth error
      const errMsg = error instanceof Error ? error.message : '';
      if (errMsg.includes('Not authenticated')) {
        alert('Please log in to add favorites');
      }
    }
  };

  const sizeClass = {
    sm: styles.wishlistButtonSm,
    md: styles.wishlistButtonMd,
    lg: styles.wishlistButtonLg,
  }[size];

  return (
    <div className={styles.wishlistButtonContainer}>
      <button
        className={`${styles.wishlistButton} ${sizeClass} ${isToggling ? 'opacity-60' : ''}`}
        style={{
          color: isFavorited ? '#ef4444' : 'var(--color-black-primary)',
        }}
        onClick={handleClick}
        disabled={isToggling}
        aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isFavorited ? (
          <svg
            className={styles.wishlistIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ) : (
          <svg
            className={styles.wishlistIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </button>

      {showLabel && (
        <span className={styles.wishlistButtonLabel}>
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}

      {showFeedback && (
        <div className={styles.wishlistFeedback}>
          {isFavorited ? '♥ Added to Wishlist' : '♡ Removed from Wishlist'}
        </div>
      )}
    </div>
  );
};
    

