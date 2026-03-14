// src/features/cart/hooks/useCart.ts
// Delegates to the shared CartContext so every consumer (Header, Cart page, etc.)
// reads from the same source of truth.

import { useCartContext } from '@/context/cart/CartContext';
import type { Cart } from '@/types/cart';

/**
 * useCart
 * Thin wrapper around CartContext that keeps the same public API:
 * { cart, loading, error, refreshCart, mutate }
 */
export function useCart() {
  const { cart, loading, error, refreshCart, mutateCart } = useCartContext();

  // Alias mutateCart → mutate so existing call-sites keep working
  const mutate = (
    updater: Cart | ((prev: Cart | null) => Cart | Promise<Cart>),
    options?: { optimisticData?: Cart | null; revalidate?: boolean; rollbackOnError?: boolean }
  ) => mutateCart(updater, options);

  return { cart, loading, error, refreshCart, mutate };
}
