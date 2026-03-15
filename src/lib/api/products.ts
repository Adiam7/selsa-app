// src/lib/api/products.ts
import { Product } from '@/types/product';
import { API_BASE_URL } from './client';

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/products/`, {
      next: { revalidate: 60 }, // ISR support
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/by-id/${id}/`);
    if (!res.ok) return null;

    const product: Product = await res.json();

    // Normalize variants additional_price to number (if exists)
    if (product.variants) {
      product.variants = product.variants.map((variant: any) => ({
        ...variant,
        additional_price: Number((variant as any).additional_price),
      }));
    }

    return product;
  } catch (err) {
    return null;
  }
}


export async function getProductBySlug(slug: string): Promise<Product | null> {
  
  if (!API_BASE_URL) {
    console.error('NEXT_PUBLIC_API_BASE_URL is not defined — product page will fail');
    return null;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${slug}/`, {
      next: { revalidate: 60 }, // optional ISR caching in Next.js 13+
    });

    if (!res.ok) {
      return null;
    }

    const product: Product = await res.json();
    return product;
  } catch (error) {
    return null;
  }
}


/**
 * Fetch all product slugs (for static generation).
 */
export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const products = await res.json();
    return products.map((p: { slug: string }) => ({ slug: p.slug }));
  } catch (error) {
    return [];
  }
}




// src/lib/api.ts -->   getRelatedProducts in API
export async function getRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${slug}/related/`);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Fetch all products belonging to a specific category by slug.
 */
export async function getProductsByCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${slug}`, {
      cache: "no-store", // Always get fresh data
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products for category");
    }

    const data = await res.json();

    // Optional sanity check
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}
