// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { updateCartItem } from '@/features/cart/services/cartService';
// import { toast } from 'sonner';
// import { useCartContext } from '../../../context/CartContextntext';

// export function useUpdateCart() {
//   const queryClient = useQueryClient();
//   const { updateCartFromAPI } = useCartContext();

//   const mutation = useMutation({
//     mutationFn: updateCartItem,
//     onSuccess: async () => {
//       await queryClient.invalidateQueries(['cart']);
//       updateCartFromAPI();
//       toast.success('Cart updated');
//     },
//     onError: (error: any) => {
//       toast.error(error?.message || 'Failed to update cart');
//     },
//   });

//   const updateItem = (cartItemId: number, quantity: number) => {
//     mutation.mutate({ cartItemId, quantity });
//   };

//   return {
//     updateCart: updateItem,
//     isLoading: mutation.isLoading,
//   };
// }


'use client';
import { useCartContext } from '@/context/cart/CartContext';
import { updateCartItem as updateCartItemAPI } from '@/lib/api/cart/updateCartItem';
import { toast } from 'sonner';

export function updateCartItem() {
  const { cart, mutateCart } = useCartContext();

  const updateItemQuantity = async (itemId: number, quantity: number) => {
    if (!cart) return;

    const optimistic = {
      ...cart,
      items: cart.items.map(i => i.id === itemId ? { ...i, quantity } : i),
    };

    await mutateCart(
      async () => {
        const updated = await updateCartItemAPI({ cartId: cart.id, itemId, quantity });
        return updated;
      },
      { optimisticData: optimistic, rollbackOnError: true }
    );

    toast.success('Quantity updated');
  };

  return { updateItemQuantity };
}
