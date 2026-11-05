'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { CalendarPlus, CalendarX2, RefreshCw } from 'lucide-react';
import { ROUTES } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyBookings } from '@/lib/hooks';
import { BookingCard } from './booking-card';

export function BookingsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری رزروها">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>
  );
}

const ACTIVE = new Set(['pending', 'confirmed', 'in_progress']);

export function TabBookings() {
  const bookings = useMyBookings();

  const sorted = useMemo(() => {
    const list = [...(bookings.data ?? [])];
    // active bookings first (soonest date), then the rest newest-first
    return list.sort((a, b) => {
      const aActive = ACTIVE.has(a.status) ? 0 : 1;
      const bActive = ACTIVE.has(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      return aActive === 0 ? ad - bd : bd - ad;
    });
  }, [bookings.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">رزروهای من</h2>
        <Button size="sm" asChild>
          <Link href={ROUTES.BOOKING}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            رزرو جدید
          </Link>
        </Button>
      </div>

      {bookings.isLoading ? (
        <BookingsSkeleton />
      ) : bookings.isError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm">
          <p className="mb-3">دریافت رزروها ناموفق بود.</p>
          <Button variant="outline" size="sm" onClick={() => bookings.refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            تلاش دوباره
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <CalendarX2 className="h-12 w-12 text-secondary" aria-hidden="true" />
          <div>
            <p className="font-bold">هنوز رزروی ثبت نکرده‌اید</p>
            <p className="mt-1 text-sm text-muted-foreground">نوبت دیتیلینگ، سرامیک یا کاور خودرو را آنلاین بگیرید.</p>
          </div>
          <Button size="lg" asChild>
            <Link href={ROUTES.BOOKING}>
              <CalendarPlus className="h-5 w-5" aria-hidden="true" />
              رزرو نوبت
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {sorted.map((booking) => (
              <li key={booking.id}>
                <BookingCard booking={booking} />
              </li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
