/**
 * Professional-grade Favorites Service
 * Type-safe API interactions with proper error handling
 * 
 * This service calls Next.js API routes (not the backend directly)
 * The API routes handle authentication and forward to Django backend
 */

import type { Product } from '@/types/product';

/**
 * API response types
 */
export interface FavoriteResponse {
  id: string;
  user: string;
  content_type: string;
  content_type_name: string;
  object_id: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  message?: string;
  detail?: string;
}

/**
 * Type guard for API errors
 */
function isApiError(data: any): data is ApiError {
  return data && typeof data === 'object' && 'error' in data;
}

/**
 * Handle API response and throw meaningful errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorData: any = {};
    
    if (isJson) {
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Failed to parse error response' };
      }
    }

    const errorMessage = errorData?.message || errorData?.detail || errorData?.error || response.statusText;
    const error = new Error(errorMessage || `HTTP ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    
    throw error;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  if (!isJson) {
    throw new Error('Expected JSON response');
  }

  return response.json();
}

/**
 * Fetch all favorites for current user
 */
export async function fetchServerFavourites(): Promise<string[]> {
  try {
    const response = await fetch('/api/favorites/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleResponse<any>(response);
    const favorites = data?.results || data || [];
    
    return Array.isArray(favorites)
      ? favorites.map((fav: any) => fav.object_id)
      : [];
  } catch (err) {
    console.error('[fetchServerFavourites] Error:', err);
    throw err;
  }
}

/**
 * Toggle favorite status for a product
 */
export async function addServerFavourite(productId: string): Promise<FavoriteResponse> {
  try {
    const response = await fetch('/api/favorites/toggle/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: 'products.product',
        object_id: productId,
      }),
    });

    const data = await handleResponse<FavoriteResponse>(response);
    
    return data;
  } catch (err) {
    console.error('[addServerFavourite] Error:', err);
    throw err;
  }
}

/**
 * Remove a favorite
 */
export async function removeServerFavourite(productId: string): Promise<void> {
  try {
    const response = await fetch('/api/favorites/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: 'products.product',
        object_id: productId,
      }),
    });

    await handleResponse<void>(response);
  } catch (err) {
    console.error('[removeServerFavourite] Error:', err);
    throw err;
  }
}

/**
 * Add multiple favorites in parallel
 * Uses Promise.allSettled to handle partial failures gracefully
 */
export async function bulkAddFavourites(productIds: string[]): Promise<PromiseSettledResult<FavoriteResponse>[]> {
  try {
    const results = await Promise.allSettled(
      productIds.map(id => addServerFavourite(id))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return results;
  } catch (err) {
    console.error('[bulkAddFavourites] Error:', err);
    throw err;
  }
}

/**
 * Get all favorites as Product objects
 * Note: This returns metadata, not full product objects
 */
export async function getFavourites(): Promise<FavoriteResponse[]> {
  try {
    const response = await fetch('/api/favorites/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleResponse<any>(response);
    const favorites = data?.results || data || [];
    
    return Array.isArray(favorites) ? favorites : [];
  } catch (err) {
    console.error('[getFavourites] Error:', err);
    throw err;
  }
}