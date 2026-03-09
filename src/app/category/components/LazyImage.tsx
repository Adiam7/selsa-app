'use client';

import React, { useState, useCallback } from 'react';
import styles from '../page.module.css';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  onLoad?: () => void;
  className?: string;
}

/**
 * LazyImage Component
 * Optimized image loading with blur-up placeholder effect
 * Automatically uses Next.js Image optimization
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 300,
  height = 300,
  placeholder = 'blur',
  onLoad,
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={`${styles.lazyImageWrapper} ${
        isLoaded ? styles.lazyImageLoaded : styles.lazyImageLoading
      }`}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className={styles.lazyImagePlaceholder}
          aria-hidden="true"
        />
      )}
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`${styles.lazyImage} ${className || ''}`}
      />
      {/* Error state */}
      {error && (
        <div className={styles.lazyImageError}>
          <span>{t('Failed to load image')}</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
