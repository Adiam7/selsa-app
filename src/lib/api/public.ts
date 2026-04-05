// src/lib/api/public.ts

// export async function fetchProduct(productId: string) {
//   const res = await fetch(`${process.env.BACKEND_URL}/api/products/${productId}/`);
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

const API_BASE = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

function getCurrentLanguage(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'en';
  }
  return 'en';
}

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

// src/lib/api/public.ts
// export async function fetchProduct(productId: string) {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/`, {
//     cache: "force-cache", // optional: server-side caching
//   });

//   if (!res.ok) {
//     const errText = await res.text();
//     throw new Error(`Failed to fetch product ${productId}: ${res.status} ${errText}`);
//   }

//   return res.json();
// }


export async function fetchStore(storeId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/${storeId}/`, {
    headers: { 'Accept-Language': getCurrentLanguage() },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch store ${storeId}: ${res.status} ${errText}`);
  }

  return res.json();
}
