// context/FavouritesContext.tsx
'use client';

import React, { createContext, useContext } from 'react';

interface FavouritesContextType {
  // Placeholder - favorites are now managed by React Query hooks
  // This context is kept for backward compatibility
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

/**
 * FavouritesProvider
 * 
 * Note: Favorites are now managed entirely by React Query hooks in useFavorite
 * This provider is kept for backward compatibility with existing code
 */
export const FavouritesProvider = ({ children }: { children: React.ReactNode }) => {
  // Favorites management is now handled by:
  // - useFavorite() hook for individual items
  // - useFavorites() hook for the favorites list
  // Both use React Query with optimistic updates

  return (
    <FavouritesContext.Provider value={{}}>
      {children}
    </FavouritesContext.Provider>
  );
};

// Hook to use the context (kept for backward compatibility)
export const useFavouritesContext = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavouritesContext must be used within FavouritesProvider');
  }
  return context;
};
