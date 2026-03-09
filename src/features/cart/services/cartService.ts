// src/features/cart/services/cartService.ts

import { getGuestCart } from "@/lib/api/cart/getGuestCart";
import { getOrCreateGuestCartId } from "@/lib/api/cart/getOrCreateGuestCartId";

import {
  addCartItem,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
} from "@/lib/api/cart-items";

import { fetchWithLanguage } from "@/utils/fetchWithLanguage";
import { getSession } from 'next-auth/react';

const GUEST_CART_KEY = "guest_cart_id";

async function getAuthToken() {
  try {
    const session = await getSession();
    const token = (session?.user as any)?.accessToken;
    if (token) return String(token);
  } catch {
    // ignore
  }
  return null;
}

// Fetch the current cart for logged in user or guest
export async function fetchCart() {
  const token = await getAuthToken();
  const guestCartId = typeof window !== "undefined" ? localStorage.getItem(GUEST_CART_KEY) : null;

  if (token) {
    // Authenticated user cart fetch
    const res = await fetchWithLanguage("/api/cart/my/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch user cart");
    return await res.json();
  }

  if (guestCartId) {
    // Guest cart fetch
    const cart = await getGuestCart(guestCartId);
    if (!cart) throw new Error("Failed to fetch guest cart");
    return cart;
  }

  // Create (or reuse) a guest cart if none exists
  const newCartId = await getOrCreateGuestCartId();
  if (!newCartId) throw new Error("Unable to get or create cart");
  return await getGuestCart(newCartId);
}

// Get or create guest cart id in localStorage
export async function getGuestCartId() {
  const id = await getOrCreateGuestCartId();
  if (id) localStorage.setItem(GUEST_CART_KEY, id);
  return id;
}

export async function addToCart({
  variantId,
  quantity,
  cartId,
}: {
  variantId: number;
  quantity: number;
  cartId?: string;
}) {
  const token = await getAuthToken();
  return addCartItem(cartId ?? null, variantId, quantity, token ?? undefined);
}

export async function removeCartItem(cartItemId: number) {
  const token = await getAuthToken();
  return removeCartItemApi(cartItemId, token ?? undefined);
}

export async function updateCartItem({
  cartItemId,
  quantity,
}: {
  cartItemId: number;
  quantity: number;
}) {
  const token = await getAuthToken();
  return updateCartItemApi(cartItemId, quantity, token ?? undefined);
}

// Merge guest cart into logged-in user's cart and clear guest cart id
export async function mergeGuestCartToUser() {
  // Cart merge is currently disabled until the backend supports it reliably.
  return;
}
