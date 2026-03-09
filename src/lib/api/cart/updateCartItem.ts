// src/lib/api/cart/updateCartItem.ts
import type { Cart } from '@/types/cart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api');

export async function updateCartItem({
  cartId,
  itemId,
  quantity,
}: {
  cartId: string | number;
  itemId: number;
  quantity: number;
}): Promise<Cart> {
  const res = await fetch(`${API_BASE}/guest-cart-update-item/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart_id: cartId, item_id: itemId, quantity }),
    credentials: 'include',
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Update cart item failed: ${res.status} ${txt}`);
  }

  return await res.json();
}
