// lib/api/cart.ts

import { apiClient } from './client';
import type { Cart } from "@/types/cart";
import logger from "@/lib/logger";

/** ---- Types ---- **/
export interface AddToCartParams {
  cartId: number;
  variant: { id: number };
  image: string;
  quantity: number;
  optionValues?: number[]; // array of ProductOptionValue IDs
  isAuthenticated?: boolean;
}

/** ---- Add to Cart ---- **/
// export async function addToCart({
//   cartId,
//   productVariantId,
//   quantity,
//   optionValues = [],
//   isAuthenticated = false,
// }: AddToCartParams): Promise<Cart> {
//   const payload = {
//     cart: cartId,
//     product_variant: productVariantId,
//     quantity,
//     option_values: optionValues,
//   };

//   // axios automatically handles JSON + CORS headers
//   const res = await axios.post(`${BASE_URL}/cart-items/`, payload, {
//     withCredentials: isAuthenticated, // only send cookies for logged-in users
//   });

//   // Return the server's updated cart object (if your backend returns one)
//   return res.data as Cart;
// }
/** ---- Add to Cart ---- **/
export async function addToCart({
  cartId,
  variant,
  image,
  quantity,
  optionValues = [],
  isAuthenticated = false,

}: AddToCartParams): Promise<Cart> {
  
  const payload = {
    cart: cartId,
    variant: variant.id,
    image_url: image, 
    quantity: quantity,
    option_values: optionValues,
    // isAuthenticated: isAuthenticated,
  };

  try {
    const res = await apiClient.post('/cart-items/', payload);

    return res.data as Cart;

  } catch (err: any) {
    // Error handled silently
    throw err;
  }
}

/** ---- Get Current User Cart ---- **/
export async function getUserCart(): Promise<Cart> {
  const res = await apiClient.get('/cart/my');
  return res.data;
}

/** ---- Get Guest Cart (optional helper) ---- **/
export async function getGuestCart(cartId: number): Promise<Cart> {
  const res = await apiClient.get(`/guest-cart/?cart_id=${cartId}`, {
    withCredentials: false,
  });
  return res.data;
}
