/**
 * Scroll Reveal & Animated Components
 * Components that animate as they scroll into view
 */

'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { useScrollReveal, getAnimationDelay } from '../lib/animationHelpers';
import styles from '../styles/page.module.css';

/**
 * Animated Container that reveals on scroll
 */
export const ScrollReveal: React.FC<{
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideIn' | 'zoomIn' | 'scaleIn';
  delay?: number;
  staggerChildren?: boolean;
}> = ({ children, animation = 'fadeIn', delay = 0, staggerChildren = false }) => {
  const { ref, isVisible } = useScrollReveal();

  const animationClass = {
    fadeIn: styles.animateFadeIn,
    slideUp: styles.animateSlideUp,
    slideIn: styles.animateSlideIn,
    zoomIn: styles.animateZoomIn,
    scaleIn: styles.animateScaleIn,
  }[animation];

  return (
    <div
      ref={ref}
      className={`${styles.scrollRevealContainer} ${
        isVisible ? animationClass : ''
      }`}
      style={
        {
          '--animation-delay': `${delay}ms`,
          '--stagger-children': staggerChildren ? '1' : '0',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

/**
 * Staggered List Animation
 */
export const StaggerList: React.FC<{
  items: ReactNode[];
  animation?: string;
  itemDelay?: number;
}> = ({ items, animation = 'fadeIn', itemDelay = 50 }) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div ref={ref} className={styles.staggerListContainer}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.staggerItem} ${
            isVisible ? styles.animateFadeIn : ''
          }`}
          style={{
            '--animation-delay': getAnimationDelay(index),
          } as React.CSSProperties}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

/**
 * Counter with animation
 */
export const AnimatedCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
}> = ({ value, suffix = '', prefix = '' }) => {
  const { ref, isVisible } = useScrollReveal();
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isVisible) return;

    let current = 0;
    const target = value;
    const increment = target / 30;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(Math.round(target));
        clearInterval(interval);
      } else {
        setCount(Math.round(current));
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, value]);

  return (
    <div ref={ref} className={styles.animatedCounterContainer}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
};

/**
 * Parallax Image Component
 */
export const ParallaxImage: React.FC<{
  src: string;
  alt: string;
  factor?: number;
}> = ({ src, alt, factor = 0.5 }) => {
  const [offset, setOffset] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const elementTop = scrollY + rect.top;
        const distance = scrollY - elementTop + window.innerHeight;

        if (distance > 0) {
          setOffset(distance * factor);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [factor]);

  return (
    <div
      ref={ref}
      className={styles.parallaxImageContainer}
      style={
        {
          '--parallax-offset': `${offset}px`,
        } as React.CSSProperties
      }
    >
      <Image src={src} alt={alt} className={styles.parallaxImage} fill style={{ objectFit: 'cover' }} />
    </div>
  );
};

export default ScrollReveal;
