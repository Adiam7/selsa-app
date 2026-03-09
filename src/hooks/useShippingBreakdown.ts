/**
 * useShippingBreakdown Hook
 * 
 * Manages shipping breakdown state and provides utilities for
 * displaying tiered shipping information in components.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { ShippingBreakdown, ShippingDisplayData } from '@/types/shipping';

interface UseShippingBreakdownOptions {
  currency?: string;
  autoRetry?: boolean;
  retryCount?: number;
}

export function useShippingBreakdown(options: UseShippingBreakdownOptions = {}) {
  const {
    currency = 'USD',
    autoRetry = true,
    retryCount = 3,
  } = options;

  const [breakdown, setBreakdown] = useState<ShippingBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Format shipping breakdown into display data
   */
  const displayData = useMemo<ShippingDisplayData>(() => {
    if (!breakdown) {
      return {
        total: 0,
        breakdown: null,
        currency,
        region: 'INTL',
        isLoading,
        error,
      } as any;
    }

    return {
      total: breakdown.total,
      breakdown,
      currency,
      region: breakdown.region,
      isLoading,
      error,
    };
  }, [breakdown, currency, isLoading, error]);

  /**
   * Calculate total items in breakdown
   */
  const totalItems = useMemo(() => {
    if (!breakdown?.items) return 0;
    return breakdown.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [breakdown]);

  /**
   * Get category breakdown
   */
  const categoryBreakdown = useMemo(() => {
    if (!breakdown?.items) return [];
    return breakdown.items.map((item) => ({
      category: item.category,
      quantity: item.quantity,
      cost: item.cost,
      costPerItem: item.quantity > 0 ? item.cost / item.quantity : 0,
    }));
  }, [breakdown]);

  /**
   * Format shipping cost as currency string
   */
  const formatCost = useCallback(
    (cost: number): string => {
      const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
        CHF: 'CHF',
      };
      const symbol = symbols[currency] || currency;
      return `${symbol}${cost.toFixed(2)}`;
    },
    [currency]
  );

  /**
   * Get region name from code
   */
  const getRegionName = useCallback((regionCode: string): string => {
    const names: Record<string, string> = {
      US: 'United States',
      EU: 'European Union',
      INTL: 'International',
    };
    return names[regionCode] || regionCode;
  }, []);

  /**
   * Check if breakdown should be displayed
   */
  const shouldDisplay = useCallback((): boolean => {
    return !!breakdown && !error && !isLoading;
  }, [breakdown, error, isLoading]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setBreakdown(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    // State
    breakdown,
    isLoading,
    error,

    // Data
    displayData,
    totalItems,
    categoryBreakdown,

    // Methods
    setBreakdown,
    setError,
    setIsLoading,
    formatCost,
    getRegionName,
    shouldDisplay,
    reset,
  };
}

export default useShippingBreakdown;
