/**
 * Touch Gesture Handler
 * Handle swipe and touch gestures for mobile
 */

'use client';

import React, { useRef, useCallback, ReactNode } from 'react';

export interface TouchGestureHandlerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  threshold?: number; // Minimum distance to trigger (default: 50px)
  children: ReactNode;
}

interface Touch {
  x: number;
  y: number;
  time: number;
}

/**
 * Touch Gesture Handler for Mobile
 */
export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  threshold = 50,
  children,
}) => {
  const startTouchRef = useRef<Touch | null>(null);
  const lastTapRef = useRef<number>(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startTouchRef.current) return;

      const endTouch = e.changedTouches[0];
      const endX = endTouch.clientX;
      const endY = endTouch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startTouchRef.current.x;
      const deltaY = endY - startTouchRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = endTime - startTouchRef.current.time;

      // Check for double tap
      const now = Date.now();
      if (now - lastTapRef.current < 300 && distance < 20) {
        onDoubleTap?.();
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }

      // Only trigger swipe if distance is significant
      if (distance < threshold || duration > 300) {
        return;
      }

      // Determine swipe direction
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

      if (isHorizontal) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      if (isVertical) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      startTouchRef.current = null;
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, threshold]
  );

  return (
    <div
      ref={elementRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      {children}
    </div>
  );
};

/**
 * Hook for using touch gestures
 */
export const useSwipe = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) => {
  const startTouchRef = useRef<Touch | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startTouchRef.current) return;

      const endTouch = e.changedTouches[0];
      const endX = endTouch.clientX;
      const endY = endTouch.clientY;
      const duration = Date.now() - startTouchRef.current.time;

      const deltaX = endX - startTouchRef.current.x;
      const deltaY = endY - startTouchRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < threshold || duration > 300) {
        return;
      }

      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      startTouchRef.current = null;
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

export default TouchGestureHandler;
