'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CalendarCheck, Car, Gauge, Heart, MapPin, Package, Settings } from 'lucide-react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export type ProfileTab = 'overview' | 'orders' | 'bookings' | 'addresses' | 'garage' | 'wishlist' | 'settings';

export const PROFILE_TABS: { key: ProfileTab; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'نمای کلی', icon: Gauge },
  { key: 'orders', label: 'سفارش‌ها', icon: Package },
  { key: 'bookings', label: 'رزروها', icon: CalendarCheck },
  { key: 'addresses', label: 'آدرس‌ها', icon: MapPin },
  { key: 'garage', label: 'گاراژ', icon: Car },
  { key: 'wishlist', label: 'علاقه‌مندی‌ها', icon: Heart },
  { key: 'settings', label: 'تنظیمات', icon: Settings },
];

export const isProfileTab = (v: string | null | undefined): v is ProfileTab =>
  !!v && PROFILE_TABS.some((t) => t.key === v);

export interface ProfileTabsProps {
  tab: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}

/** Horizontal snap chips below `lg`, vertical sidebar navigation above. */
export function ProfileTabs({ tab, onSelect }: ProfileTabsProps) {
  const reduced = useReducedMotion();
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 32 };

  return (
    <>
      {/* mobile chips */}
      <div
        role="tablist"
        aria-label="بخش‌های پروفایل"
        className="hide-scrollbar -mx-4 mb-6 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
      >
        {PROFILE_TABS.map(({ key, label, icon: Icon }) => {
          const active = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              id={`profile-tab-${key}`}
              aria-controls={`profile-panel-${key}`}
              onClick={() => onSelect(key)}
              className={cn(
                'relative flex min-h-[44px] shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors',
                active ? 'text-secondary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <motion.span
                  layoutId="profile-tab-pill"
                  className="absolute inset-0 rounded-full bg-secondary shadow-glow-secondary"
                  transition={spring}
                />
              )}
              <Icon className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      {/* desktop sidebar */}
      <nav aria-label="بخش‌های پروفایل" className="hidden lg:sticky lg:top-24 lg:block">
        <ul role="tablist" className="glass-effect space-y-1 rounded-2xl p-2">
          {PROFILE_TABS.map(({ key, label, icon: Icon }) => {
            const active = key === tab;
            return (
              <li key={key}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelect(key)}
                  className={cn(
                    'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="profile-tab-side"
                      className="absolute inset-0 rounded-xl bg-secondary/15 ring-1 ring-secondary/40"
                      transition={spring}
                    />
                  )}
                  <Icon className={cn('relative h-4 w-4', active && 'text-secondary')} aria-hidden="true" />
                  <span className="relative">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
