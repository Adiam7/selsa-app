/**
 * Animation Helpers & Utilities
 * Reusable animation functions and hooks
 */

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Observer for scroll-based animations
 */
export function useIntersectionObserver(
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [callback, options]);

  return ref;
}

/**
 * Stagger animation helper
 * Delays each child element's animation
 */
export function getStaggerDelay(index: number, interval = 50): number {
  return index * interval;
}

/**
 * Parallax scroll effect
 */
export function useParallax(factor = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementOffset = window.scrollY + rect.top - window.innerHeight;
        setOffset(window.scrollY * factor);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [factor]);

  return { ref, offset };
}

/**
 * Scroll reveal animation hook
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Text character-by-character animation
 */
export function useTypeAnimation(text: string, speed = 50) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayText;
}

/**
 * Counter animation (0 to target number)
 */
export function useCounterAnimation(
  target: number,
  duration = 1000,
  shouldStart = true
) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;

    setIsAnimating(true);
    const increment = target / (duration / 16); // ~60fps
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(Math.round(target));
        setIsAnimating(false);
        clearInterval(interval);
      } else {
        setCount(Math.round(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [target, duration, shouldStart]);

  return { count, isAnimating };
}

/**
 * Bounce animation trigger
 */
export function useBounce() {
  const [bounce, setBounce] = useState(false);

  const trigger = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 600);
  };

  return { bounce, trigger };
}

/**
 * Shake animation trigger
 */
export function useShake() {
  const [shake, setShake] = useState(false);

  const trigger = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return { shake, trigger };
}

/**
 * Get CSS variable for staggered animations
 */
export function getAnimationDelay(index: number): string {
  return `${index * 0.1}s`;
}

/**
 * Ease functions for animations
 */
export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

/**
 * Request animation frame helper
 */
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const idRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = currentTime - lastTimeRef.current;
        callback(deltaTime);
      }
      lastTimeRef.current = currentTime;
      idRef.current = requestAnimationFrame(animate);
    };

    idRef.current = requestAnimationFrame(animate);

    return () => {
      if (idRef.current !== undefined && idRef.current !== null) {
        cancelAnimationFrame(idRef.current as number);
      }
    };
  }, [callback]);
}

/**
 * Smooth scroll to element
 */
export function smoothScroll(element: HTMLElement, options?: ScrollIntoViewOptions) {
  element.scrollIntoView({
    behavior: 'smooth',
    ...options,
  });
}

/**
 * Animate scroll position
 */
export function animateScroll(
  target: number,
  duration = 800,
  onComplete?: () => void
) {
  const startY = window.scrollY;
  const distance = target - startY;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    window.scrollTo(0, startY + distance * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  requestAnimationFrame(animate);
}

export default {
  useIntersectionObserver,
  getStaggerDelay,
  useParallax,
  useScrollReveal,
  useTypeAnimation,
  useCounterAnimation,
  useBounce,
  useShake,
  getAnimationDelay,
  easing,
  useAnimationFrame,
  smoothScroll,
  animateScroll,
};
