// selsa-frontend/src/lib/api/api.ts

import { getCurrentLanguage } from '@/utils/fetchWithLanguage';

const API_BASE = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function getProduct(productId: string, revalidate = 300) {
  const res = await fetch(`${API_BASE}/api/printful/products/${productId}/`, {
    next: { revalidate },
    headers: { Accept: "application/json", 'Accept-Language': getCurrentLanguage() },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to load product ${productId}: ${res.status} ${err}`);
  }

  return res.json();
}
