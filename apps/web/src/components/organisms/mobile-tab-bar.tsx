'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarPlus, Home, ShoppingBag, Sparkles, User, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/store/auth-store';
import { activeTab, isTabBarHidden, type TabKey } from '@/lib/routes';
import { springSheet, springTab } from '@/lib/animation-variants';

interface Tab {
  key: TabKey;
  label: string;
  href: string;
  icon: LucideIcon;
  raised?: boolean;
}

const TABS: Tab[] = [
  { key: 'home', label: 'خانه', href: ROUTES.HOME, icon: Home },
  { key: 'services', label: 'خدمات', href: ROUTES.SERVICES, icon: Sparkles },
  { key: 'booking', label: 'رزرو', href: ROUTES.BOOKING, icon: CalendarPlus, raised: true },
  { key: 'shop', label: 'فروشگاه', href: ROUTES.PRODUCTS, icon: ShoppingBag },
  { key: 'profile', label: 'پروفایل', href: ROUTES.PROFILE, icon: User },
];

/**
 * Native-style bottom tab bar (below `lg`). Hidden on focused flows
 * (`isTabBarHidden`). The raised gold «رزرو» tab is the primary action.
 */
export function MobileTabBar() {
  const pathname = usePathname() ?? '/';
  const { status } = useAuth();

  if (isTabBarHidden(pathname)) return null;

  const current = activeTab(pathname);

  return (
    <nav
      aria-label="ناوبری اصلی"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 lg:hidden',
        'glass-effect-strong border-t border-border/40 bg-background/85 dark:bg-background/80',
        'pb-safe'
      )}
    >
      <ul className="grid h-16 grid-cols-5 items-end">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = current === tab.key;
          const href =
            tab.key === 'profile' && status === 'anonymous' ? ROUTES.LOGIN : tab.href;

          if (tab.raised) {
            return (
              <li key={tab.key} className="flex h-16 items-end justify-center">
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${tab.label} نوبت`}
                  className="group relative -mt-6 flex flex-col items-center gap-1 pb-1.5 outline-hidden"
                >
                  <motion.span
                    whileTap={{ scale: 0.88 }}
                    transition={springTab}
                    animate={{ y: isActive ? -2 : 0 }}
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full',
                      'bg-linear-to-br from-secondary-400 via-secondary-500 to-secondary-600 text-primary-900',
                      'shadow-[0_8px_24px_hsl(var(--secondary)/0.55)] ring-4 ring-background',
                      'transition-shadow group-focus-visible:ring-ring',
                      isActive && 'shadow-[0_10px_32px_hsl(var(--secondary)/0.8)]'
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
                  </motion.span>
                  <span
                    className={cn(
                      'text-[11px] font-semibold leading-none',
                      isActive ? 'text-secondary' : 'text-foreground-muted'
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.key} className="flex h-16 items-stretch justify-center">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex min-w-[44px] flex-1 flex-col items-center justify-center gap-1 outline-hidden',
                  'text-foreground-muted transition-colors focus-visible:text-foreground',
                  isActive && 'text-primary dark:text-secondary'
                )}
              >
                <span className="relative flex h-8 w-14 items-center justify-center">
                  {isActive && (
                    <motion.span
                      layoutId="tab-indicator"
                      transition={springSheet}
                      className="absolute inset-0 rounded-full bg-primary/10 dark:bg-secondary/15"
                      aria-hidden="true"
                    />
                  )}
                  <motion.span
                    className="relative"
                    whileTap={{ scale: 0.8, y: 2 }}
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={springTab}
                  >
                    <Icon
                      className="h-[22px] w-[22px]"
                      strokeWidth={isActive ? 2.4 : 1.9}
                      aria-hidden="true"
                    />
                  </motion.span>
                </span>
                <span className="text-[11px] font-medium leading-none">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
