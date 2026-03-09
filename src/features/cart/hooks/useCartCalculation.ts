import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { ShippingBreakdown } from '@/types/shipping';

interface CartItem {
  variant_id: number;
  quantity: number;
  value: string;
}

interface Recipient {
  country_code: string;
  state_code: string;
  zip: string;
}

interface OrderCalculation {
  subtotal: number;
  discount: number;
  subtotal_after_discount: number;
  shipping: number;
  shipping_breakdown?: ShippingBreakdown;
  shipping_info: {
    carrier: string;
    method: string;
    estimated_days?: number;
    days_min?: number;
    days_max?: number;
    source: string;
  };
  tax: number;
  total: number;
  breakdown: {
    subtotal: string;
    discount: string;
    after_discount: string;
    shipping: string;
    tax: string;
    total: string;
  };
}

interface ShippingMethod {
  id: string;
  name: string;
  rate: number;
  days_min?: number;
  days_max?: number;
}

export const useCartCalculation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<OrderCalculation | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  /**
   * Calculate cart total with REAL Printful pricing
   */
  const calculateCartTotal = useCallback(
    async (
      items: CartItem[],
      recipient: Recipient,
      shippingMethod: string = 'STANDARD',
      couponCode?: string,
      customerEmail?: string
    ): Promise<OrderCalculation | null> => {
      setLoading(true);
      setError(null);

      try {
        console.log('🚀 Calculating cart total...');
        console.log('📦 Items:', items);
        console.log('📍 Recipient:', recipient);
        
        const response = await apiClient.post('/orders/cart/calculate/', {
          items,
          recipient,
          shipping_method: shippingMethod,
          coupon_code: couponCode,
          customer_email: customerEmail,
        });

        console.log('✅ Backend Response:', response.data);
        console.log('💰 Subtotal:', response.data.subtotal);
        console.log('📦 Shipping:', response.data.shipping);
        console.log('🏷️ Tax:', response.data.tax);
        console.log('💵 Total:', response.data.total);
        
        setCalculation(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Failed to calculate cart total';
        setError(errorMessage);
        console.error('❌ Cart calculation error:', errorMessage, err);
        console.error('📊 Error status:', err.response?.status);
        console.error('📋 Error data:', err.response?.data);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get available shipping methods for recipient
   */
  const fetchShippingMethods = useCallback(
    async (recipient: Recipient): Promise<ShippingMethod[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get('/orders/cart/shipping-methods/', {
          params: {
            country_code: recipient.country_code,
            state_code: recipient.state_code,
            zip: recipient.zip,
          },
        });

        setShippingMethods(response.data.shipping_methods);
        return response.data.shipping_methods;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Failed to fetch shipping methods';
        setError(errorMessage);
        console.error('Shipping methods error:', errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    calculation,
    shippingMethods,
    calculateCartTotal,
    fetchShippingMethods,
  };
};
