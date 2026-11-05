'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, Package, ShoppingBag } from 'lucide-react';
import { ROUTES, toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGate } from '@/components/profile/auth-gate';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs, isProfileTab, type ProfileTab } from '@/components/profile/profile-tabs';
import { TabAddresses } from '@/components/profile/tab-addresses';
import { TabOrders } from '@/components/profile/tab-orders';
import { TabSettings } from '@/components/profile/tab-settings';
import { TabWishlist } from '@/components/profile/tab-wishlist';
import { OrderCard } from '@/components/orders/order-card';
import { useAddresses, useMyOrders } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useWishlist } from '@/lib/store/wishlist-store';

function StatTile({
  icon: Icon,
  label,
  value,
  href,
  loading,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  href: string;
  loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className="glass-effect flex min-h-[44px] flex-col gap-1 rounded-2xl p-3 transition-colors hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
      aria-label={`${label}: ${value}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary" aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-6 w-10" />
      ) : (
        <span className="text-xl font-black tabular-nums">{toPersianDigits(value)}</span>
      )}
    </Link>
  );
}

/** Storefront snapshot with order, address and wishlist shortcuts. */
function TabOverview({ onSelect }: { onSelect: (tab: ProfileTab) => void }) {
  const orders = useMyOrders();
  const addresses = useAddresses();
  const { count: wishlistCount } = useWishlist();

  const latestOrder = useMemo(() => {
    const list = [...(orders.data ?? [])];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0];
  }, [orders.data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={Package} label="سفارش‌ها" value={orders.data?.length ?? 0} href={ROUTES.ORDERS} loading={orders.isLoading} />
        <StatTile icon={MapPin} label="آدرس‌ها" value={addresses.data?.length ?? 0} href={`${ROUTES.PROFILE}?tab=addresses`} loading={addresses.isLoading} />
        <StatTile icon={Heart} label="علاقه‌مندی‌ها" value={wishlistCount} href={ROUTES.WISHLIST} />
      </div>

      <section aria-labelledby="overview-order" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-order" className="text-lg font-bold">آخرین سفارش</h2>
          <Button variant="ghost" size="sm" onClick={() => onSelect('orders')}>
            همهٔ سفارش‌ها
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {orders.isLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : latestOrder ? (
          <OrderCard order={latestOrder} />
        ) : (
          <div className="glass-effect rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href={ROUTES.PRODUCTS}>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                فروشگاه محصولات
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfilePanels({ tab, onSelect }: { tab: ProfileTab; onSelect: (tab: ProfileTab) => void }) {
  switch (tab) {
    case 'orders':
      return <TabOrders />;
    case 'addresses':
      return <TabAddresses />;
    case 'wishlist':
      return <TabWishlist />;
    case 'settings':
      return <TabSettings />;
    default:
      return <TabOverview onSelect={onSelect} />;
  }
}

export function ProfileClient() {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();

  const raw = params.get('tab');
  const tab: ProfileTab = isProfileTab(raw) ? raw : 'overview';

  const select = useCallback(
    (next: ProfileTab) => {
      const href = next === 'overview' ? ROUTES.PROFILE : `${ROUTES.PROFILE}?tab=${next}`;
      router.replace(href, { scroll: false });
    },
    [router]
  );

  return (
    <div className="container-custom pb-16">
      <AuthGate title="برای مشاهدهٔ پروفایل وارد شوید" description="سفارش‌ها، علاقه‌مندی‌ها و آدرس‌های شما پس از ورود نمایش داده می‌شوند.">
        <ProfileHeader onEdit={() => select('settings')} />

        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:items-start lg:gap-8">
          <ProfileTabs tab={tab} onSelect={select} />

          {/* URL-driven tabs avoid exit animations that can leave the old panel frozen. */}
          <motion.div
            key={tab}
            id={`profile-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`profile-tab-${tab}`}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="min-w-0"
          >
            <ProfilePanels tab={tab} onSelect={select} />
          </motion.div>
        </div>
      </AuthGate>
    </div>
  );
}
