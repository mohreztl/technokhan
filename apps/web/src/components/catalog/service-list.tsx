'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCcw, Wrench } from 'lucide-react';
import {
  ROUTES,
  SERVICE_TYPE_LABELS,
  toPersianDigits,
  type PagedList,
  type Service,
  type ServiceType,
} from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useServices } from '@/lib/hooks/use-services';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/molecules/service-card';
import { ServiceCardSkeleton } from '@/components/molecules/loading-skeletons';
import { SERVICE_TYPE_ICONS } from '@/components/creative/icon-map';
import { AVAILABLE_SERVICE_TYPES, buildServiceQuery, parseServiceType } from './service-query';

export interface ServiceListProps {
  initialType?: string;
  initialData: PagedList<Service>;
}

/** Type filter chips (URL `?type=`) + grid of service cards. */
export function ServiceList({ initialType, initialData }: ServiceListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const type = parseServiceType(searchParams.get('type'));
  const query = React.useMemo(() => buildServiceQuery(type), [type]);
  const seed = type === initialType ? initialData : undefined;

  const { services, isFetching, isPlaceholderData, isError, refetch } = useServices(query, { initialData: seed });

  const select = (next?: string) => {
    router.replace(next ? `${pathname}?type=${next}` : pathname, { scroll: false });
  };

  const chips: { id?: string; label: string }[] = [
    { label: 'همه' },
    ...AVAILABLE_SERVICE_TYPES.map((id) => ({ id, label: SERVICE_TYPE_LABELS[id] ?? id })),
  ];

  const showEmpty = !isFetching && !isError && services.length === 0;
  const showError = isError && services.length === 0;

  return (
    <section id="services-list" className="scroll-mt-24 py-10 lg:py-16" aria-labelledby="services-list-title">
      <div className="container-custom">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-secondary">فهرست خدمات</p>
            <h2 id="services-list-title" className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
              {type ? `خدمات ${SERVICE_TYPE_LABELS[type] ?? type}` : 'همهٔ خدمات'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {toPersianDigits(services.length)} خدمت
          </p>
        </div>

        {/* Type chips */}
        <div
          className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0"
          role="group"
          aria-label="فیلتر نوع خدمت"
        >
          {chips.map((chip) => {
            const active = (chip.id ?? undefined) === type;
            const Icon = chip.id ? SERVICE_TYPE_ICONS[chip.id as ServiceType] : Wrench;
            return (
              <button
                key={chip.id ?? 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => select(chip.id)}
                className={cn(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-glow-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
                )}
              >
                {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <AnimatePresence>
            {isFetching && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-x-0 -top-3 z-10 h-0.5 overflow-hidden rounded-full bg-secondary/20"
                role="progressbar"
                aria-label="در حال به‌روزرسانی"
              >
                <span className="block h-full w-1/3 animate-pulse bg-secondary/70" />
              </motion.div>
            )}
          </AnimatePresence>

          {showError ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="font-bold text-foreground">خطا در دریافت خدمات</p>
              <Button type="button" variant="outline" onClick={() => refetch()} className="mt-4 min-h-11 gap-2">
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                تلاش مجدد
              </Button>
            </div>
          ) : showEmpty ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="font-bold text-foreground">خدمتی در این دسته ثبت نشده است</p>
              <Button type="button" variant="primary" onClick={() => select(undefined)} className="mt-4 min-h-11">
                نمایش همهٔ خدمات
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                'grid grid-cols-1 gap-4 transition-opacity duration-300 sm:gap-6 md:grid-cols-2 xl:grid-cols-3',
                isPlaceholderData && 'pointer-events-none opacity-60'
              )}
              aria-busy={isFetching}
            >
              {services.length === 0 && isFetching ? (
                <ServiceCardSkeleton count={6} />
              ) : (
                services.map((service) => <ServiceCard key={service.id} service={service} className="h-full" />)
              )}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          خدمت مورد نظرتان را پیدا نکردید؟{' '}
          <Link
            href={`${ROUTES.CONTACT}?subject=${encodeURIComponent('درخواست خدمت سفارشی')}`}
            className="inline-flex min-h-11 items-center font-bold text-primary underline-offset-4 hover:underline"
          >
            درخواست خدمت سفارشی
          </Link>
        </p>
      </div>
    </section>
  );
}
