// lib/api/cart/getOrCreateGuestCartId.ts
import { createGuestCart } from "./createGuestCart";

export async function getOrCreateGuestCartId(): Promise<string | null> {
  let cartId = null;
  if (typeof window !== "undefined") {
    cartId = localStorage.getItem("guest_cart_id");

    if (!cartId) {
      cartId = await createGuestCart();
      if (cartId) {
        localStorage.setItem("guest_cart_id", cartId);
      }
    }
  }
  return cartId;
}