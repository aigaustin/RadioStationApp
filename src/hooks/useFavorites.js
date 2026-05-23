import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const f = await storage.getFavorites();
    setFavorites(f);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (item) => {
    const next = await storage.toggleFavorite(item);
    setFavorites(next);
    return next;
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.some(f => f.id === id),
    [favorites]
  );

  return { favorites, isFavorite, toggle, loading, reload: load };
}
