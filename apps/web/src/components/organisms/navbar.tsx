'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { MoreHorizontal, Phone, Search, ShoppingCart, Sparkles, User } from 'lucide-react';
import { APP_NAME, CONTACT, ROUTES } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useCartCount, useCartStore } from '@/lib/store/cart-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuth } from '@/lib/store/auth-store';
import { springSheet } from '@/lib/animation-variants';
import { isChromeHidden } from '@/lib/routes';

const menuItems = [
  { title: 'خانه', href: ROUTES.HOME },
  { title: 'خدمات', href: ROUTES.SERVICES },
  { title: 'محصولات', href: ROUTES.PRODUCTS },
  { title: 'رزرو نوبت', href: ROUTES.BOOKING },
  { title: 'نمونه کارها', href: ROUTES.GALLERY },
  { title: 'درباره ما', href: ROUTES.ABOUT },
  { title: 'تماس با ما', href: ROUTES.CONTACT },
];

const isActivePath = (pathname: string, href: string) =>
  href === ROUTES.HOME ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Fixed 80px navbar. Transparent over the hero, glass once scrolled.
 * Mobile action cluster: [search][cart][more]; desktop adds the pill nav,
 * theme switch, profile and the call CTA. Ctrl/Cmd+K opens search.
 */
export const Navbar: React.FC = () => {
  const pathname = usePathname() ?? '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = useCartCount();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setMoreOpen = useUIStore((s) => s.setMoreOpen);
  const { status } = useAuth();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v > 20;
    setIsScrolled((prev) => (prev === next ? prev : next));
  });

  // Ctrl/Cmd+K → search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  // Admin has its own shell
  if (isChromeHidden(pathname)) return null;

  // Over the cinematic hero the bar is transparent on a dark image → light foreground
  const overHero = pathname === ROUTES.HOME && !isScrolled;
  const profileHref = status === 'anonymous' ? ROUTES.LOGIN : ROUTES.PROFILE;
  const iconClass = overHero ? 'text-white hover:bg-white/10' : 'hover:bg-primary/10';

  return (
    <motion.header
      className={cn(
        'fixed inset-x-0 top-0 z-50 pt-safe transition-[background-color,box-shadow,border-color] duration-500',
        isScrolled
          ? 'glass-effect-strong border-b border-border/40 shadow-2xl shadow-primary/5'
          : 'border-b border-transparent bg-transparent',
        overHero && 'text-white'
      )}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Gold accent line, visible once scrolled */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent transition-opacity duration-500',
          isScrolled ? 'opacity-100' : 'opacity-0'
        )}
      />

      <nav aria-label="ناوبری سایت" className="container-custom">
        <div className="flex h-20 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="group flex shrink-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${APP_NAME} - صفحه اصلی`}
          >
            <motion.span
              className="relative block"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-700 to-secondary shadow-lg shadow-primary/20 transition-shadow duration-500 group-hover:shadow-xl group-hover:shadow-secondary/30">
                <span className="text-2xl font-black text-white">A</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </span>
            </motion.span>
            <span className="hidden flex-col sm:flex">
              <span
                className={cn(
                  'text-2xl font-black leading-tight',
                  overHero
                    ? 'text-white'
                    : 'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'
                )}
              >
                {APP_NAME}
              </span>
              <span
                className={cn(
                  '-mt-0.5 text-[10px] tracking-wider',
                  overHero ? 'text-white/70' : 'text-muted-foreground'
                )}
              >
                مراقبت تخصصی خودرو
              </span>
            </span>
          </Link>

          {/* Desktop pill nav */}
          <ul
            className={cn(
              'hidden items-center gap-0.5 rounded-full border px-1.5 py-1 backdrop-blur-md lg:flex',
              overHero ? 'border-white/15 bg-white/10' : 'border-border/30 bg-background/40'
            )}
          >
            {menuItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative block rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none',
                      'focus-visible:ring-2 focus-visible:ring-ring',
                      overHero
                        ? 'text-white/85 hover:bg-white/10 hover:text-white'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary',
                      active && (overHero ? 'text-white' : 'text-primary')
                    )}
                  >
                    {item.title}
                    {active && (
                      <motion.span
                        layoutId="nav-active-dot"
                        transition={springSheet}
                        className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-secondary shadow-[0_0_8px_hsl(var(--secondary))]"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <IconButton
              label="جستجو (Ctrl+K)"
              icon={<Search />}
              className={iconClass}
              onClick={() => setSearchOpen(true)}
            />

            <ThemeSwitcher className="hidden lg:flex" />

            <IconButton
              label="سبد خرید"
              icon={<ShoppingCart />}
              badge={cartCount}
              className={iconClass}
              onClick={toggleCart}
              data-cart-target="desktop"
            />

            <IconButton
              asChild
              label={status === 'anonymous' ? 'ورود به حساب' : 'پروفایل'}
              icon={<User />}
              className={cn('hidden lg:inline-flex', iconClass)}
            >
              <Link href={profileHref} />
            </IconButton>

            <Button
              asChild
              variant="secondary"
              className="hidden gap-2 bg-gradient-to-r from-secondary via-secondary/90 to-secondary shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30 lg:inline-flex"
            >
              <a href={`tel:${CONTACT.phoneEn}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>تماس فوری</span>
                <Sparkles className="h-3 w-3" aria-hidden="true" />
              </a>
            </Button>

            <IconButton
              label="بیشتر"
              icon={<MoreHorizontal />}
              className={cn('lg:hidden', iconClass)}
              onClick={() => setMoreOpen(true)}
            />
          </div>
        </div>
      </nav>
    </motion.header>
  );
};
