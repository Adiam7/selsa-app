// // Add to Cart

// import type { Cart } from '@/types/cart';

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// export type AddToCartInput = {
//   cartId: string | number;
//   productVariantId: number;
//   quantity: number;
//   variantColor?: string | null;
//   variantSize?: string | null;
//   isAuthenticated?: boolean;
// };

// export async function addToCart(input: AddToCartInput): Promise<Cart> {
//   const { cartId, productVariantId, quantity, variantColor, variantSize, isAuthenticated = false } = input;
//   const endpoint = isAuthenticated ? `${BASE_URL}/cart/add-item/` : `${BASE_URL}/guest-cart-add-item/`;

//   const body = {
//     cart_id: cartId,
//     product_variant_id: productVariantId,
//     quantity,
//     variant_color: variantColor,
//     variant_size: variantSize,
//   };

//   const res = await fetch(endpoint, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//     credentials: 'include',
//   });

//   if (!res.ok) {
//     const txt = await res.text().catch(() => '');
//     throw new Error(`Add to cart failed: ${res.status} ${txt}`);
//   }

//   const json = (await res.json()) as Cart;
//   return json;
// }
