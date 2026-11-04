'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { CATEGORIES, toPersianDigits } from '@autolounge/shared';
import { CATEGORY_MEDIA } from '@/content/media-assets';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { BottomSheet } from '@/components/ui/bottom-sheet';

/** Sticky storefront navigation with an accessible mega menu and mobile category sheet. */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { openCart, totalItems } = useCart();
  const wishlist = useWishlist();
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/85 pt-safe backdrop-blur-xl">
      <div className="container-custom flex h-20 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="تکنو خان، صفحه اصلی">
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-lg font-black text-background">T</span>
          <span className="hidden sm:block"><span className="block text-lg font-black leading-5">تکنو خان</span><span className="text-[10px] tracking-wide text-muted-foreground" dir="ltr">PRECISION TECH</span></span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          <div className="group relative">
            <Link href="/shop" className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold hover:bg-muted">فروشگاه</Link>
            <div className="invisible absolute inset-x-auto start-0 top-full w-[min(78vw,58rem)] translate-y-2 rounded-2xl border border-border bg-popover p-4 opacity-0 shadow-panel transition-[opacity,transform,visibility] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((category) => {
                  const media = CATEGORY_MEDIA[category.id as keyof typeof CATEGORY_MEDIA];
                  return (
                    <Link key={category.id} href={`/category/${category.id}`} className="group/card relative min-h-36 overflow-hidden rounded-xl border border-border">
                      <Image src={media.src} alt="" fill sizes="280px" fetchPriority="low" className="object-cover transition-transform duration-300 group-hover/card:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#090b0cee] to-transparent" />
                      <span className="absolute inset-x-4 bottom-3 text-sm font-bold text-white">{category.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <Link href="/compare" className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold hover:bg-muted">مقایسه</Link>
          <Link href="/blog" className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold hover:bg-muted">مجله تکنو</Link>
          <Link href="/about" className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold hover:bg-muted">درباره ما</Link>
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          <Button size="icon" variant="ghost" aria-label="جستجو (Ctrl+K)" onClick={() => setSearchOpen(true)}><Search className="size-5" aria-hidden="true" /></Button>
          <span className="hidden sm:inline-flex"><ThemeSwitcher /></span>
          <Button asChild size="icon" variant="ghost" className="relative hidden sm:inline-flex"><Link href="/wishlist" aria-label={`علاقه‌مندی‌ها، ${toPersianDigits(wishlist.count)} مورد`}><Heart className="size-5" aria-hidden="true" />{wishlist.count > 0 && <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground tabular-nums">{toPersianDigits(wishlist.count)}</span>}</Link></Button>
          <Button size="icon" variant="ghost" className="relative" aria-label={`سبد خرید، ${toPersianDigits(totalItems)} کالا`} onClick={openCart}><ShoppingBag className="size-5" aria-hidden="true" />{totalItems > 0 && <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground tabular-nums">{toPersianDigits(totalItems)}</span>}</Button>
          <Button size="icon" variant="ghost" className="lg:hidden" aria-label="باز کردن دسته‌بندی‌ها" onClick={() => setMenuOpen(true)}><Menu className="size-5" aria-hidden="true" /></Button>
        </div>
      </div>

      <BottomSheet open={menuOpen} onOpenChange={setMenuOpen} title="دسته‌بندی تکنو خان" description="گجت موردنظر را از یک مسیر کوتاه پیدا کنید">
        <nav className="grid gap-2 py-3" aria-label="دسته‌بندی موبایل">
          {CATEGORIES.map((category) => <Link key={category.id} href={`/category/${category.id}`} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl bg-muted px-4 font-semibold">{category.name}</Link>)}
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl bg-muted px-4 font-semibold">مجله تکنو</Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl bg-muted px-4 font-semibold">علاقه‌مندی‌ها</Link>
        </nav>
      </BottomSheet>
    </header>
  );
}
