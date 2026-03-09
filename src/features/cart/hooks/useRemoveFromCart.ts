// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { removeCartItem } from '@/features/cart/services/cartService';
// import { toast } from 'sonner';
// import { useCartContext } from '../../../context/CartContext';

// export function useRemoveFromCart() {
//   const queryClient = useQueryClient();
//   const { updateCartFromAPI } = useCartContext();

//   const mutation = useMutation({
//     mutationFn: removeCartItem,
//     onSuccess: async () => {
//       await queryClient.invalidateQueries(['cart']);
//       updateCartFromAPI();
//       toast.success('Item removed from cart');
//     },
//     onError: (error: any) => {
//       toast.error(error?.message || 'Failed to remove item');
//     },
//   });

//   const removeItem = (cartItemId: number) => {
//     mutation.mutate(cartItemId);
//   };

//   return {
//     removeFromCart: removeItem,
//     isLoading: mutation.isLoading,
//   };
// }

'use client';
import { useCartContext } from '@/context/cart/CartContext';
import { removeCartItem as removeCartItemAPI } from '@/lib/api/cart/removeCartItem';
import { toast } from 'sonner';

export function removeFromCart() {
  const { cart, mutateCart } = useCartContext();

  const removeItem = async (itemId: number) => {
    if (!cart) return;

    const optimistic = {
      ...cart,
      items: cart.items.filter(i => i.id !== itemId),
    };

    await mutateCart(
      async () => {
        const updated = await removeCartItemAPI({ cartId: cart.id, itemId });
        return updated;
      },
      { optimisticData: optimistic, rollbackOnError: true }
    );

    toast.success('Item removed');
  };

  return { removeItem };
}
