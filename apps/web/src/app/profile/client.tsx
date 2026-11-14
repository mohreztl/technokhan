'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Heart, History, MapPin, Package, ShoppingBag } from 'lucide-react';
import { ROUTES, toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGate } from '@/components/profile/auth-gate';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs, isProfileTab, type ProfileTab } from '@/components/profile/profile-tabs';
import { TabAddresses } from '@/components/profile/tab-addresses';
import { TabNotifications } from '@/components/profile/tab-notifications';
import { TabOrders } from '@/components/profile/tab-orders';
import { TabRecent } from '@/components/profile/tab-recent';
import { TabSettings } from '@/components/profile/tab-settings';
import { TabWishlist } from '@/components/profile/tab-wishlist';
import { OrderCard } from '@/components/orders/order-card';
import { useAddresses, useMyOrders } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useNotifications } from '@/lib/store/notification-store';
import { useRecentlyViewed } from '@/lib/store/recently-viewed-store';
import { useWishlist } from '@/lib/store/wishlist-store';

function StatTile({ icon: Icon, label, value, href, loading }: { icon: typeof Package; label: string; value: number; href: string; loading?: boolean }) {
  return (
    <Link href={href} className="glass-effect flex min-h-[44px] flex-col gap-1 rounded-2xl p-3 transition-colors hover:border-secondary/40 hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary" aria-label={`${label}: ${toPersianDigits(value)}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary" aria-hidden="true"><Icon className="h-4 w-4" /></span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      {loading ? <Skeleton className="h-6 w-10" /> : <span className="text-xl font-black tabular-nums">{toPersianDigits(value)}</span>}
    </Link>
  );
}

/** Storefront snapshot with order, address and wishlist shortcuts. */
function TabOverview({ onSelect }: { onSelect: (tab: ProfileTab) => void }) {
  const orders = useMyOrders();
  const addresses = useAddresses();
  const { count: wishlistCount } = useWishlist();
  const { ids: recentIds } = useRecentlyViewed();
  const { unread } = useNotifications();

  const latestOrder = useMemo(() => {
    const list = [...(orders.data ?? [])];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0];
  }, [orders.data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatTile icon={Package} label="سفارش‌ها" value={orders.data?.length ?? 0} href={ROUTES.ORDERS} loading={orders.isLoading} />
        <StatTile icon={MapPin} label="آدرس‌ها" value={addresses.data?.length ?? 0} href={`${ROUTES.PROFILE}?tab=addresses`} loading={addresses.isLoading} />
        <StatTile icon={Heart} label="علاقه‌مندی‌ها" value={wishlistCount} href={ROUTES.WISHLIST} />
        <StatTile icon={History} label="بازدیدهای اخیر" value={recentIds.length} href={`${ROUTES.PROFILE}?tab=recent`} />
        <StatTile icon={Bell} label="اعلان خوانده‌نشده" value={unread} href={`${ROUTES.PROFILE}?tab=notifications`} />
      </div>

      <section aria-labelledby="overview-order" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-order" className="text-lg font-bold">آخرین سفارش</h2>
          <Button variant="ghost" size="sm" onClick={() => onSelect('orders')}>همهٔ سفارش‌ها<ArrowLeft className="h-4 w-4" aria-hidden="true" /></Button>
        </div>
        {orders.isLoading ? <Skeleton className="h-40 rounded-2xl" /> : latestOrder ? <OrderCard order={latestOrder} /> : (
          <div className="glass-effect rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild><Link href={ROUTES.PRODUCTS}><ShoppingBag className="h-4 w-4" aria-hidden="true" />فروشگاه محصولات</Link></Button>
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="دسترسی سریع">
        <Link href="/compare" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-secondary"><h2 className="font-bold">مقایسه انتخاب‌ها</h2><p className="mt-1 text-sm text-muted-foreground">مشخصات و قیمت محصولات ذخیره‌شده برای مقایسه را کنار هم ببینید.</p></Link>
        <Link href="/track" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-secondary"><h2 className="font-bold">پیگیری با کد سفارش</h2><p className="mt-1 text-sm text-muted-foreground">وضعیت ارسال را با کد رهگیری و بدون جستجو در فهرست بررسی کنید.</p></Link>
      </section>
    </div>
  );
}

function ProfilePanels({ tab, onSelect }: { tab: ProfileTab; onSelect: (tab: ProfileTab) => void }) {
  switch (tab) {
    case 'orders': return <TabOrders />;
    case 'addresses': return <TabAddresses />;
    case 'wishlist': return <TabWishlist />;
    case 'recent': return <TabRecent />;
    case 'notifications': return <TabNotifications />;
    case 'settings': return <TabSettings />;
    default: return <TabOverview onSelect={onSelect} />;
  }
}

export function ProfileClient() {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();
  const raw = params.get('tab');
  const tab: ProfileTab = isProfileTab(raw) ? raw : 'overview';

  const select = useCallback((next: ProfileTab) => {
    const href = next === 'overview' ? ROUTES.PROFILE : `${ROUTES.PROFILE}?tab=${next}`;
    router.replace(href, { scroll: false });
  }, [router]);

  return (
    <div className="container-custom pb-16 pt-5 sm:pt-8">
      <AuthGate title="برای مشاهدهٔ پروفایل وارد شوید" description="سفارش‌ها، علاقه‌مندی‌ها، بازدیدهای اخیر و آدرس‌های شما پس از ورود نمایش داده می‌شوند.">
        <ProfileHeader onEdit={() => select('settings')} />
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:items-start lg:gap-8">
          <ProfileTabs tab={tab} onSelect={select} />
          <motion.div key={tab} id={`profile-panel-${tab}`} role="tabpanel" aria-labelledby={`profile-tab-${tab}`} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.2 }} className="min-w-0">
            <ProfilePanels tab={tab} onSelect={select} />
          </motion.div>
        </div>
      </AuthGate>
    </div>
  );
}
