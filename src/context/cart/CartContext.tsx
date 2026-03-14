// // Optional: just export from hooks for simpler imports
// // File:-  selsa-frontend/src/context/cart/CartContext.tsx
// 'use client';
// import React, { createContext, useContext, ReactNode, useState } from 'react';

// interface CartContextType {
//   cart: any; // replace with your cart type
//   setCart: React.Dispatch<React.SetStateAction<any>>;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cart, setCart] = useState(null);

//   return (
//     <CartContext.Provider value={{ cart, setCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) throw new Error('useCart must be used within CartProvider');
//   return context;
// }


// context/CartContext.tsx
'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Cart } from '@/types/cart';
import { getOrCreateGuestCartId } from '@/lib/api/cart/getOrCreateGuestCartId';
import { getGuestCart } from '@/lib/api/cart/getGuestCart';

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<Cart | null>;
  mutateCart: (
    updater: Cart | ((prev: Cart | null) => Cart | Promise<Cart>),
    options?: { optimisticData?: Cart | null; revalidate?: boolean; rollbackOnError?: boolean }
  ) => Promise<Cart | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async (): Promise<Cart | null> => {
    setLoading(true);
    setError(null);

    try {
      const cartId = await getOrCreateGuestCartId();
      if (!cartId) throw new Error('No cart id');

      const data = await getGuestCart(cartId);
      setCart(data);
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch cart');
      setCart(null);
      setLoading(false);
      return null;
    }
  }, []);

  const refreshCart = useCallback(() => fetchCart(), [fetchCart]);

  const mutateCart = useCallback(
    async (
      updater: Cart | ((prev: Cart | null) => Cart | Promise<Cart>),
      options?: { optimisticData?: Cart | null; revalidate?: boolean; rollbackOnError?: boolean }
    ) => {
      const { optimisticData, revalidate = true, rollbackOnError = true } = options || {};
      const previous = cart;

      try {
        if (optimisticData !== undefined) {
          setCart(optimisticData);
        } else if (typeof updater !== 'function') {
          setCart(updater as Cart);
        }

        let result: Cart | null;
        if (typeof updater === 'function') {
          result = await Promise.resolve((updater as Function)(previous));
        } else {
          result = updater;
        }

        if (result) setCart(result);

        if (revalidate) {
          await fetchCart();
        }

        return result;
      } catch (err) {
        if (rollbackOnError) setCart(previous);
        throw err;
      }
    },
    [cart, fetchCart]
  );

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, loading, error, refreshCart, mutateCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
};
