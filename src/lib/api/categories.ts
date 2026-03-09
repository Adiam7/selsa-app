// src/lib/api/categories.ts

import { Category } from "@/types/category";
import { API_BASE_URL } from './client';

const API_BASE = API_BASE_URL;

function withTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

/**
 * ✅ Get all categories (top-level by default)
 */

// export async function getCategories(): Promise<Category[]> {

//   const endpoint = `${withTrailingSlash(API_BASE)}categories/`;

//   try {
//     const response = await fetch(endpoint, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       next: { revalidate: 60 },
//     });

//     if (!response.ok) {
//       console.error(`[getCategories] Failed with status: ${response.status}`);
//       return [];
//     }

//     const data = await response.json();
    

//     if (!Array.isArray(data)) {
//       console.warn("[getCategories] Unexpected response format:", data);
//       return [];
//     }

//     // ✅ Include all top-level categories safely
//     // return data.filter((c: Category) => c.parent == null);
//     console.log(data)
//     return data;

//   } catch (error) {
//     console.error("[getCategories] Error fetching categories:", error);
//     return [];
//   }
// }
export async function getCategories(): Promise<Category[]> {
  const endpoint = `${withTrailingSlash(API_BASE)}categories/top-level/`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("[getCategories] Error fetching categories");
    return [];
  }
}


/**
 * ✅ Get a single category (including children)
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const endpoint = `${withTrailingSlash(API_BASE)}categories/${slug}/`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Category;
  } catch (error) {
    console.error("[getCategoryBySlug] Error fetching category");
    return null;
  }
}

/**
 * ✅ Get products for a given category slug (with pagination)
 */
export async function getProductsByCategorySlug(
  slug: string,
  page = 1,
  limit = 60
) {
  const offset = (page - 1) * limit;
  const endpoint = `${withTrailingSlash(API_BASE)}products/?category_slug=${slug}&limit=${limit}&offset=${offset}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      return { results: [], count: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error("[getProductsByCategorySlug] Error fetching products");
    return { results: [], count: 0 };
  }
}
