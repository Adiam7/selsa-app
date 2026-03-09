/**
 * useFavorite Hook - React Query based
 * Handles favorite operations with optimistic updates, caching, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  checkIsFavorited,
  toggleFavorite,
  getFavorites,
  Favorite,
} from '@/lib/api/favorites';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Query keys for React Query
const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (contentType?: string) =>
    [...favoriteKeys.lists(), { contentType }] as const,
  checks: () => [...favoriteKeys.all, 'check'] as const,
  check: (contentType: string, objectId: string) =>
    [...favoriteKeys.checks(), { contentType, objectId }] as const,
};

interface UseFavoriteOptions {
  contentType: string;
  objectId: string;
  enabled?: boolean;
}

/**
 * Hook to get and manage favorite status for a specific item
 * Derives status from the favorites list for accurate syncing
 */
export function useFavorite({ contentType, objectId, enabled = true }: UseFavoriteOptions) {
  const queryClient = useQueryClient();

  // Query: Get all favorites and derive this item's status
  const { data, isLoading } = useQuery<Favorite[], Error>({
    queryKey: favoriteKeys.lists(),
    queryFn: getFavorites,
    staleTime: 0, // Always consider data stale, refetch on mount/focus
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch if data is stale on mount
    enabled, // Only fetch if enabled (i.e., user is authenticated)
  });

  const favorites: Favorite[] = data ?? [];

  // Derive if this specific item is favorited
  // Handle both numeric content_type (from Django) and string format
  const isFavorited = favorites.some((fav) => {
    const contentTypeMatches = 
      fav.content_type === contentType || // Direct match (string)
      (contentType === 'products.product' && fav.content_type_name === 'product') || // Named match
      (contentType.includes('product') && fav.content_type_name === 'product'); // Flexible match
    
    const objectIdMatches = String(fav.object_id) === String(objectId); // Compare as strings
    
    return contentTypeMatches && objectIdMatches;
  });



  // Mutation: Toggle favorite
  const toggleMutation = useMutation({
    mutationFn: () => toggleFavorite(contentType, objectId),
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: favoriteKeys.lists(),
      });

      // Save previous state
      const previousData = queryClient.getQueryData<Favorite[]>(
        favoriteKeys.lists()
      );

      // Optimistic update: add or remove from favorites list
      if (isFavorited && previousData) {
        queryClient.setQueryData(
          favoriteKeys.lists(),
          previousData.filter((fav) => {
            const contentTypeMatches = 
              fav.content_type === contentType || 
              (contentType === 'products.product' && fav.content_type_name === 'product') ||
              (contentType.includes('product') && fav.content_type_name === 'product');
            return !(contentTypeMatches && String(fav.object_id) === String(objectId));
          })
        );
      } else if (!isFavorited && previousData) {
        queryClient.setQueryData(
          favoriteKeys.lists(),
          [...previousData, {
            id: `temp_${objectId}`,
            user: '',
            content_type: contentType,
            content_type_name: contentType.split('.')[1] || 'product',
            object_id: objectId,
            created_at: new Date().toISOString(),
          }]
        );
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          favoriteKeys.lists(),
          context.previousData
        );
      }
    },
    onSuccess: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.lists(),
      });
    },
  });

  return {
    isFavorited,
    isLoading,
    isToggling: toggleMutation.isPending,
    error: toggleMutation.error,
    toggle: toggleMutation.mutate,
    toggleAsync: toggleMutation.mutateAsync,
  };
}

/**
 * Hook to get all favorites for the current user
 */
export function useFavorites(options?: { enabled: boolean }) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const { data, isLoading, error } = useQuery<Favorite[], Error>({
    queryKey: favoriteKeys.lists(),
    queryFn: getFavorites,
    staleTime: 0, // Always consider data stale, refetch on mount/focus
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && options?.enabled !== false,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch if data is stale on mount
  });

  const favorites: Favorite[] = data ?? [];

  return {
    favorites,
    isLoading,
    error,
  };
}

/**
 * Hook to check multiple items at once using the favorites list
 */
export function useFavoritesCheck(items: Array<{ contentType: string; objectId: string }>) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  // Query: Get all favorites
  const { data, isLoading, error } = useQuery<Favorite[], Error>({
    queryKey: favoriteKeys.lists(),
    queryFn: getFavorites,
    staleTime: 0, // Always consider data stale, refetch on mount/focus
    gcTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch if data is stale on mount
  });

  const favorites: Favorite[] = data ?? [];

  const isFavorited = useCallback(
    (contentType: string, objectId: string) => {
      return favorites.some(
        (fav) => fav.content_type === contentType && fav.object_id === objectId
      );
    },
    [favorites]
  );

  return {
    isLoading,
    error,
    isFavorited,
    refetch: () => queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() }),
  };
}

/**
 * Hook to invalidate favorite cache when needed
 */
export function useInvalidateFavorites() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: favoriteKeys.all,
    });
  }, [queryClient]);
}
