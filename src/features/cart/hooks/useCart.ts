// src/features/cart/hooks/useCart.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Cart } from '@/types/cart';
import { logBackendStatus } from '@/lib/api/health-check';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const GUEST_CART_KEY = 'guest_cart_id';

/** getOrCreateGuestCartId - same behavior as you had before */
async function getOrCreateGuestCartId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  let guestCartId = localStorage.getItem(GUEST_CART_KEY);

  if (guestCartId) {
    try {
      const res = await fetch(`${API_BASE}/guest-cart/?cart_id=${encodeURIComponent(guestCartId)}`, {
        credentials: 'include', // CRITICAL: Send cookies with GET request
      });
      if (res.ok) return guestCartId;
      localStorage.removeItem(GUEST_CART_KEY);
    } catch {
      // ignore and attempt create below
    }
  }

  try {
    const res = await fetch(`${API_BASE}/guest-cart-create/`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRITICAL: Send cookies with POST request
    });
    if (!res.ok) throw new Error('Failed to create guest cart');
    const json = await res.json();
    const newId = json?.id;
    if (newId) localStorage.setItem(GUEST_CART_KEY, String(newId));
    return newId ? String(newId) : null;
  } catch (err) {
    console.error('getOrCreateGuestCartId error', err);
    return null;
  }
}

/**
 * useCart
 * returns: { cart, loading, error, refreshCart, mutate }
 *
 * mutate supports:
 *  - passing a Cart to set it
 *  - passing an updater function (prev => Cart | Promise<Cart>)
 * options: { optimisticData?, revalidate?, rollbackOnError? }
 */
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const retryRef = useRef<number>(0);

  const fetchGuestCartInternal = useCallback(async (opts?: { signal?: AbortSignal }) => {
    setLoading(true);
    setError(null);

    try {
      const guestCartId = await getOrCreateGuestCartId();
      if (!guestCartId) throw new Error('No guest cart id');

      console.log(`📡 Fetching cart ${guestCartId} from API...`);
      const res = await fetch(`${API_BASE}/guest-cart/?cart_id=${encodeURIComponent(guestCartId)}`, {
        signal: opts?.signal,
        credentials: 'include',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Failed fetching cart: ${res.status} ${txt}`);
      }

      const data = (await res.json()) as Cart | Cart[]; // support either shape
      console.log('📦 Fetched cart data:', data);
      
      const open = Array.isArray(data) ? (data as Cart[]).find((c) => c.status === 'open') || null : (data as Cart);
      console.log(`✅ Cart loaded - Items count: ${open?.items?.length || 0}`);
      
      setCart(open);
      setLoading(false);
      retryRef.current = 0;
      return open;
    } catch (err: any) {
      if (err?.name === 'AbortError') return null;
      
      // Log helpful error message
      console.error('❌ Failed to fetch cart:', err?.message || err);
      if (err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')) {
        console.error('💡 Backend may not be running. Make sure Django server is started.');
        await logBackendStatus();
      }
      
      retryRef.current = (retryRef.current || 0) + 1;
      if (retryRef.current <= 2) {
        const delay = 300 * retryRef.current;
        await new Promise((r) => setTimeout(r, delay));
        return fetchGuestCartInternal(opts);
      }
      setError(err?.message || 'Unable to connect to backend');
      setCart(null);
      setLoading(false);
      return null;
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const result = await fetchGuestCartInternal({ signal: controller.signal });
      controllerRef.current = null;
      return result;
    } catch (err) {
      controllerRef.current = null;
      throw err;
    }
  }, [fetchGuestCartInternal]);

  useEffect(() => {
    refreshCart();
    return () => {
      controllerRef.current?.abort();
    };
  }, [refreshCart]);

  const mutate = useCallback(
    async (
      updater: Cart | ((prev: Cart | null) => Cart | Promise<Cart>),
      options?: { optimisticData?: Cart | null; revalidate?: boolean; rollbackOnError?: boolean }
    ): Promise<Cart | null> => {
      const { optimisticData = undefined, revalidate = true, rollbackOnError = true } = options || {};
      const previous = cart;

      if (optimisticData !== undefined) {
        setCart(optimisticData);
      } else if (typeof updater !== 'function') {
        setCart(updater as Cart);
      }

      try {
        let result: Cart | null = null;
        if (typeof updater === 'function') {
          const maybe = (updater as (p: Cart | null) => Cart | Promise<Cart>)(previous);
          result = await Promise.resolve(maybe);
          if (result) setCart(result);
        } else {
          result = updater as Cart;
          if (result) setCart(result);
        }

        if (revalidate) {
          await refreshCart();
        }
        return result;
      } catch (err) {
        console.error('useCart.mutate error', err);
        if (rollbackOnError) setCart(previous);
        throw err;
      }
    },
    [cart, refreshCart]
  );

  return {
    cart,
    loading,
    error,
    refreshCart,
    mutate,
  };
}
