/**
 * Search Context & Provider
 * Manages search state, history, and suggestions with API integration
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cacheService } from '@/app/category/lib/cacheService';
import { searchItems } from '@/lib/api/advanced';

export interface SearchResult {
  id: string;
  type: 'product' | 'category';
  name: string;
  name_display?: string;
  image?: string;
  price?: number;
  category?: string;
  rating?: number;
  relevance: number; // 0-100 relevance score
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'trending';
  count?: number; // Search count for popular searches
}

export interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  search: (query: string) => Promise<void>;
  getSuggestions: (partial: string) => Promise<void>;
  clearSearch: () => void;
  addToHistory: (query: string) => void;
  getHistory: () => string[];
  clearHistory: () => void;
  getPopularSearches: () => SearchSuggestion[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const SEARCH_HISTORY_KEY = 'search_history';
const SEARCH_HISTORY_LIMIT = 10;
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Popular searches from user behavior
const POPULAR_SEARCHES: SearchSuggestion[] = [
  { id: 's1', text: 'Trending', type: 'popular', count: 1250 },
  { id: 's2', text: 'New Arrivals', type: 'popular', count: 980 },
  { id: 's3', text: 'Best Sellers', type: 'popular', count: 875 },
  { id: 's4', text: 'Sale Items', type: 'popular', count: 720 },
  { id: 's5', text: 'Top Rated', type: 'popular', count: 650 },
];

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load search history on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    loadHistory();
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Check cache first
    const cacheKey = `search_${searchQuery}`;
    const cached = cacheService.get<SearchResult[]>(cacheKey);
    if (cached) {
      setResults(cached);
      return;
    }

    setIsLoading(true);
    try {
      // Use real API for search
      const apiResults = await searchItems(searchQuery);
      
      setResults(apiResults);
      cacheService.set(cacheKey, apiResults, {
        strategy: 'memory',
        ttl: SEARCH_CACHE_TTL,
      });

      // Add to history
      addToHistory(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (partial: string) => {
    if (!partial.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const lowerPartial = partial.toLowerCase();

      // Get recent searches
      const recentSuggestions = history
        .filter((h) => h.toLowerCase().includes(lowerPartial))
        .slice(0, 3)
        .map((h) => ({
          id: `recent_${h}`,
          text: h,
          type: 'recent' as const,
        }));

      // Get popular searches
      const popularSuggestions = POPULAR_SEARCHES.filter((p) =>
        p.text.toLowerCase().includes(lowerPartial)
      )
        .slice(0, 3)
        .map((p) => ({
          id: p.id,
          text: p.text,
          type: 'popular' as const,
          count: p.count,
        }));

      // Combine
      const combined = [
        ...recentSuggestions,
        ...popularSuggestions.filter(
          (ps) => !recentSuggestions.some((rs) => rs.text === ps.text)
        ),
      ];

      setSuggestions(combined);
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
    }
  }, [history]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
  }, []);

  const addToHistory = useCallback((searchQuery: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== searchQuery);
      const updated = [searchQuery, ...filtered].slice(0, SEARCH_HISTORY_LIMIT);

      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      return updated;
    });
  }, []);

  const getHistory = useCallback(() => {
    return history;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  const getPopularSearches = useCallback(() => {
    return POPULAR_SEARCHES;
  }, []);

  const value: SearchContextType = {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    search,
    getSuggestions,
    clearSearch,
    addToHistory,
    getHistory,
    clearHistory,
    getPopularSearches,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

/**
 * Hook to use search context
 */
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export default SearchContext;
