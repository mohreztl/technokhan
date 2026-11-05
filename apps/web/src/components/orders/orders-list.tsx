'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { PackageOpen, RefreshCw, ShoppingBag } from 'lucide-react';
import { ORDER_STATUS_LABELS, ROUTES } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyOrders } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { OrderCard } from './order-card';

const FILTERS = [{ key: 'all', label: 'همه' }, ...Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => ({ key, label }))];

export interface OrdersListProps {
  /** hide the filter chips (profile tab shows the latest few) */
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری سفارش‌ها">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl" />
      ))}
    </div>
  );
}

/** Filterable list of the signed-in user's orders. */
export function OrdersList({ limit, showFilters = true, className }: OrdersListProps) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const orders = useMyOrders(filter === 'all' ? undefined : filter);

  const sorted = useMemo(() => {
    const list = [...(orders.data ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return limit ? list.slice(0, limit) : list;
  }, [orders.data, limit]);

  return (
    <div className={cn('space-y-4', className)}>
      {showFilters && (
        <div role="tablist" aria-label="فیلتر وضعیت" className="hide-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'relative min-h-[40px] shrink-0 snap-start rounded-full px-4 text-sm font-medium transition-colors',
                  active ? 'text-secondary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="orders-filter-pill"
                    className="absolute inset-0 rounded-full bg-secondary shadow-glow-secondary"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {orders.isLoading ? (
        <OrdersListSkeleton />
      ) : orders.isError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm">
          <p className="mb-3">دریافت سفارش‌ها ناموفق بود.</p>
          <Button variant="outline" size="sm" onClick={() => orders.refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            تلاش دوباره
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <PackageOpen className="h-12 w-12 text-secondary" aria-hidden="true" />
          <div>
            <p className="font-bold">{filter === 'all' ? 'هنوز سفارشی ثبت نکرده‌اید' : 'سفارشی با این وضعیت ندارید'}</p>
            <p className="mt-1 text-sm text-muted-foreground">محصولات حرفه‌ای نگهداری خودرو را ببینید.</p>
          </div>
          <Button size="lg" asChild>
            <Link href={ROUTES.PRODUCTS}>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              مشاهدهٔ محصولات
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {sorted.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
