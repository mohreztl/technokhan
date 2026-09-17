'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useAuthStore } from './auth-store';
import { useCartStore } from './cart-store';
import { useWishlistStore } from './wishlist-store';
import { useGarageStore } from './garage-store';

const persistedStores = [useAuthStore, useCartStore, useWishlistStore, useGarageStore] as const;

/**
 * Rehydrates every persisted store after mount. Stores are created with
 * `skipHydration: true`, so the server and the first client render agree
 * (empty cart, anonymous user) and the real values arrive without a
 * hydration mismatch. Mount once, inside Providers.
 */
export function StoreHydrator() {
  useEffect(() => {
    persistedStores.forEach((store) => {
      void store.persist.rehydrate();
    });
  }, []);
  return null;
}

type PersistedStore = (typeof persistedStores)[number];

function subscribe(store: PersistedStore, cb: () => void) {
  return store.persist.onFinishHydration(cb);
}

/** true once the given store has read localStorage (false during SSR and the first paint) */
export function useHydrated(store: PersistedStore = useAuthStore): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(store, cb),
    () => store.persist.hasHydrated(),
    () => false
  );
}
