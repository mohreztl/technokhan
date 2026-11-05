'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarCheck, CalendarPlus, Heart, MapPin, Package, ShoppingBag } from 'lucide-react';
import { ROUTES, toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGate } from '@/components/profile/auth-gate';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs, isProfileTab, type ProfileTab } from '@/components/profile/profile-tabs';
import { TabAddresses } from '@/components/profile/tab-addresses';
import { TabBookings } from '@/components/profile/tab-bookings';
import { TabGarage } from '@/components/profile/tab-garage';
import { TabOrders } from '@/components/profile/tab-orders';
import { TabSettings } from '@/components/profile/tab-settings';
import { TabWishlist } from '@/components/profile/tab-wishlist';
import { BookingCard } from '@/components/profile/booking-card';
import { OrderCard } from '@/components/orders/order-card';
import { useAddresses, useMyBookings, useMyOrders } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useWishlist } from '@/lib/store/wishlist-store';

const ACTIVE_BOOKING = new Set(['pending', 'confirmed', 'in_progress']);

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

/** Snapshot panel: counters, the latest order and the next booking. */
function TabOverview({ onSelect }: { onSelect: (tab: ProfileTab) => void }) {
  const orders = useMyOrders();
  const bookings = useMyBookings();
  const addresses = useAddresses();
  const { count: wishlistCount } = useWishlist();

  const latestOrder = useMemo(() => {
    const list = [...(orders.data ?? [])];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0];
  }, [orders.data]);

  const nextBooking = useMemo(() => {
    const list = (bookings.data ?? []).filter((b) => ACTIVE_BOOKING.has(b.status));
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return list[0];
  }, [bookings.data]);

  const activeBookings = (bookings.data ?? []).filter((b) => ACTIVE_BOOKING.has(b.status)).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Package} label="سفارش‌ها" value={orders.data?.length ?? 0} href={ROUTES.ORDERS} loading={orders.isLoading} />
        <StatTile
          icon={CalendarCheck}
          label="رزروهای فعال"
          value={activeBookings}
          href={`${ROUTES.PROFILE}?tab=bookings`}
          loading={bookings.isLoading}
        />
        <StatTile
          icon={MapPin}
          label="آدرس‌ها"
          value={addresses.data?.length ?? 0}
          href={`${ROUTES.PROFILE}?tab=addresses`}
          loading={addresses.isLoading}
        />
        <StatTile icon={Heart} label="علاقه‌مندی‌ها" value={wishlistCount} href={ROUTES.WISHLIST} />
      </div>

      <section aria-labelledby="overview-order" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-order" className="text-lg font-bold">
            آخرین سفارش
          </h2>
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

      <section aria-labelledby="overview-booking" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-booking" className="text-lg font-bold">
            رزرو پیش‌رو
          </h2>
          <Button variant="ghost" size="sm" onClick={() => onSelect('bookings')}>
            همهٔ رزروها
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {bookings.isLoading ? (
          <Skeleton className="h-44 rounded-2xl" />
        ) : nextBooking ? (
          <BookingCard booking={nextBooking} />
        ) : (
          <div className="glass-effect rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">رزرو فعالی ندارید.</p>
            <Button variant="secondary" size="sm" className="mt-4" asChild>
              <Link href={ROUTES.BOOKING}>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                رزرو نوبت
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
    case 'bookings':
      return <TabBookings />;
    case 'addresses':
      return <TabAddresses />;
    case 'garage':
      return <TabGarage />;
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
      <AuthGate title="برای مشاهدهٔ پروفایل وارد شوید" description="سفارش‌ها، رزروها و آدرس‌های شما پس از ورود نمایش داده می‌شوند.">
        <ProfileHeader onEdit={() => select('settings')} />

        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:items-start lg:gap-8">
          <ProfileTabs tab={tab} onSelect={select} />

          {/* Keyed enter animation, deliberately without AnimatePresence: the active tab comes
              from the URL, and a router transition can leave mode="wait" waiting forever on an
              exit that never completes, which freezes the panel on the previous tab. */}
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
