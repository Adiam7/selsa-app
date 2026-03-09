'use client';

import styles from '../page.module.css';

export interface BadgeProps {
  isNew?: boolean;
  discount?: number; // percentage
  rating?: number; // 0-5
  reviewCount?: number;
  stockStatus?: 'high' | 'low' | 'out';
  isTrending?: boolean;
}

interface ProductBadgesProps {
  badges: BadgeProps;
  showRating?: boolean;
  showStock?: boolean;
}

export const ProductBadges: React.FC<ProductBadgesProps> = ({
  badges,
  showRating = true,
  showStock = true,
}) => {
  const { isNew, discount, rating, reviewCount, stockStatus, isTrending } = badges;

  return (
    <>
      {/* Badge Container */}
      <div className={styles.badgeContainer}>
        {/* NEW Badge */}
        {isNew && (
          <div className={`${styles.badge} ${styles.badgeNew}`}>{t('🆕 New')}</div>
        )}

        {/* DISCOUNT Badge */}
        {discount && discount > 0 && (
          <div className={`${styles.badge} ${styles.badgeDiscount}`}>
            {discount}{t('% OFF')}</div>
        )}

        {/* TRENDING Badge */}
        {isTrending && (
          <div className={`${styles.badge} ${styles.badgeTrending}`}>{t('🔥 Trending')}</div>
        )}

        {/* RATING Badge */}
        {showRating && rating !== undefined && rating > 0 && (
          <div className={`${styles.badge} ${styles.badgeRating}`}>
            <span className={styles.badgeRatingStar}>⭐</span>
            <span>{rating.toFixed(1)}</span>
            {reviewCount && <span className={styles.reviewCount}>({reviewCount})</span>}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductBadges;
