'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Camera,
  FileText,
  GitCompareArrows,
  Heart,
  HelpCircle,
  Info,
  LogIn,
  LogOut,
  Package,
  PackageSearch,
  Phone,
  Send,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react';
import { InstagramIcon, WhatsappIcon } from '@/components/icons/brands';
import { APP_NAME, ROUTES, toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { showToast } from '@/components/ui/toaster';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuth } from '@/lib/store/auth-store';
import { useSettings } from '@/lib/hooks/use-settings';
import { useWishlist } from '@/lib/store/wishlist-store';

interface MoreLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

/** Secondary navigation sheet opened from the navbar's «بیشتر» button on mobile. */
export function MoreSheet() {
  const pathname = usePathname();
  const moreOpen = useUIStore((s) => s.moreOpen);
  const setMoreOpen = useUIStore((s) => s.setMoreOpen);
  const { user, status, isAuthenticated, logout } = useAuth();
  const settings = useSettings();
  const { count: wishlistCount } = useWishlist();

  const close = React.useCallback(() => setMoreOpen(false), [setMoreOpen]);

  // Close whenever the route changes (link taps, back button)
  React.useEffect(() => {
    setMoreOpen(false);
  }, [pathname, setMoreOpen]);

  const links: MoreLink[] = [
    { label: 'درباره ما', href: ROUTES.ABOUT, icon: Info },
    { label: 'تماس با ما', href: ROUTES.CONTACT, icon: Phone },
    { label: 'نمونه کارها', href: ROUTES.GALLERY, icon: Camera },
    { label: 'مقایسهٔ خدمات', href: ROUTES.COMPARE, icon: GitCompareArrows },
    { label: 'مجله', href: ROUTES.BLOG, icon: BookOpen },
    { label: 'سؤالات متداول', href: ROUTES.FAQ, icon: HelpCircle },
    { label: 'پیگیری سفارش', href: ROUTES.TRACK, icon: PackageSearch },
    { label: 'علاقه‌مندی‌ها', href: ROUTES.WISHLIST, icon: Heart, badge: wishlistCount },
    { label: 'سفارش‌های من', href: ROUTES.ORDERS, icon: Package },
    { label: 'قوانین', href: ROUTES.TERMS, icon: FileText },
    { label: 'حریم خصوصی', href: ROUTES.PRIVACY, icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    showToast.success('از حساب کاربری خارج شدید');
    close();
  };

  return (
    <BottomSheet
      open={moreOpen}
      onOpenChange={setMoreOpen}
      title="بیشتر"
      description={APP_NAME}
      snapPoints={[0.78, 0.94]}
    >
      {/* Account row */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-primary-foreground">
          <User className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {isAuthenticated ? (
            <>
              <p className="truncate text-sm font-bold text-foreground">
                {user?.name || 'کاربر اتولانژ'}
              </p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {toPersianDigits(user?.phoneNumber ?? user?.phone ?? '')}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-foreground">به اتولانژ خوش آمدید</p>
              <p className="text-xs text-muted-foreground">برای پیگیری سفارش‌ها وارد شوید</p>
            </>
          )}
        </div>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            خروج
          </Button>
        ) : (
          <Button asChild variant="primary" size="sm" className="gap-1.5">
            <Link href={ROUTES.LOGIN} onClick={close} aria-disabled={status === 'idle'}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              ورود / ثبت‌نام
            </Link>
          </Button>
        )}
      </div>

      {/* Secondary links */}
      <nav aria-label="پیوندهای بیشتر">
        <ul className="grid grid-cols-2 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className={cn(
                    'flex min-h-13 items-center gap-3 rounded-2xl border border-border/40 bg-background/60 px-3 py-2.5',
                    'text-sm font-medium text-foreground transition-colors hover:bg-primary/10 active:scale-[0.98]',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-secondary">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="flex-1 truncate">{link.label}</span>
                  {typeof link.badge === 'number' && link.badge > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground tabular-nums">
                      {toPersianDigits(link.badge)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme + call */}
      <div className="mt-4 flex items-center gap-2">
        <ThemeSwitcher variant="pill" className="flex-1 justify-center" />
        <Button asChild variant="secondary" className="flex-1 gap-2 shadow-glow-secondary">
          <a href={`tel:${settings.phone}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            تماس فوری
          </a>
        </Button>
      </div>

      {/* Social */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">{settings.workingHours}</span>
        <div className="flex items-center gap-1">
          {settings.whatsapp && (
            <IconButton asChild label="واتس‌اپ" icon={<WhatsappIcon />} variant="ghost">
              <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" />
            </IconButton>
          )}
          {settings.instagram && (
            <IconButton asChild label="اینستاگرام" icon={<InstagramIcon />} variant="ghost">
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" />
            </IconButton>
          )}
          {settings.telegram && (
            <IconButton asChild label="تلگرام" icon={<Send />} variant="ghost">
              <a href={settings.telegram} target="_blank" rel="noopener noreferrer" />
            </IconButton>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
