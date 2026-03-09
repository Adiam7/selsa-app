// lib/utils/cartUtils.ts
// selsa-frontend/src/lib/utils/cartUtils.ts
// Utility functions for managing guest carts in localStorage and via API
// This file provides functions to create, retrieve, and store guest cart IDs.
// It interacts with the backend API to create a new guest cart and stores the cart ID in
// localStorage for later use.
// It also handles the case where a guest cart already exists by checking localStorage first.     


const GUEST_CART_KEY = 'guest_cart_id';

// Fetch cart ID from localStorage
export function getGuestCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_CART_KEY);
}

// Store guest cart ID in localStorage
export function storeGuestCartId(id: string): void {
  // In jsdom tests, `global.window` can be removed to simulate SSR
  // Using `global.window` (not the bare `window` binding) so deletion is detected
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (global as any).window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, id);
  } catch {
    // localStorage unavailable (SSR)
  }
}

// Create guest cart via API
export async function createGuestCart(): Promise<string> {
  const res = await fetch('/api/cart/create/', {
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('❌ Failed to create guest cart:', text);
    throw new Error('Failed to create guest cart');
  }

  const data = await res.json();

  if (!data?.id) {
    throw new Error('Invalid guest cart response');
  }

  storeGuestCartId(data.id);
  return data.id;
}

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE?.replace(/\/api\/?$/, '') || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

/**
 * Get or create a guest cart ID.
 * - If a cart ID exists in localStorage, validates it with the backend.
 *   On validation failure the stale ID is removed and a fresh cart is created.
 * - If no cart ID exists, a new guest cart is created immediately.
 * - Returns null in SSR or when creation fails.
 */
export const getOrCreateGuestCartId = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  const existingId = localStorage.getItem(GUEST_CART_KEY);

  if (existingId) {
    try {
      const validateRes = await fetch(
        `${BACKEND_BASE}/api/guest-cart/?cart_id=${existingId}`
      );
      if (validateRes.ok) {
        return existingId;
      }
      // Cart is no longer valid on the server
      localStorage.removeItem(GUEST_CART_KEY);
    } catch {
      // Network error during validation — fall through to create a new cart
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }

  // Create a new guest cart
  try {
    const createRes = await fetch('/api/cart/guest-create', { method: 'POST' });
    if (!createRes.ok) return null;
    const data = await createRes.json();
    const newId: string | undefined = data?.id ? String(data.id) : undefined;
    if (!newId) return null;
    localStorage.setItem(GUEST_CART_KEY, newId);
    return newId;
  } catch {
    return null;
  }
};
