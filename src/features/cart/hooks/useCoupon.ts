import { useState, useCallback } from 'react';
import axios from 'axios';

export interface CouponResponse {
  success: boolean;
  discount_amount: string;
  subtotal: string;
  final_total: string;
  discount_type: string;
  discount_value: string;
  message: string;
}

export interface CouponValidation {
  is_valid: boolean;
  message: string;
  discount_amount?: string;
  discount_type?: string;
  discount_value?: string;
  final_total?: string;
}

export interface CouponDetails {
  code: string;
  description: string;
  discount_type: string;
  discount_value: string;
  is_valid: boolean;
  validity_message: string;
  min_purchase: string;
  valid_until?: string;
}

export const useCoupon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResponse | null>(null);

  const validateCoupon = useCallback(
    async (
      code: string,
      customerEmail: string,
      subtotal: number
    ): Promise<CouponValidation | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          '/api/cart/coupon/validate/',
          {
            code: code.toUpperCase(),
            customer_email: customerEmail,
            subtotal: subtotal.toFixed(2),
          }
        );

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to validate coupon';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const applyCoupon = useCallback(
    async (
      code: string,
      customerEmail: string,
      subtotal: number,
      orderId?: string
    ): Promise<CouponResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          '/api/cart/coupon/apply/',
          {
            code: code.toUpperCase(),
            customer_email: customerEmail,
            subtotal: subtotal.toFixed(2),
            order_id: orderId,
          }
        );

        if (response.data.success) {
          setAppliedCoupon(response.data);
          return response.data;
        } else {
          setError(response.data.message);
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to apply coupon';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCouponDetails = useCallback(
    async (code: string): Promise<CouponDetails | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          '/api/cart/coupon/details/',
          {
            params: { code: code.toUpperCase() },
          }
        );

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch coupon details';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getActiveCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/cart/coupon/active/');
      return response.data.coupons;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch active coupons';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    appliedCoupon,
    validateCoupon,
    applyCoupon,
    getCouponDetails,
    getActiveCoupons,
    removeCoupon,
  };
};
