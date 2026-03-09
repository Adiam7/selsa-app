const LOCAL_KEY = 'favourites';

export function getLocalFavourites(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setLocalFavourites(favs: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...new Set(favs)]));
}

export function addLocalFavourite(productId: string) {
  const favs = getLocalFavourites();
  if (!favs.includes(productId)) {
    setLocalFavourites([...favs, productId]);
  }
}

export function removeLocalFavourite(productId: string) {
  const favs = getLocalFavourites();
  setLocalFavourites(favs.filter((id) => id !== productId));
}

export function clearLocalFavourites() {
  localStorage.removeItem(LOCAL_KEY);
}
