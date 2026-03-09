import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getFavorites, Favorite } from '@/lib/api/favorites';

// Use the same query key as useFavorite hook to ensure cache alignment
const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
};

export function useFavorites() {
  const { data: session } = useSession();
  
  return useQuery<Favorite[], Error>({
    queryKey: favoriteKeys.lists(),
    queryFn: () => getFavorites(),
    staleTime: 0, // Always consider data stale, refetch on mount/focus
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch if data is stale on mount
    enabled: !!session?.user, // Only fetch if user is authenticated
  });
}

export function useFavoritesCount() {
  const { data: favorites } = useFavorites();
  return favorites?.length || 0;
}

export function useInvalidateFavorites() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
}
