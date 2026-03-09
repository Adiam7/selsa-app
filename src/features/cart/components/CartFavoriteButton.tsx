'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { useFavorite } from '@/features/favourites/hooks/useFavorite';
import type { CartItem } from '@/types/cart';
import styles from './CartFavoriteButton.module.css';

interface CartFavoriteButtonProps {
  item: CartItem;
}

/**
 * Cart Favorite Button Component
 * Displays and allows toggling favorite status for items in cart
 * Uses the same working favorite system as product listings
 */
export const CartFavoriteButton: React.FC<CartFavoriteButtonProps> = ({ item }) => {
  const { data: session } = useSession();
  
  // Debug: log all available data
  console.log('[CartFavoriteButton] Full item:', item);
  console.log('[CartFavoriteButton] All item keys:', Object.keys(item));
  
  // Try to extract product ID from various sources
  // First check if there's a direct product_id or variant with product info
  let productId: string | undefined;
  
  // Try variant_detail first (it might have product_id at a different level)
  if (item.variant_detail) {
    console.log('[CartFavoriteButton] variant_detail full:', JSON.stringify(item.variant_detail, null, 2));
    
    // Check for product ID in variant_detail
    productId = 
      item.variant_detail.product_id?.toString() ||
      item.variant_detail.product?.id?.toString();
  }
  
  // If not found, try other locations
  if (!productId) {
    productId = 
      item.product_variant?.product?.id?.toString() ||
      item.variant?.product?.id?.toString() ||
      item.product_id?.toString();
  }
  
  // Last resort: check if there's an id field directly (might be product ID)
  if (!productId && item.id && typeof item.id === 'number') {
    console.log('[CartFavoriteButton] Checking if item.id might be product ID:', item.id);
  }

  console.log('[CartFavoriteButton] Extracted productId:', productId);

  // Only fetch favorites if user is logged in and we have a product ID
  const { isFavorited, isToggling, toggle } = useFavorite({
    contentType: 'products.product',
    objectId: productId || '',
    enabled: !!session?.user && !!productId,
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      alert('Please log in to save favorites');
      return;
    }

    if (!productId) {
      console.warn('[CartFavoriteButton] No product ID found');
      return;
    }

    if (isToggling) return;

    try {
      await toggle();
    } catch (error: any) {
      if (error?.message?.includes('Not authenticated')) {
        alert('Please log in to save favorites');
      }
    }
  };

  // Don't render if no product ID found
  if (!productId) {
    console.warn('[CartFavoriteButton] Rendering null - no product ID found');
    return null;
  }

  return (
    <button
      className={`${styles.cartFavoriteButton} ${isToggling ? styles.toggling : ''}`}
      onClick={handleClick}
      disabled={isToggling}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={20}
        fill={isFavorited ? 'currentColor' : 'none'}
        color={isFavorited ? '#ef4444' : 'currentColor'}
        style={{ transition: 'all 0.3s ease' }}
      />
    </button>
  );
};
