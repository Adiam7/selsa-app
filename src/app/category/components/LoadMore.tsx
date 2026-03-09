'use client';

import React from 'react';
import styles from '../page.module.css';

interface LoadMoreProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  itemCount: number;
  totalCount?: number;
}

/**
 * LoadMore Component
 * Manual load more button for pagination
 * Shows remaining items count
 */
export const LoadMore: React.FC<LoadMoreProps> = ({
  onLoadMore,
  hasMore,
  isLoading,
  itemCount,
  totalCount,
}) => {
  const remainingCount = totalCount ? totalCount - itemCount : null;

  return (
    <div className={styles.loadMoreContainer}>
      {hasMore ? (
        <>
          <button
            className={`${styles.loadMoreButton} ${
              isLoading ? styles.loadMoreButtonLoading : ''
            }`}
            onClick={onLoadMore}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.loadMoreSpinner} />
                Loading...
              </>
            ) : (
              <>
                Load More Products
                {remainingCount && (
                  <span className={styles.loadMoreCount}>{t('(')}{remainingCount}{t('remaining)')}</span>
                )}
              </>
            )}
          </button>

          {remainingCount && (
            <p className={styles.loadMoreInfo}>{t('Showing')}{itemCount}{t('of')}{totalCount}{t('products')}</p>
          )}
        </>
      ) : (
        <div className={styles.loadMoreEnd}>
          <p className={styles.loadMoreEndIcon}>✓</p>
          <p className={styles.loadMoreEndText}>{t('You\'ve viewed all')}{itemCount}{t('products')}</p>
        </div>
      )}
    </div>
  );
};

export default LoadMore;
