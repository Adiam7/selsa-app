import { useState, useRef } from 'react';
import type { Order } from '@/types/order';
import { createOrder, OrderVerificationPayload, type CheckoutError } from '@/lib/api/orders';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const usePlaceOrder = () => {
  const [placingOrder, setPlacingOrder] = useState(false);
  const placingRef = useRef(false);
  const router = useRouter();

  const placeOrder = async (
    cartId: number,
    verification?: OrderVerificationPayload,
    idempotencyKey?: string
  ): Promise<Order | null> => {
    if (placingRef.current || !cartId) return null;
    placingRef.current = true;

    try {
      setPlacingOrder(true);
      const order = await createOrder({ cartId, verification, idempotencyKey });
      toast.success('🎉 Order placed successfully!');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('selsa_checkout_payload');
        window.localStorage.removeItem(`selsa_checkout_idempotency_${cartId}`);
        window.localStorage.removeItem(`selsa_checkout_progress_${cartId}`);
      }
      // NOTE: Do NOT router.push here — the caller (e.g. handleAutoPlaceOrder
      // in the checkout page) is responsible for the redirect destination.
      return order;
    } catch (error: unknown) {
      const err = error as CheckoutError;
      const code = err?.code;
      const message = err?.message;

      switch (code) {
        case 'price_changed':
          if (typeof window !== 'undefined' && err?.totals) {
            window.localStorage.setItem('selsa_price_change_totals', JSON.stringify(err.totals));
          }
          toast.error(message || 'Price changed. Please review your order.');
          router.push('/checkout');
          return null;

        case 'idempotency_in_progress':
          toast.error(message || 'Checkout already in progress.');
          return null;

        case 'cart_empty':
          toast.error('Your cart is empty. Add items before checking out.');
          router.push('/cart');
          return null;

        case 'inventory_unavailable': {
          const items = err?.details;
          if (items && items.length > 0) {
            const summary = items
              .map((i) => `${i.sku || `Item #${i.variant_id}`}: ${i.available} left`)
              .join(', ');
            toast.error(`Some items are no longer available: ${summary}`);
          } else {
            toast.error(message || 'Some items are out of stock. Please update your cart.');
          }
          router.push('/cart');
          return null;
        }

        case 'checkout_failed':
          toast.error(message || 'Checkout failed. Please try again.');
          return null;

        case 'internal_error':
          toast.error('An unexpected error occurred. Please try again later.');
          return null;

        default:
          toast.error(message || 'Failed to place order.');
          return null;
      }
    } finally {
      placingRef.current = false;
      setPlacingOrder(false);
    }
  };

  return { placeOrder, placingOrder };
};
