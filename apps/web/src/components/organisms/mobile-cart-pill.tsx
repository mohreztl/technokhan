'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { formatToman, toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-store';
import { isCartPillRoute, isTabBarHidden } from '@/lib/routes';
import { springSheet } from '@/lib/animation-variants';

/**
 * Floating cart summary that slides up above the tab bar on browse routes
 * whenever the cart has items. Tapping opens the cart sheet.
 */
export function MobileCartPill() {
  const pathname = usePathname() ?? '/';
  const { totalItems, totals, isOpen, openCart } = useCart();

  const visible =
    totalItems > 0 && !isOpen && isCartPillRoute(pathname) && !isTabBarHidden(pathname);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cart-pill"
          className="pointer-events-none fixed inset-x-4 z-40 flex justify-center lg:hidden"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 0.75rem)' }}
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={springSheet}
        >
          <motion.button
            type="button"
            onClick={openCart}
            data-cart-target="mobile"
            aria-label={`مشاهده سبد خرید، ${toPersianDigits(totalItems)} محصول`}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'pointer-events-auto flex h-14 w-full max-w-md items-center gap-3 rounded-2xl px-3 pe-4 text-start',
              'bg-primary text-primary-foreground shadow-luxury ring-1 ring-white/10',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary'
            )}
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              <span
                className="absolute -inset-e-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold text-secondary-foreground tabular-nums"
                aria-hidden="true"
              >
                {toPersianDigits(totalItems > 99 ? '99+' : totalItems)}
              </span>
            </span>

            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-bold">
                {toPersianDigits(totalItems)} محصول · {formatToman(totals.subtotal)}
              </span>
              <span className="text-[11px] text-primary-foreground/70">
                {totals.shipping === 0 ? 'ارسال رایگان' : 'برای ارسال رایگان خرید کنید'}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground">
              مشاهده سبد
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
