// src/lib/api/cart/removeCartItem.ts
import type { Cart } from '@/types/cart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api');

export async function removeCartItem({ cartId, itemId }: { cartId: string | number; itemId: number }): Promise<Cart> {
  const res = await fetch(`${API_BASE}/guest-cart-remove-item/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart_id: cartId, item_id: itemId }),
    credentials: 'include',
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Remove cart item failed: ${res.status} ${txt}`);
  }

  return await res.json();
}
