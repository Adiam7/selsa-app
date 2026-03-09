'use client';

import React from 'react';
import styles from '../page.module.css';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'grid' | 'list' | 'card';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 6, type = 'grid' }) => {
  return (
    <div className={`${styles.skeletonContainer} ${styles[`skeleton${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonText} style={{ width: '80%' }} />
            <div className={styles.skeletonText} style={{ width: '60%' }} />
            <div className={styles.skeletonText} style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CategorySkeleton: React.FC = () => (
  <SkeletonLoader count={12} type="grid" />
);

export const ProductSkeleton: React.FC = () => (
  <SkeletonLoader count={8} type="grid" />
);

export default SkeletonLoader;
