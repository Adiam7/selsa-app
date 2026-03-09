// hooks/useFavourites.ts
import { useEffect, useState } from 'react';
import {
  getLocalFavourites,
  setLocalFavourites,
  addLocalFavourite,
  removeLocalFavourite,
} from '@/utils/localStorageFavourites';
import {
  addServerFavourite,
  removeServerFavourite,
  fetchServerFavourites,
  bulkAddFavourites,
} from '@/services/favouritesService';

export function useFavourites(userId?: string) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const isAuthenticated = Boolean(userId);

  useEffect(() => {
    const loadFavourites = async () => {
      const local = getLocalFavourites();

      if (!isAuthenticated) {
        setFavourites(local);
        return;
      }

      if (local.length > 0) {
        await bulkAddFavourites(local);
        setLocalFavourites([]);
      }

      const serverFavs = await fetchServerFavourites();
      setFavourites(serverFavs);
      setLocalFavourites(serverFavs);
    };

    loadFavourites();
  }, [isAuthenticated]);

  const toggleFavourite = async (productId: string) => {
    const exists = favourites.includes(productId);
    const updated = exists
      ? favourites.filter((id) => id !== productId)
      : [...favourites, productId];

    setFavourites(updated);

    if (isAuthenticated) {
      exists
        ? await removeServerFavourite(productId)
        : await addServerFavourite(productId);
    } else {
      exists
        ? removeLocalFavourite(productId)
        : addLocalFavourite(productId);
    }
  };

  return {
    favourites,
    toggleFavourite,
    isFavourite: (id: string) => favourites.includes(id),
    count: favourites.length,
  };
}
