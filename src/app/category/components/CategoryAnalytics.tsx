'use client';

import React from 'react';
import styles from '../page.module.css';

interface CategoryStats {
  productCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  avgRating?: number;
  reviewCount?: number;
  percentageChange?: number; // Month over month
  salesVelocity?: 'hot' | 'warm' | 'cold'; // For trending indicator
}

interface CategoryAnalyticsProps {
  stats: CategoryStats;
  showDetailed?: boolean;
  compact?: boolean;
}

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
  stats,
  showDetailed = false,
  compact = false,
}) => {
  const getVelocityColor = (velocity?: string) => {
    switch (velocity) {
      case 'hot':
        return '#ef4444'; // Red
      case 'warm':
        return '#f97316'; // Orange
      case 'cold':
        return '#6b7280'; // Gray
      default:
        return '#cccccc';
    }
  };

  const getVelocityLabel = (velocity?: string) => {
    switch (velocity) {
      case 'hot':
        return '🔥 Hot';
      case 'warm':
        return '📈 Trending';
      case 'cold':
        return '❄️ Cold';
      default:
        return 'New';
    }
  };

  if (compact) {
    return (
      <div className={styles.analyticsCompact}>
        {/* Product Count */}
        <div className={styles.analyticsStatMini}>
          <span className={styles.analyticsLabel}>{t('Products')}</span>
          <span className={styles.analyticsValue}>{stats.productCount}</span>
        </div>
        {/* Trending Badge */}
        {stats.isTrending && (
          <div className={styles.analyticsBadgeMini}>{t('🔥 Trending')}</div>
        )}
        {/* New Badge */}
        {stats.isNew && (
          <div className={styles.analyticsBadgeMini}>{t('🆕 New')}</div>
        )}
        {/* Growth Indicator */}
        {stats.percentageChange !== undefined && (
          <div
            className={styles.analyticsGrowth}
            style={{
              color: stats.percentageChange > 0 ? '#22c55e' : '#ef4444',
            }}
          >
            {stats.percentageChange > 0 ? '↑' : '↓'} {Math.abs(stats.percentageChange)}{t('%')}</div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsGrid}>
        {/* Main Stats */}
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsStatLabel}>{t('Total Products')}</div>
          <div className={styles.analyticsStatValue}>{stats.productCount}</div>
          <div className={styles.analyticsStatSubtext}>
            {stats.productCount > 50 ? '✓ Well-stocked' : '↑ Limited selection'}
          </div>
        </div>

        {/* Average Rating */}
        {stats.avgRating && (
          <div className={styles.analyticsStat}>
            <div className={styles.analyticsStatLabel}>{t('Average Rating')}</div>
            <div className={styles.analyticsStatValue}>
              {stats.avgRating.toFixed(1)}{t('⭐')}</div>
            <div className={styles.analyticsStatSubtext}>
              {stats.reviewCount || 0}{t('reviews')}</div>
          </div>
        )}

        {/* Trending Indicator */}
        {stats.isTrending && (
          <div className={styles.analyticsStat}>
            <div className={styles.analyticsStatLabel}>{t('Trending')}</div>
            <div className={styles.analyticsStatValue}>
              <span style={{ color: getVelocityColor(stats.salesVelocity) }}>
                {getVelocityLabel(stats.salesVelocity)}
              </span>
            </div>
            <div className={styles.analyticsStatSubtext}>{t('Popular with customers')}</div>
          </div>
        )}

        {/* Growth Rate */}
        {stats.percentageChange !== undefined && (
          <div className={styles.analyticsStat}>
            <div className={styles.analyticsStatLabel}>{t('Monthly Growth')}</div>
            <div
              className={styles.analyticsStatValue}
              style={{
                color: stats.percentageChange > 0 ? '#22c55e' : '#ef4444',
              }}
            >
              {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange}{t('%')}</div>
            <div className={styles.analyticsStatSubtext}>{t('vs. last month')}</div>
          </div>
        )}
      </div>
      {/* Detailed View */}
      {showDetailed && (
        <div className={styles.analyticsDetails}>
          <h4 className={styles.analyticsDetailsTitle}>{t('Category Insights')}</h4>
          <ul className={styles.analyticsList}>
            {stats.productCount > 100 && (
              <li className={styles.analyticsListItem}>{t('✓ Extensive product range with')}{stats.productCount}{t('options')}</li>
            )}
            {stats.isTrending && (
              <li className={styles.analyticsListItem}>{t('🔥 Currently trending -')}{stats.salesVelocity === 'hot' ? 'Very popular' : 'Growing in popularity'}
              </li>
            )}
            {stats.isNew && (
              <li className={styles.analyticsListItem}>{t('🆕 New category - Recently added to our store')}</li>
            )}
            {stats.avgRating && stats.avgRating > 4 && (
              <li className={styles.analyticsListItem}>{t('⭐ Highly rated by customers (')}{stats.avgRating.toFixed(1)}{t('/5)')}</li>
            )}
            {stats.reviewCount && stats.reviewCount > 0 && (
              <li className={styles.analyticsListItem}>{t('💬')}{stats.reviewCount}{t('verified customer reviews')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryAnalytics;
