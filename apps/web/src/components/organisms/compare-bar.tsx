'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, GitCompareArrows, X } from 'lucide-react';
import { ROUTES, SERVICES, toPersianDigits } from '@technokhan/shared';
import type { Service } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { COMPARE_LIMIT, useCompare, useCompareStore } from '@/lib/store/compare-store';
import { useHydrated } from '@/lib/store/hydration';
import { useCart } from '@/lib/store/cart-store';
import { isCartPillRoute, isTabBarHidden } from '@/lib/routes';
import { springSheet } from '@/lib/animation-variants';

/** Where a half-built comparison is worth reminding people about. */
function isCompareBarRoute(pathname: string): boolean {
  if (pathname === ROUTES.COMPARE) return false;
  if (pathname.startsWith(ROUTES.ADMIN)) return false;
  return pathname === ROUTES.SERVICES || pathname.startsWith(`${ROUTES.SERVICES}/`);
}

/**
 * Floating bar listing the services queued for comparison, with a link to the
 * table. Sits above the mobile tab bar when that is on screen.
 */
export function CompareBar() {
  const pathname = usePathname() ?? '/';
  const hydrated = useHydrated(useCompareStore);
  const { ids, count, remove, clear } = useCompare();
  const { totalItems, isOpen } = useCart();

  const picked = React.useMemo(
    () => ids.map((id) => SERVICES.find((s) => s.id === id)).filter((s): s is Service => Boolean(s)),
    [ids]
  );

  const visible = hydrated && count > 0 && isCompareBarRoute(pathname);

  // Mobile has up to two things already parked at the bottom edge: the tab bar
  // and the cart pill. Stack above whichever is on screen; the desktop layout
  // has neither.
  const pillVisible = totalItems > 0 && !isOpen && isCartPillRoute(pathname) && !isTabBarHidden(pathname);
  const stack = (isTabBarHidden(pathname) ? 0 : 4) + (pillVisible ? 3.75 : 0);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="compare-bar"
          className="pointer-events-none fixed inset-x-3 bottom-[var(--compare-bottom)] z-40 flex justify-center sm:inset-x-6 lg:bottom-6"
          style={
            { '--compare-bottom': `calc(${stack}rem + env(safe-area-inset-bottom) + 0.75rem)` } as React.CSSProperties
          }
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={springSheet}
        >
          <div
            role="region"
            aria-label="فهرست مقایسه"
            className={cn(
              'pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl p-2 ps-3',
              'border border-border/60 bg-card/95 shadow-luxury backdrop-blur-xl'
            )}
          >
            <span className="hidden shrink-0 items-center gap-1.5 text-xs font-bold text-muted-foreground sm:flex">
              <GitCompareArrows className="h-4 w-4 text-secondary" aria-hidden="true" />
              مقایسه
              <span className="tabular-nums">
                ({toPersianDigits(count)}/{toPersianDigits(COMPARE_LIMIT)})
              </span>
            </span>

            <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              {picked.map((service) => (
                <li key={service.id} className="shrink-0">
                  <span className="relative block h-11 w-11 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                    {service.images[0] && (
                      <Image src={service.images[0]} alt={service.name} fill sizes="44px" className="object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => remove(service.id)}
                      aria-label={`حذف ${service.name} از مقایسه`}
                      className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={clear}
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              پاک کردن
            </button>

            <Link
              href={`${ROUTES.COMPARE}?ids=${ids.join(',')}`}
              className={cn(
                'flex h-11 shrink-0 items-center gap-1 rounded-xl bg-secondary px-3 text-sm font-bold text-secondary-foreground',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              مقایسه کن
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
