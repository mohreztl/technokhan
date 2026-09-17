'use client';

import { useSyncExternalStore } from 'react';

function subscribe(query: string, cb: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

/** SSR-safe media query hook. Returns `fallback` on the server and first paint. */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    () => window.matchMedia(query).matches,
    () => fallback
  );
}

/** Below Tailwind `lg` (1024px): phones and tablets get the mobile app shell */
export const useIsMobile = () => useMediaQuery('(max-width: 1023px)', false);

/** Touch-first devices (no hover) */
export const useIsCoarsePointer = () => useMediaQuery('(hover: none), (pointer: coarse)', false);
