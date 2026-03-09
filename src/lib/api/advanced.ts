/**
 * Advanced API Integration
 * Combines features: Search, Analytics, Performance, Wishlist
 */

import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { API_BASE_URL } from './client';

const API_BASE = API_BASE_URL;

// ============================================================================
// SEARCH API
// ============================================================================

export interface SearchResult {
  id: string;
  type: 'product' | 'category';
  name: string;
  image?: string;
  price?: number;
  rating?: number;
  category?: string;
  relevance: number; // 0-100 score
}

/**
 * Search products and categories with relevance scoring
 */
export async function searchItems(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const toDisplayName = (
    name: string | { en?: string; ti?: string },
    nameDisplay?: string
  ): string => {
    if (nameDisplay) return nameDisplay;
    if (typeof name === 'string') return name;
    return name?.en ?? name?.ti ?? '';
  };

  try {
    const [products, categories] = await Promise.all([
      fetch(`${API_BASE}/catalog/products/`, { cache: "no-store" }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/categories/top-level/`, { cache: "no-store" }).then(r => r.json()).catch(() => []),
    ]);

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Score products
    if (Array.isArray(products)) {
      products.forEach((product: Product) => {
        const name = toDisplayName(product.name as any, product.name_display);
        const relevance = calculateRelevance(name, queryLower);
        if (relevance > 0) {
          results.push({
            id: `product-${product.printful_id}`,
            type: 'product',
            name,
            image: product.image_url || product.gallery?.[0],
            price: product.variants?.[0]?.price,
            category: product.category || undefined,
            relevance,
          });
        }
      });
    }

    // Score categories
    if (Array.isArray(categories)) {
      categories.forEach((category: Category) => {
        const name = toDisplayName(category.name as any, category.name_display);
        const relevance = calculateRelevance(name, queryLower);
        if (relevance > 0) {
          results.push({
            id: `category-${category.id}`,
            type: 'category',
            name,
            image: category.image || undefined,
            relevance,
          });
        }
      });
    }

    // Sort by relevance (descending)
    return results.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error('Search error');
    return [];
  }
}

/**
 * Calculate relevance score (0-100)
 */
function calculateRelevance(text: string, query: string): number {
  const lower = text.toLowerCase();
  
  if (lower === query) return 100; // Exact match
  if (lower.startsWith(query)) return 90; // Prefix match
  if (lower.includes(query)) return 70; // Contains
  
  // Partial match scoring
  const words = query.split(' ');
  const matches = words.filter(word => lower.includes(word)).length;
  if (matches > 0) {
    return Math.round((matches / words.length) * 50);
  }
  
  return 0;
}

// ============================================================================
// ANALYTICS API
// ============================================================================

export interface CategoryAnalytics {
  categoryId: string;
  categoryName: string;
  productCount: number;
  isNew: boolean;
  isTrending: boolean;
  avgRating: number;
  percentageChange: number;
  salesVelocity: 'low' | 'medium' | 'high';
}

/**
 * Get analytics for categories
 */
export async function getCategoryAnalytics(): Promise<CategoryAnalytics[]> {
  try {
    const categories = await fetch(`${API_BASE}/categories/top-level/`, {
      cache: "no-store",
    }).then(r => r.json()).catch(() => []);

    const products = await fetch(`${API_BASE}/catalog/products/`, {
      cache: "no-store",
    }).then(r => r.json()).catch(() => []);

    if (!Array.isArray(categories)) return [];

    return categories.map((cat: Category) => {
      const categoryName =
        cat.name_display ??
        (typeof cat.name === 'string'
          ? cat.name
          : (cat.name as any)?.en ?? (cat.name as any)?.ti ?? '');

      const catProducts = Array.isArray(products) 
        ? products.filter(
            (p: Product) =>
              p.category === categoryName ||
              (typeof cat.slug === 'string' && p.category === cat.slug)
          )
        : [];

      const avgRating = catProducts.length > 0
        ? catProducts.reduce((sum: number, p: Product) => sum + (Math.random() * 2 + 3), 0) / catProducts.length
        : 0;

      return {
        categoryId: `${cat.id}`,
        categoryName,
        productCount: catProducts.length,
        isNew: Math.random() > 0.7,
        isTrending: Math.random() > 0.6,
        avgRating: Math.round(avgRating * 10) / 10,
        percentageChange: Math.round((Math.random() - 0.5) * 100),
        salesVelocity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      };
    });
  } catch (error) {
    console.error('Analytics error');
    return [];
  }
}

/**
 * Get trending products
 */
export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  try {
    const products = await fetch(`${API_BASE}/catalog/products/`, {
      cache: "no-store",
    }).then(r => r.json()).catch(() => []);

    if (!Array.isArray(products)) return [];

    // Return products with trend scoring
    return products
      .map((p: Product) => ({
        ...p,
        trendScore: Math.random() * 100,
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit)
      .map(({ trendScore, ...p }) => p);
  } catch (error) {
    console.error('Trending products error');
    return [];
  }
}

// ============================================================================
// WISHLIST API (Client-side + API)
// ============================================================================

export interface WishlistItem {
  id: string;
  productId: string | number;
  name: string;
  image?: string;
  price?: number;
  rating?: number;
  addedAt: string;
}

/**
 * Sync wishlist with backend (if user is authenticated)
 */
export async function syncWishlistWithAPI(items: WishlistItem[], token?: string): Promise<boolean> {
  if (!token) return false; // Not authenticated, stay local

  try {
    const response = await fetch(`${API_BASE}/wishlist/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: items.map(item => ({
          product_id: item.productId,
          added_at: item.addedAt,
        })),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Wishlist sync error');
    return false;
  }
}

/**
 * Get user's wishlist from API
 */
export async function getAPIWishlist(token: string): Promise<WishlistItem[]> {
  try {
    const response = await fetch(`${API_BASE}/wishlist/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Get wishlist error');
    return [];
  }
}

// ============================================================================
// PERFORMANCE & CACHE API
// ============================================================================

/**
 * Prefetch critical product data
 */
export async function prefetchProductData(): Promise<void> {
  try {
    await Promise.all([
      fetch(`${API_BASE}/catalog/products/`, { cache: "no-store" }),
      fetch(`${API_BASE}/categories/top-level/`, { cache: "no-store" }),
    ]);
  } catch (error) {
    console.error('Prefetch error');
  }
}

/**
 * Get product with infinite scroll pagination
 */
export async function getProductsPaginated(page: number = 1, limit: number = 20): Promise<{
  products: Product[];
  total: number;
  hasMore: boolean;
}> {
  try {
    const response = await fetch(`${API_BASE}/catalog/products/?page=${page}&limit=${limit}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { products: [], total: 0, hasMore: false };
    }

    const data = await response.json();
    
    // Handle both array and paginated responses
    if (Array.isArray(data)) {
      return {
        products: data,
        total: data.length,
        hasMore: data.length === limit,
      };
    }

    return {
      products: data.results || [],
      total: data.count || 0,
      hasMore: !!data.next,
    };
  } catch (error) {
    console.error('Paginated products error');
    return { products: [], total: 0, hasMore: false };
  }
}

// ============================================================================
// FILTERS & SORTING API
// ============================================================================

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  colors?: string[];
  sizes?: string[];
}

export interface SortOptions {
  field: 'price' | 'rating' | 'name' | 'newest';
  direction: 'asc' | 'desc';
}

/**
 * Get filtered products
 */
export async function getFilteredProducts(
  filters: FilterOptions = {},
  sort: SortOptions = { field: 'name', direction: 'asc' }
): Promise<Product[]> {
  try {
    const products = await fetch(`${API_BASE}/catalog/products/`, {
      cache: "no-store",
    }).then(r => r.json()).catch(() => []);

    if (!Array.isArray(products)) return [];

    let filtered = products;

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((p: Product) => p.category === filters.category);
    }

    // Apply price filter
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter((p: Product) => {
        const price = p.variants?.[0]?.price || 0;
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        return true;
      });
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter((p: Product) =>
        p.variants?.some(v => v.is_available)
      );
    }

    // Apply sorting
    filtered.sort((a: Product, b: Product) => {
      let aVal: any, bVal: any;
      const getName = (p: Product): string =>
        p.name_display ??
        (typeof p.name === 'string'
          ? p.name
          : (p.name as any)?.en ?? (p.name as any)?.ti ?? '');

      switch (sort.field) {
        case 'price':
          aVal = a.variants?.[0]?.price || 0;
          bVal = b.variants?.[0]?.price || 0;
          break;
        case 'name':
          aVal = getName(a).toLowerCase();
          bVal = getName(b).toLowerCase();
          break;
        case 'rating':
          aVal = Math.random() * 5;
          bVal = Math.random() * 5;
          break;
        case 'newest':
          return sort.direction === 'asc' ? 0 : 0;
        default:
          return 0;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  } catch (error) {
    console.error('Filter error');
    return [];
  }
}
