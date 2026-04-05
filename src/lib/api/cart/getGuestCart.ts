// lib/api/cart/getGuestCart.ts

import { getCurrentLanguage } from '@/utils/fetchWithLanguage';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api');

export async function getGuestCart(cartId: string) {
  try {
    const res = await fetch(`${BASE_URL}/guest-cart/?cart_id=${cartId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCurrentLanguage(),
      },
      credentials: "include", // Include cookies to maintain Django session
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch guest cart: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error retrieving guest cart");
    return null;
  }
}