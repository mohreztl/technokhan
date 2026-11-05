'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, Search, ShoppingBag, Store } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { useCart } from '@/lib/store/cart-store';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils';

/** Native-app-style mobile navigation for the five primary storefront destinations. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname === '/login') return null;
  const items = [
    { href: '/', label: 'خانه', icon: Home },
    { href: '/shop', label: 'فروشگاه', icon: Store },
    { href: '/cart', label: 'سبد خرید', icon: ShoppingBag },
    { href: '/wishlist', label: 'علاقه‌مندی', icon: Heart },
  ];
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-2xl border border-border/80 bg-background/90 px-2 pb-safe shadow-panel backdrop-blur-xl lg:hidden" aria-label="ناوبری اصلی موبایل">
      {items.slice(0, 2).map((item) => <TabLink key={item.href} {...item} active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)} />)}
      <button type="button" onClick={() => setSearchOpen(true)} className="flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground" aria-label="جستجو"><Search className="size-5" aria-hidden="true" /><span className="text-[10px]">جستجو</span></button>
      {items.slice(2).map((item) => <TabLink key={item.href} {...item} active={pathname.startsWith(item.href)} badge={item.href === '/cart' ? totalItems : 0} />)}
    </nav>
  );
}

interface TabLinkProps { href: string; label: string; icon: typeof Home; active: boolean; badge?: number }
function TabLink({ href, label, icon: Icon, active, badge = 0 }: TabLinkProps) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={cn('relative flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-xl', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
      <Icon className="size-5" aria-hidden="true" /><span className="text-[10px]">{label}</span>
      {badge > 0 && <span className="absolute -top-1 end-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground tabular-nums">{toPersianDigits(badge)}</span>}
    </Link>
  );
}
