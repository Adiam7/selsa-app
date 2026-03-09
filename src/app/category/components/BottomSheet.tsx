/**
 * Bottom Sheet Component
 * Mobile-friendly modal that slides up from bottom
 */

'use client';

import React, { useRef, useEffect } from 'react';
import styles from '../styles/page.module.css';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'full' | 'half' | 'auto';
}

/**
 * Bottom Sheet Modal Component
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'half',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  // Handle touch drag to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startYRef.current;

    // Close if dragged down more than 30%
    if (diff > 100) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const heightClass = {
    full: styles.bottomSheetFull,
    half: styles.bottomSheetHalf,
    auto: styles.bottomSheetAuto,
  }[height];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.bottomSheetOverlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`${styles.bottomSheet} ${heightClass} ${
          isOpen ? styles.bottomSheetOpen : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle Bar */}
        <div className={styles.bottomSheetHandle}>
          <div className={styles.bottomSheetHandleBar} />
        </div>

        {/* Header */}
        {title && (
          <div className={styles.bottomSheetHeader}>
            <h2 className={styles.bottomSheetTitle}>{title}</h2>
            <button
              className={styles.bottomSheetCloseBtn}
              onClick={onClose}
              aria-label="Close"
            >{t('✕')}</button>
          </div>
        )}

        {/* Content */}
        <div className={styles.bottomSheetContent}>
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
