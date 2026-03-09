// lib/api/cart/createGuestCart.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api');

export async function createGuestCart(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/guest-cart-create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies to maintain Django session
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.cart_id || data.id; // Try both field names
  } catch (err) {
    console.error("Error creating guest cart");
    return null;
  }
}
