import { create } from 'zustand';

export interface FlyItem {
  id: string;
  src: string;
  from: { x: number; y: number; width: number; height: number };
}

export interface UIState {
  searchOpen: boolean;
  moreOpen: boolean;
  loginSheetOpen: boolean;
  loginRedirect: string | null;
  /** true once a live API call failed and the demo transport took over */
  demoActive: boolean;
  demoDismissed: boolean;
  flyItems: FlyItem[];
  setSearchOpen: (open: boolean) => void;
  setMoreOpen: (open: boolean) => void;
  openLoginSheet: (redirect?: string) => void;
  closeLoginSheet: () => void;
  setDemoActive: (active: boolean) => void;
  dismissDemoBanner: () => void;
  fly: (item: Omit<FlyItem, 'id'>) => void;
  flyDone: (id: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  searchOpen: false,
  moreOpen: false,
  loginSheetOpen: false,
  loginRedirect: null,
  demoActive: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  demoDismissed: false,
  flyItems: [],
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMoreOpen: (moreOpen) => set({ moreOpen }),
  openLoginSheet: (redirect) => set({ loginSheetOpen: true, loginRedirect: redirect ?? null }),
  closeLoginSheet: () => set({ loginSheetOpen: false, loginRedirect: null }),
  setDemoActive: (demoActive) => set({ demoActive }),
  dismissDemoBanner: () => set({ demoDismissed: true }),
  fly: (item) =>
    set((s) => ({
      flyItems: [...s.flyItems.slice(-2), { ...item, id: `${Date.now()}-${Math.random()}` }],
    })),
  flyDone: (id) => set((s) => ({ flyItems: s.flyItems.filter((f) => f.id !== id) })),
}));
