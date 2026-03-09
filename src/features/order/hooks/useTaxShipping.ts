// src/features/order/hooks/useTaxShipping.ts
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface OrderTotalCalculation {
  subtotal: string;
  discount: string;
  subtotal_after_discount: string;
  tax: string;
  tax_rate: string;
  shipping: string;
  shipping_method: string;
  total: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  cost: string;
  estimate: string;
}

export const useTaxShipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<OrderTotalCalculation | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  const calculateOrderTotal = useCallback(
    async (options: {
      subtotal: number;
      state: string;
      shippingMethod?: string;
      zipCode?: string;
      discount?: number;
      couponCode?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          '/orders/calculate/total/',
          {
            subtotal: options.subtotal.toString(),
            state: options.state,
            shipping_method: options.shippingMethod || 'standard',
            zip_code: options.zipCode || '',
            discount: (options.discount || 0).toString(),
            coupon_code: options.couponCode,
          }
        );

        setOrderTotal(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error || err?.message || 'Failed to calculate order total';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getShippingMethods = useCallback(
    async (options: { state: string; zipCode?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          state: options.state,
          zip_code: options.zipCode || '',
        });

        const response = await apiClient.get(
          `/orders/shipping/methods/?${params}`
        );

        setShippingMethods(response.data.methods);
        return response.data.methods;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error || err?.message || 'Failed to get shipping methods';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const calculateTax = useCallback(
    async (options: { subtotal: number; state: string }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          '/orders/tax/calculate/',
          {
            subtotal: options.subtotal.toString(),
            state: options.state,
          }
        );

        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error || err?.message || 'Failed to calculate tax';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const calculateShipping = useCallback(
    async (options: {
      method: string;
      state: string;
      zipCode?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          '/orders/shipping/calculate/',
          {
            method: options.method,
            state: options.state,
            zip_code: options.zipCode || '',
          }
        );

        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error || err?.message || 'Failed to calculate shipping';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getTaxRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/orders/tax/rates/');

      return response.data.rates;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || 'Failed to get tax rates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    calculateOrderTotal,
    getShippingMethods,
    calculateTax,
    calculateShipping,
    getTaxRates,
    orderTotal,
    shippingMethods,
    loading,
    error,
  };
};
