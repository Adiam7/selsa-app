'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import styles from '../page.module.css';

interface InfiniteScrollProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // pixels from bottom
  children: React.ReactNode;
}

/**
 * InfiniteScroll Component
 * Automatically loads more items when user scrolls near bottom
 * Perfect for product grids and feeds
 */
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 500,
  children,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading
        ) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <>
      {children}
      {/* Sentinel element for intersection observer */}
      <div
        ref={sentinelRef}
        className={styles.infiniteScrollSentinel}
        aria-live="polite"
        aria-label="Load more items"
      />
      {/* Loading indicator */}
      {isLoading && (
        <div className={styles.infiniteScrollLoading}>
          <div className={styles.infiniteScrollSpinner} />
          <p>{t('Loading more products...')}</p>
        </div>
      )}
      {/* End of list */}
      {!hasMore && (
        <div className={styles.infiniteScrollEnd}>
          <p>{t('✓ You\'ve reached the end')}</p>
        </div>
      )}
    </>
  );
};

export default InfiniteScroll;
