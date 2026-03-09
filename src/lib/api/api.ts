// selsa-frontend/src/lib/api/api.ts

const API_BASE = process.env.BACKEND_URL;

export async function getProduct(productId: string, revalidate = 300) {
  const res = await fetch(`${API_BASE}/api/printful/products/${productId}/`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to load product ${productId}: ${res.status} ${err}`);
  }

  return res.json();
}
