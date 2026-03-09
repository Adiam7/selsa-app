'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../page.module.css';

interface TrendingItem {
  id: string;
  name: string;
  name_display?: string;
  position: number; // Rank (1, 2, 3, etc.)
  velocity: 'hot' | 'warm' | 'cold';
  growthPercent: number;
  sales?: number;
}

interface TrendingDisplayProps {
  items: TrendingItem[];
  title?: string;
  maxItems?: number;
  showRank?: boolean;
}

export const TrendingDisplay: React.FC<TrendingDisplayProps> = ({
  items,
  title = '🔥 Trending Now',
  maxItems = 5,
  showRank = true,
}) => {
  const { t } = useTranslation();
  const displayItems = items.slice(0, maxItems);

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'hot':
        return '#ef4444';
      case 'warm':
        return '#f97316';
      case 'cold':
        return '#6b7280';
      default:
        return '#cccccc';
    }
  };

  const getVelocityLabel = (velocity: string) => {
    switch (velocity) {
      case 'hot':
        return 'HOT';
      case 'warm':
        return 'WARM';
      case 'cold':
        return 'COOL';
      default:
        return 'NEW';
    }
  };

  return (
    <div className={styles.trendingContainer}>
      <h3 className={styles.trendingTitle}>{title}</h3>
      <div className={styles.trendingList}>
        {displayItems.map((item) => (
          <div key={item.id} className={styles.trendingItem}>
            {showRank && (
              <div
                className={styles.trendingRank}
                data-position={item.position}
              >{t('#')}{item.position}
              </div>
            )}

            <div className={styles.trendingContent}>
              <p className={styles.trendingItemName}>{item.name_display || item.name}</p>
              <div className={styles.trendingMeta}>
                <span
                  className={styles.trendingVelocity}
                  style={{
                    backgroundColor: getVelocityColor(item.velocity),
                  }}
                >
                  {getVelocityLabel(item.velocity)}
                </span>
                <span
                  className={styles.trendingGrowth}
                  style={{
                    color: item.growthPercent > 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  {item.growthPercent > 0 ? '↑' : '↓'} {Math.abs(item.growthPercent)}{t('%')}</span>
                {item.sales && (
                  <span className={styles.trendingSales}>{t('📊')}{item.sales}{t('sales')}</span>
                )}
              </div>
            </div>

            <div className={styles.trendingBar}>
              <div
                className={styles.trendingBarFill}
                style={{
                  width: `${Math.min(item.growthPercent * 5, 100)}%`,
                  backgroundColor: getVelocityColor(item.velocity),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingDisplay;
