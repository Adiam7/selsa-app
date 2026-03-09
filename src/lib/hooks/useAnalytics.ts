/**
 * useAnalytics Hook
 * Simple way to track user events from React components
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/services/analytics';

/**
 * Hook to automatically track page views
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const safePathname = pathname ?? '';
    const pageName = safePathname.replace(/^\//, '').replace(/\//g, '_') || 'home';
    const params = Object.fromEntries(
      Array.from((searchParams ?? new URLSearchParams()).entries())
    );

    analytics.trackPageView(pageName, {
      pathname: safePathname,
      searchParams: params,
    });
  }, [pathname, searchParams]);
}

/**
 * Hook to manually track product interactions
 */
export function useProductTracking() {
  return {
    trackViewed: (productId: string, productName?: string, price?: number) => {
      analytics.trackProductInteraction('viewed', productId, {
        productName,
        price,
      });
    },
    trackAddedToCart: (productId: string, productName?: string, price?: number, quantity?: number) => {
      analytics.trackProductInteraction('added_to_cart', productId, {
        productName,
        price,
        quantity,
      });
    },
    trackRemovedFromCart: (productId: string) => {
      analytics.trackProductInteraction('removed_from_cart', productId);
    },
    trackFavorited: (productId: string, productName?: string) => {
      analytics.trackProductInteraction('favorited', productId, {
        productName,
      });
    },
    trackUnfavorited: (productId: string) => {
      analytics.trackProductInteraction('unfavorited', productId);
    },
  };
}

/**
 * Hook to track checkout progress
 */
export function useCheckoutTracking() {
  return {
    trackCheckoutStarted: (cartValue?: number, itemCount?: number) => {
      analytics.trackCheckoutEvent('started', {
        cartValue,
        itemCount,
      });
    },
    trackAddressEntered: (country?: string, state?: string) => {
      analytics.trackCheckoutEvent('address_entered', {
        country,
        state,
      });
    },
    trackPaymentEntered: (paymentMethod?: string) => {
      analytics.trackCheckoutEvent('payment_entered', {
        paymentMethod,
      });
    },
    trackOrderCompleted: (orderId: string, orderValue?: number, itemCount?: number) => {
      analytics.trackCheckoutEvent('completed', {
        orderId,
        orderValue,
        itemCount,
      });
    },
    trackCheckoutAbandoned: (reason?: string, cartValue?: number) => {
      analytics.trackCheckoutEvent('abandoned', {
        reason,
        cartValue,
      });
    },
  };
}

/**
 * Hook to track search and filter actions
 */
export function useSearchTracking() {
  return {
    trackSearch: (query: string, resultsCount?: number, category?: string) => {
      analytics.trackSearch(query, resultsCount);
    },
    trackFilter: (filterType: string, value: string, categoryName?: string) => {
      analytics.trackFilterAction(filterType, value, {
        categoryName,
      });
    },
  };
}

/**
 * Hook to track authentication events
 */
export function useAuthTracking() {
  return {
    trackLoginStarted: () => {
      analytics.trackAuthEvent('login_started');
    },
    trackLoginCompleted: (provider?: string) => {
      analytics.trackAuthEvent('login_completed', {
        provider,
      });
    },
    trackLoginFailed: (reason?: string) => {
      analytics.trackAuthEvent('login_failed', {
        reason,
      });
    },
    trackSignupStarted: () => {
      analytics.trackAuthEvent('signup_started');
    },
    trackSignupCompleted: (provider?: string) => {
      analytics.trackAuthEvent('signup_completed', {
        provider,
      });
    },
    trackLogout: () => {
      analytics.trackAuthEvent('logout');
    },
  };
}

/**
 * Hook to get current session analytics data
 */
export function useAnalyticsData() {
  const getSessionMetrics = () => analytics.getSessionMetrics();
  const getUserJourney = () => analytics.getUserJourney();
  const getConversionFunnel = () => analytics.getConversionFunnel();

  return {
    getSessionMetrics,
    getUserJourney,
    getConversionFunnel,
    exportData: () => analytics.exportSessionData(),
  };
}

export default analytics;
