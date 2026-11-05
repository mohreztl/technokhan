'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEMO_OTP_CODE, toPersianDigits } from '@technokhan/shared';
import { isDemoMode } from '@/lib/api/client';
import { demoSessionFlag, retryLiveApi } from '@/lib/api/endpoints';
import { isTabBarHidden } from '@/lib/routes';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils';

/**
 * Floating "حالت نمایشی" pill shown whenever the demo transport is active
 * (forced via NEXT_PUBLIC_DEMO_MODE or because the API was unreachable).
 * Sits above the mobile tab bar; bottom-start corner on desktop.
 */
export function DemoBanner({ className }: { className?: string }) {
  const demoActive = useUIStore((s) => s.demoActive);
  const dismissed = useUIStore((s) => s.demoDismissed);
  const dismiss = useUIStore((s) => s.dismissDemoBanner);
  const pathname = usePathname() ?? '/';
  const aboveTabBar = !isTabBarHidden(pathname);
  const setDemoActive = useUIStore((s) => s.setDemoActive);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // demo mode was activated earlier in this tab (full reload) → keep the banner without re-probing
    if (demoSessionFlag()) setDemoActive(true);
  }, [setDemoActive]);

  const forced = isDemoMode();
  const visible = mounted && demoActive && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="demo-banner"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className={cn(
            'fixed z-45 inset-s-3 inset-e-3 lg:inset-s-4 lg:inset-e-auto lg:max-w-md',
            aboveTabBar
              ? 'bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] lg:bottom-4'
              : 'bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:bottom-4',
            'rounded-2xl border border-secondary/40 bg-background/85 shadow-luxury backdrop-blur-xl',
            'px-3.5 py-2.5 text-foreground',
            className
          )}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-sm font-bold">حالت نمایشی</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {forced
                  ? `داده‌ها فقط در این مرورگر ذخیره می‌شوند · کد ورود ${toPersianDigits(DEMO_OTP_CODE)}`
                  : `سرور در دسترس نیست؛ داده‌ها موقتاً در مرورگر ذخیره می‌شوند · کد ورود ${toPersianDigits(DEMO_OTP_CODE)}`}
              </p>
            </div>
            {!forced && (
              <button
                type="button"
                onClick={() => {
                  retryLiveApi();
                  dismiss();
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary/15 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
                aria-label="تلاش مجدد برای اتصال به سرور"
                title="تلاش مجدد"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label="بستن اعلان حالت نمایشی"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
