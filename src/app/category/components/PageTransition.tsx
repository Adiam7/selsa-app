/**
 * Page Transition Component
 * Smooth animations between pages
 */

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../styles/page.module.css';

export interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'reveal';
  duration?: number;
}

/**
 * Page Transition Component
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType = 'fade',
  duration = 300,
}) => {
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const handleNavigationStart = () => {
    setIsExiting(true);
  };

  const transitionClass = {
    fade: styles.transitionFade,
    slide: styles.transitionSlide,
    scale: styles.transitionScale,
    reveal: styles.transitionReveal,
  }[transitionType];

  return (
    <div
      className={`${styles.pageTransition} ${transitionClass} ${
        isExiting ? styles.pageTransitionExit : ''
      }`}
      style={
        {
          '--transition-duration': `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default PageTransition;
