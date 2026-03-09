/**
 * Wishlist Context & Provider
 * Manages wishlist state with persistence and API sync
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cacheService } from '@/app/category/lib/cacheService';
// Note: Removed API sync imports - wishlist is now local-only with favorites handled by React Query

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productRating?: number;
  addedAt: number;
}

export interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  getWishlistCount: () => number;
  getWishlistTotal: () => number;
  compareProducts: (productIds: string[]) => WishlistItem[];
  shareWishlist: () => string;
  syncWithAPI: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'user_wishlist';
const WISHLIST_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage only (no API sync)
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Try cache first
        const cached = cacheService.get<WishlistItem[]>(WISHLIST_STORAGE_KEY);
        if (cached) {
          setWishlist(cached);
        } else {
          // Fallback to localStorage directly
          const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setWishlist(parsed);
            // Cache it
            cacheService.set(WISHLIST_STORAGE_KEY, parsed, {
              strategy: 'both',
              ttl: WISHLIST_CACHE_TTL,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        setWishlist([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadWishlist();
  }, []);

  // Save wishlist to storage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      cacheService.set(WISHLIST_STORAGE_KEY, wishlist, {
        strategy: 'memory',
        ttl: WISHLIST_CACHE_TTL,
      });
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback(async (item: Omit<WishlistItem, 'addedAt'>) => {
    setWishlist((prev) => {
      // Check if already exists
      if (prev.some((w) => w.productId === item.productId)) {
        return prev;
      }

      return [
        ...prev,
        {
          ...item,
          id: `wishlist_${item.productId}_${Date.now()}`,
          addedAt: Date.now(),
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.some((item) => item.productId === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(async () => {
    setWishlist([]);
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      cacheService.clear(WISHLIST_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  }, []);

  const getWishlistCount = useCallback((): number => {
    return wishlist.length;
  }, [wishlist]);

  const getWishlistTotal = useCallback((): number => {
    return wishlist.reduce((sum, item) => sum + item.productPrice, 0);
  }, [wishlist]);

  const compareProducts = useCallback((productIds: string[]): WishlistItem[] => {
    return wishlist.filter((item) => productIds.includes(item.productId));
  }, [wishlist]);

  const shareWishlist = useCallback((): string => {
    const encodedWishlist = btoa(JSON.stringify(wishlist));
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/wishlist?shared=${encodedWishlist}`;
  }, [wishlist]);

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    getWishlistTotal,
    compareProducts,
    shareWishlist,
    syncWithAPI: async () => {
      // API sync is now handled by React Query favorites hooks
      // This is kept for backward compatibility but does nothing
    },
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

/**
 * Hook to use wishlist context
 */
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export default WishlistContext;
