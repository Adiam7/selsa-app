/**
 * Caching Service for Product Data
 * Handles browser caching, localStorage, and cache invalidation
 */

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  strategy?: 'memory' | 'localStorage' | 'both';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry = JSON.parse(stored);
        if (this.isValid(entry)) {
          return entry.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(
    key: string,
    data: T,
    options?: CacheOptions
  ): void {
    const ttl = options?.ttl || this.defaultTTL;
    const strategy = options?.strategy || 'memory';

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory cache
    if (strategy === 'memory' || strategy === 'both') {
      this.memoryCache.set(key, entry);
    }

    // Store in localStorage
    if (strategy === 'localStorage' || strategy === 'both') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Cache write error:', error);
      }
    }
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear all error:', error);
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < entry.ttl;
  }

  /**
   * Get cache size (memory cache only)
   */
  getSize(): number {
    return this.memoryCache.size;
  }

  /**
   * Get cache info for debugging
   */
  getInfo() {
    return {
      memorySize: this.memoryCache.size,
      localStorageSize: this.getLocalStorageSize(),
    };
  }

  private getLocalStorageSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          size++;
        }
      });
      return size;
    } catch {
      return 0;
    }
  }
}

export const cacheService = new CacheService();

/**
 * API Fetch with caching
 */
export async function fetchWithCache<T>(
  url: string,
  options?: CacheOptions
): Promise<T> {
  const cacheKey = url;

  // Check cache first
  const cached = cacheService.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  // Store in cache
  cacheService.set(data, cacheKey, options);

  return data;
}

/**
 * Prefetch data for better performance
 */
export async function prefetchData(
  urls: string[],
  options?: CacheOptions
): Promise<void> {
  try {
    await Promise.all(
      urls.map((url) => fetchWithCache(url, options).catch(() => null))
    );
  } catch (error) {
    console.warn('Prefetch error:', error);
  }
}

/**
 * Get data with stale-while-revalidate strategy
 * Returns cached data immediately, updates in background
 */
export async function fetchStaleWhileRevalidate<T>(
  url: string,
  options?: CacheOptions
): Promise<{ data: T; isStale: boolean }> {
  const cached = cacheService.get<T>(url);

  // Return cached data immediately
  if (cached) {
    // Update in background
    fetchWithCache<T>(url, options).catch(() => {});
    return { data: cached, isStale: true };
  }

  // No cache, fetch fresh data
  const data = await fetchWithCache<T>(url, options);
  return { data, isStale: false };
}

export default cacheService;
