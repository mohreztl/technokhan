import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Four columns is where the comparison table stops being readable on a laptop,
 * and the picker says so rather than silently dropping a pick.
 */
export const COMPARE_LIMIT = 4;

export interface CompareState {
  ids: string[];
  /** Returns whether the service ended up selected. */
  toggle: (serviceId: string) => boolean;
  add: (serviceId: string) => boolean;
  remove: (serviceId: string) => void;
  clear: () => void;
}

export const COMPARE_STORAGE_KEY = 'autolounge_compare';

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        if (has) {
          set((s) => ({ ids: s.ids.filter((x) => x !== id) }));
          return false;
        }
        if (get().ids.length >= COMPARE_LIMIT) return false;
        // Appended, not prepended: the comparison keeps the order you picked in.
        set((s) => ({ ids: [...s.ids, id] }));
        return true;
      },
      add: (id) => {
        const { ids } = get();
        if (ids.includes(id)) return true;
        if (ids.length >= COMPARE_LIMIT) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: COMPARE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

export function useCompare() {
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const add = useCompareStore((s) => s.add);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  return {
    ids,
    count: ids.length,
    isFull: ids.length >= COMPARE_LIMIT,
    has: (id: string) => ids.includes(id),
    toggle,
    add,
    remove,
    clear,
  };
}
