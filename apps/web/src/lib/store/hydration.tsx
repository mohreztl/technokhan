'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useAuthStore } from './auth-store';
import { useCartStore } from './cart-store';
import { useWishlistStore } from './wishlist-store';
import { useGarageStore } from './garage-store';
import { useCompareStore } from './compare-store';
import { useNotificationStore } from './notification-store';
import { useRecentlyViewedStore } from './recently-viewed-store';

const persistedStores = [useAuthStore, useCartStore, useWishlistStore, useGarageStore, useCompareStore, useNotificationStore, useRecentlyViewedStore] as const;

/** Rehydrates local stores after the server-compatible first paint. */
export function StoreHydrator() {
  useEffect(() => {
    persistedStores.forEach((store) => { void store.persist.rehydrate(); });
  }, []);
  return null;
}

type PersistedStore = (typeof persistedStores)[number];

function subscribe(store: PersistedStore, callback: () => void) {
  return store.persist.onFinishHydration(callback);
}

/** Returns true after the selected persisted store has read localStorage. */
export function useHydrated(store: PersistedStore = useAuthStore): boolean {
  return useSyncExternalStore((callback) => subscribe(store, callback), () => store.persist.hasHydrated(), () => false);
}
