'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Home, Lock, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import { APP_NAME, DEMO_ADMIN_PHONE, DEMO_OTP_CODE, ROUTES, toPersianDigits } from '@technokhan/shared';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useAuth } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useLogout } from '@/lib/hooks/use-me';
import { useAdminDashboard } from '@/lib/hooks/use-admin';
import { springTab } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import { ADMIN_NAV, adminSectionLabel, isAdminNavActive, type AdminNavItem } from './admin-nav';

/** Offset of the fixed site navbar (80px + safe area) — the shell sits below it. */
// The site navbar/footer/tab bar are hidden on /admin*, so the shell cancels the root layout's offsets.
const TOP_OFFSET = 'top-0 pt-safe';
const CANCEL_LAYOUT_OFFSETS = '-mt-[calc(5rem+env(safe-area-inset-top))] -mb-[calc(4rem+env(safe-area-inset-bottom))] lg:mb-0';
const SIDEBAR_HEIGHT = 'h-dvh';

/**
 * Admin layout: auth gate, desktop sidebar, mobile top bar with a chip nav.
 * `status === 'idle'` (before hydration) renders a skeleton — never redirects.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { status, user, isAdmin } = useAuth();

  if (status === 'idle') return <ShellSkeleton />;
  if (status === 'anonymous') return <GateCard variant="login" />;
  if (!isAdmin || !user) return <GateCard variant="forbidden" />;

  return <Shell userName={user.name} userPhone={user.phoneNumber}>{children}</Shell>;
}

function Shell({ userName, userPhone, children }: { userName?: string; userPhone: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? ROUTES.ADMIN;
  const router = useRouter();
  const logout = useLogout();
  const { data: stats } = useAdminDashboard();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push(ROUTES.HOME);
    } finally {
      setLoggingOut(false);
    }
  };

  const badgeFor = (item: AdminNavItem): number => (item.badgeKey && stats ? stats[item.badgeKey] : 0);

  return (
    <div className={cn('min-h-dvh bg-background lg:flex lg:items-start', CANCEL_LAYOUT_OFFSETS)}>
      {/* ---------- desktop sidebar ---------- */}
      <aside
        className={cn(
          'hidden lg:sticky lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-y-auto',
          TOP_OFFSET,
          SIDEBAR_HEIGHT,
          'bg-primary text-white shadow-luxury'
        )}
      >
        <Link
          href={ROUTES.ADMIN}
          className="flex items-center gap-3 px-5 pb-4 pt-6 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-secondary to-secondary-700 text-primary shadow-glow-secondary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black">{APP_NAME}</span>
            <span className="block text-[11px] text-white/60">پنل مدیریت</span>
          </span>
        </Link>
        <span className="mx-5 h-px bg-linear-to-l from-transparent via-secondary/50 to-transparent" aria-hidden="true" />

        <nav aria-label="ناوبری پنل مدیریت" className="flex-1 space-y-1 px-3 py-4">
          {ADMIN_NAV.map((item) => {
            const active = isAdminNavActive(pathname, item);
            const badge = badgeFor(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary',
                  active ? 'text-secondary' : 'text-white/75 hover:bg-white/5 hover:text-white'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-sidebar-active"
                    className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-secondary/40"
                    transition={springTab}
                    aria-hidden="true"
                  />
                )}
                {active && <span className="absolute inset-y-2.5 inset-s-0 w-1 rounded-full bg-secondary" aria-hidden="true" />}
                <Icon className="relative z-10 h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="relative z-10 flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className="relative z-10 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary"
                    aria-label={`${toPersianDigits(badge)} مورد جدید`}
                  >
                    {toPersianDigits(badge > 99 ? '99+' : badge)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar size="md" fallback={(userName ?? 'م').charAt(0)} className="ring-2 ring-secondary/60" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{userName || 'مدیر سیستم'}</p>
              <p className="truncate text-[11px] text-white/60" dir="ltr">
                {toPersianDigits(userPhone)}
              </p>
            </div>
            <IconButton
              label="خروج از حساب"
              icon={<LogOut />}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
              disabled={loggingOut}
            />
          </div>
          <Link
            href={ROUTES.HOME}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            بازگشت به سایت
          </Link>
        </div>
      </aside>

      {/* ---------- content column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBar pathname={pathname} badgeFor={badgeFor} onLogout={handleLogout} loggingOut={loggingOut} />
        <div className="flex-1 pb-safe">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 pb-10 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MobileBar({
  pathname,
  badgeFor,
  onLogout,
  loggingOut,
}: {
  pathname: string;
  badgeFor: (item: AdminNavItem) => number;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const navRef = React.useRef<HTMLElement>(null);

  // keep the active chip visible when navigating
  React.useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className={cn('sticky z-30 border-b border-border/40 glass-effect-strong lg:hidden', TOP_OFFSET)}>
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <Link href={ROUTES.ADMIN} className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-secondary to-secondary-700 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-foreground">پنل مدیریت</span>
            <span className="block truncate text-[11px] text-muted-foreground">{adminSectionLabel(pathname)}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeSwitcher />
          <IconButton label="خروج از حساب" icon={<LogOut />} onClick={onLogout} disabled={loggingOut} />
        </div>
      </div>
      <nav ref={navRef} aria-label="بخش‌های پنل مدیریت" className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {ADMIN_NAV.map((item) => {
          const active = isAdminNavActive(pathname, item);
          const badge = badgeFor(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'border-transparent text-primary-foreground' : 'border-border/70 bg-background/70 text-foreground'
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-mobile-nav"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={springTab}
                  aria-hidden="true"
                />
              )}
              <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
              <span className="relative z-10">{item.label}</span>
              {badge > 0 && (
                <span
                  className={cn(
                    'relative z-10 rounded-full px-1.5 text-[11px] font-bold tabular-nums',
                    active ? 'bg-secondary text-primary' : 'bg-secondary/25 text-foreground'
                  )}
                  aria-label={`${toPersianDigits(badge)} مورد جدید`}
                >
                  {toPersianDigits(badge > 99 ? '99+' : badge)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function GateCard({ variant }: { variant: 'login' | 'forbidden' }) {
  const openLoginSheet = useUIStore((s) => s.openLoginSheet);
  const isLogin = variant === 'login';

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-background p-6 text-center shadow-luxury sm:p-8">
        <span
          className={cn(
            'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl',
            isLogin ? 'bg-secondary/20 text-secondary-800 dark:text-secondary-300' : 'bg-destructive/10 text-destructive'
          )}
          aria-hidden="true"
        >
          {isLogin ? <Lock className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
        </span>
        <h1 className="mt-5 text-xl font-black text-foreground text-balance">
          {isLogin ? 'برای ورود به پنل مدیریت وارد شوید' : 'دسترسی به این بخش مجاز نیست'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isLogin
            ? 'پنل مدیریت فقط برای حساب‌های مدیر در دسترس است. با شماره موبایل مدیر وارد شوید.'
            : 'حساب شما نقش مدیر ندارد. اگر فکر می‌کنید اشتباهی رخ داده، با پشتیبانی تماس بگیرید.'}
        </p>
        <div className="mt-6 grid gap-3">
          {isLogin ? (
            <Button size="lg" onClick={() => openLoginSheet(ROUTES.ADMIN)}>
              ورود به حساب
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href={ROUTES.HOME}>
                <Home className="h-5 w-5" aria-hidden="true" />
                بازگشت به صفحه اصلی
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link href={isLogin ? ROUTES.HOME : ROUTES.PROFILE}>{isLogin ? 'بازگشت به سایت' : 'مشاهده پروفایل'}</Link>
          </Button>
        </div>
        {isLogin && (
          <p className="mt-5 rounded-xl bg-secondary/10 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
            در حالت نمایشی، شماره{' '}
            <span className="font-bold text-foreground" dir="ltr">
              {toPersianDigits(DEMO_ADMIN_PHONE)}
            </span>{' '}
            با کد{' '}
            <span className="font-bold text-foreground" dir="ltr">
              {toPersianDigits(DEMO_OTP_CODE)}
            </span>{' '}
            حساب مدیر است.
          </p>
        )}
      </div>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className={cn('min-h-dvh bg-background lg:flex lg:items-start', CANCEL_LAYOUT_OFFSETS)} aria-busy="true" aria-label="در حال بارگذاری پنل مدیریت">
      <div className={cn('hidden bg-primary/90 lg:sticky lg:block lg:w-72 lg:shrink-0', TOP_OFFSET, SIDEBAR_HEIGHT)}>
        <div className="space-y-3 p-5">
          <Skeleton className="h-11 w-40 bg-white/10" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full bg-white/10" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="space-y-3 px-4 py-4 lg:hidden">
          <Skeleton className="h-9 w-40" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
