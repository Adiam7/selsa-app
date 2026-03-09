// selsa-frontend/src/features/cart/components/AddToCartButton.tsx
"use client";

import { useCart } from "@/features/cart/hooks/useCart";
import { toast } from "react-hot-toast";
import { useUser } from "@/features/auth/hooks/useUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { addToCart } from "@/lib/api/cart"; // <- you can abstract this
import { useTranslation } from "react-i18next";

interface AddToCartButtonProps {
  variantId: number;
  quantity: number;
  optionValueIds: number[];
}

export default function AddToCartButton({
  variantId,
  quantity,
  optionValueIds,
}: AddToCartButtonProps) {
  const { t } = useTranslation();
  const { cart } = useCart();
  const { isAuthenticated } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/cart";

  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    const openCart = Array.isArray(cart)
      ? cart.find((c) => c.status === "open")
      : cart;

    if (!openCart?.id) {
      toast.error("Cart not found.");
      return;
    }

    try {
      await addToCart({
        cartId: openCart.id,
        variant: { id: variantId },
        image: "",
        quantity,
        optionValues: optionValueIds,
      });

      toast.success("Added to cart!");
      router.push(callbackUrl);
    } catch (error: any) {
      toast.error(
        `Failed: ${error.response?.data?.error || error.message}`
      );
    }
  }, [variantId, quantity, optionValueIds, cart, isAuthenticated, router, callbackUrl]);

  return (
    <button
      onClick={handleAddToCart}
      disabled={!variantId || quantity < 1}
      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
    >{t('Add to Cart')}</button>
  );
}
