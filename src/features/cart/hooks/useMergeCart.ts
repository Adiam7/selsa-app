// src/features/cart/hooks/useMergeCart.ts
'use client'
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export const useMergeCart = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const mergeCart = async () => {
      if (status !== "authenticated") return;

      const guestCartId = localStorage.getItem("guest_cart_id");
      if (!guestCartId) return;

      try {
        const accessToken = (session?.user as any)?.accessToken;
        if (!accessToken) {
          return;
        }

        // Merge guest cart via Next.js proxy → backend /api/cart/merge-cart/
        await axios.post("/api/cart/merge", {
          guest_cart_id: guestCartId,
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Clear guest_cart_id from localStorage after successful merge
        localStorage.removeItem("guest_cart_id");
      } catch (err) {
        // Cart merge is best-effort — don't block the user on failure
      }
    };

    mergeCart();
  }, [session, status]);
};
