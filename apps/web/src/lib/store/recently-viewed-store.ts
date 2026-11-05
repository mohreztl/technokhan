import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@technokhan/shared';

export const RECENTLY_VIEWED_LIMIT = 8;
export const RECENTLY_VIEWED_STORAGE_KEY = 'technokhan_recently_viewed';

/** Returns unique newest-first product ids capped at the storefront history limit. */
export function recentIds(current: string[], id: string): string[] {
  return [id, ...current.filter((item) => item !== id)].slice(0, RECENTLY_VIEWED_LIMIT);
}

/** Resolves persisted ids into display products, preserving history order. */
export function recentProducts(ids: string[], currentProductId: string, source: Product[]): Product[] {
  return ids
    .filter((id) => id !== currentProductId)
    .map((id) => source.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined);
}

export interface RecentlyViewedState {
  ids: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

/** Persistent product-view history with a bounded, deterministic order. */
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) => set((state) => ({ ids: recentIds(state.ids, id) })),
      remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: RECENTLY_VIEWED_STORAGE_KEY, storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);

export function useRecentlyViewed() {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const add = useRecentlyViewedStore((state) => state.add);
  const remove = useRecentlyViewedStore((state) => state.remove);
  const clear = useRecentlyViewedStore((state) => state.clear);
  return { ids, add, remove, clear };
}
