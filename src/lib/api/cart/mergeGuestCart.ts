// lib/api/cart/mergeGuestCart.ts

export async function mergeGuestCart(guestCartId: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/merge-cart/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ guest_cart_id: guestCartId }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }

    return { success: false, message: data.message };
  } catch (err) {
    console.error("Error merging guest cart");
    return { success: false };
  }
}