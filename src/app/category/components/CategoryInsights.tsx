'use client';

import React from 'react';
import styles from '../page.module.css';

interface CategoryInsight {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

interface CategoryInsightsProps {
  insights: CategoryInsight[];
  categoryName?: string;
  onViewAnalytics?: () => void;
}

export const CategoryInsights: React.FC<CategoryInsightsProps> = ({
  insights,
  categoryName,
  onViewAnalytics,
}) => {
  const getColorClass = (color?: string) => {
    switch (color) {
      case 'success':
        return styles.insightSuccess;
      case 'warning':
        return styles.insightWarning;
      case 'danger':
        return styles.insightDanger;
      case 'info':
        return styles.insightInfo;
      default:
        return styles.insightDefault;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'neutral':
        return '→';
      default:
        return '';
    }
  };

  return (
    <div className={styles.insightsContainer}>
      <div className={styles.insightsHeader}>
        <div>
          {categoryName && (
            <h2 className={styles.insightsTitle}>{t('📊')}{categoryName}{t('Insights')}</h2>
          )}
          <p className={styles.insightsSubtitle}>{t('Real-time category performance metrics')}</p>
        </div>
        {onViewAnalytics && (
          <button
            className={styles.viewAnalyticsButton}
            onClick={onViewAnalytics}
          >{t('View Full Analytics →')}</button>
        )}
      </div>
      <div className={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`${styles.insightCard} ${getColorClass(insight.color)}`}
          >
            <div className={styles.insightTop}>
              <span className={styles.insightIcon}>{insight.icon}</span>
              {insight.trend && (
                <span
                  className={styles.insightTrend}
                  style={{
                    color:
                      insight.trend === 'up'
                        ? '#22c55e'
                        : insight.trend === 'down'
                          ? '#ef4444'
                          : '#999999',
                  }}
                >
                  {getTrendIcon(insight.trend)}
                </span>
              )}
            </div>

            <p className={styles.insightTitle}>{insight.title}</p>
            <p className={styles.insightValue}>{insight.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryInsights;
