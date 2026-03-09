// features/cart/hooks/useAddToCart.ts

'use client';
import { useCartContext } from '@/context/cart/CartContext';
import { addToCart as addToCartAPI } from '@/lib/api/cart';
import { toast } from 'sonner';

export function addToCart() {
  const { cart, mutateCart } = useCartContext();

  const addItem = async (productVariantId: number, quantity = 1) => {
    if (!cart) return;

    const optimistic = {
      ...cart,
      items: [
        ...cart.items,
        {
          id: Date.now(),
          product_variant: { id: productVariantId } as any,
          quantity,
          product_name: '…',
          product_price: 0,
        },
      ],
    };

    await mutateCart(
      async () => {
        const updated = await addToCartAPI({ cartId: cart.id, variant: { id: productVariantId }, image: "", quantity });
        return updated;
      },
      { optimisticData: optimistic, rollbackOnError: true }
    );
    
    toast.success('Added to cart');
  };

  return { addItem };
}
