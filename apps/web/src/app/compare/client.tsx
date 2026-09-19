'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Check, Layers, Minus, Plus, ShieldCheck, Star, Trash2, X } from 'lucide-react';
import {
  ROUTES,
  SERVICE_TYPE_LABELS,
  VEHICLE_SIZES,
  basePriceFor,
  formatToman,
  toPersianDigits,
} from '@autolounge/shared';
import type { Service } from '@autolounge/shared';
import { COMPARE_LIMIT, useCompare, useCompareStore } from '@/lib/store/compare-store';
import { useHydrated } from '@/lib/store/hydration';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/ui/premium-components';
import { showToast } from '@/components/ui/toaster';
import { cn, formatDuration } from '@/lib/utils';

export function CompareClient({ services }: { services: Service[] }) {
  const hydrated = useHydrated(useCompareStore);
  const { ids, has, toggle, remove, clear, isFull } = useCompare();
  const add = useCompareStore((s) => s.add);

  // A shared /compare?ids=a,b link should show that comparison, not whatever
  // the visitor happened to have picked before. Read from `location` rather
  // than `useSearchParams`, which would opt the whole page out of prerendering.
  React.useEffect(() => {
    if (!hydrated) return;
    const linked = new URLSearchParams(window.location.search).get('ids');
    if (!linked) return;
    const wanted = linked.split(',').map((id) => id.trim()).filter(Boolean);
    if (wanted.length === 0) return;
    clear();
    wanted.slice(0, COMPARE_LIMIT).forEach((id) => add(id));
  }, [hydrated, clear, add]);

  const selected = React.useMemo(
    () => ids.map((id) => services.find((s) => s.id === id)).filter((s): s is Service => Boolean(s)),
    [ids, services]
  );

  const onToggle = (service: Service) => {
    const wasPicked = has(service.id);
    const added = toggle(service.id);
    // Neither picked before nor added now means the list was already full.
    if (!wasPicked && !added) {
      showToast.error('حداکثر ۴ خدمت', 'برای مقایسهٔ خدمت دیگری، یکی از انتخاب‌ها را بردارید.');
      return;
    }
    showToast.success(added ? 'به مقایسه اضافه شد' : 'از مقایسه حذف شد', service.name);
  };

  return (
    <div className="container-custom py-8 lg:py-12">
      <SectionHeading
        eyebrow="راهنمای انتخاب"
        title="مقایسهٔ خدمات"
        subtitle="تا چهار خدمت را انتخاب کنید و قیمت، مدت اجرا، گارانتی و ویژگی‌هایشان را کنار هم ببینید."
        className="mb-8"
      />

      {/* Picker */}
      <section aria-labelledby="compare-picker" className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="compare-picker" className="text-base font-black text-foreground">
            انتخاب خدمات
          </h2>
          <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {toPersianDigits(ids.length)} از {toPersianDigits(COMPARE_LIMIT)}
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const picked = hydrated && has(service.id);
            const blocked = hydrated && !picked && isFull;
            return (
              <li key={service.id}>
                <button
                  type="button"
                  aria-pressed={picked}
                  disabled={blocked}
                  onClick={() => onToggle(service)}
                  className={cn(
                    'flex min-h-14 w-full items-center gap-3 rounded-2xl border p-2 pe-3 text-start transition-colors',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                    picked
                      ? 'border-secondary bg-secondary/10'
                      : blocked
                        ? 'cursor-not-allowed border-border/50 opacity-50'
                        : 'border-border bg-card hover:border-secondary/60'
                  )}
                >
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {service.images[0] && (
                      <Image src={service.images[0]} alt="" fill sizes="44px" className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">{service.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      از {formatToman(service.price)}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                      picked ? 'border-transparent bg-secondary text-primary' : 'border-border text-muted-foreground'
                    )}
                  >
                    {picked ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {!hydrated ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : selected.length === 0 ? (
        <EmptyCompare />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-end">
            <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={clear}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              پاک کردن همه
            </Button>
          </div>
          <CompareTable services={selected} onRemove={remove} />
        </>
      )}
    </div>
  );
}

function EmptyCompare() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary" aria-hidden="true">
        <Layers className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-lg font-black text-foreground">هنوز خدمتی انتخاب نکرده‌اید</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        از فهرست بالا دست‌کم دو خدمت را انتخاب کنید تا جدول مقایسه ساخته شود.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href={ROUTES.SERVICES}>دیدن همهٔ خدمات</Link>
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

const cellBase = 'border-border p-3 align-top text-sm';
const rowHead = 'sticky inset-s-0 z-10 bg-background text-start text-xs font-bold text-muted-foreground';

function CompareTable({ services, onRemove }: { services: Service[]; onRemove: (id: string) => void }) {
  // Union of every feature, so a blank cell means "this one doesn't include it"
  // rather than "we didn't list it".
  const allFeatures = React.useMemo(() => {
    const seen = new Set<string>();
    services.forEach((s) => s.features?.forEach((f) => seen.add(f)));
    return Array.from(seen);
  }, [services]);

  const cheapest = Math.min(...services.map((s) => s.price));
  const fastest = Math.min(...services.map((s) => s.duration));
  const longestWarranty = Math.max(...services.map((s) => s.warrantyMonths ?? 0));

  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse">
        <caption className="sr-only">مقایسهٔ قیمت، مدت اجرا، گارانتی و ویژگی‌های خدمات انتخاب‌شده</caption>
        <thead>
          <tr>
            <th scope="col" className={cn(cellBase, rowHead, 'border-b w-36')}>
              <span className="sr-only">ویژگی</span>
            </th>
            {services.map((s) => (
              <th key={s.id} scope="col" className={cn(cellBase, 'border-b border-s text-center')}>
                <div className="flex flex-col items-center gap-2">
                  <span className="relative h-16 w-full overflow-hidden rounded-xl bg-muted">
                    {s.images[0] && <Image src={s.images[0]} alt="" fill sizes="160px" className="object-cover" />}
                    <IconButton
                      label={`حذف ${s.name} از مقایسه`}
                      icon={<X />}
                      size="sm"
                      className="absolute inset-e-1 top-1 bg-background/80 backdrop-blur"
                      onClick={() => onRemove(s.id)}
                    />
                  </span>
                  <Link href={`${ROUTES.SERVICES}/${s.id}`} className="link-hover text-sm font-black text-foreground">
                    {s.name}
                  </Link>
                  {SERVICE_TYPE_LABELS[s.type] !== s.name && (
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {SERVICE_TYPE_LABELS[s.type] ?? s.type}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <Row label="شروع قیمت" head={rowHead}>
            {services.map((s) => (
              <Cell key={s.id} highlight={s.price === cheapest && services.length > 1}>
                <span className="font-black text-primary dark:text-secondary tabular-nums">{formatToman(s.price)}</span>
                {s.price === cheapest && services.length > 1 && <Winner label="کمترین قیمت" />}
              </Cell>
            ))}
          </Row>

          {VEHICLE_SIZES.map((size) => (
            <Row key={size.id} label={size.label} head={rowHead} hint={size.description}>
              {services.map((s) => (
                <Cell key={s.id}>
                  <span className="tabular-nums">{formatToman(basePriceFor(s, size.id))}</span>
                </Cell>
              ))}
            </Row>
          ))}

          <Row label="مدت اجرا" head={rowHead}>
            {services.map((s) => (
              <Cell key={s.id} highlight={s.duration === fastest && services.length > 1}>
                {formatDuration(s.duration)}
                {s.duration === fastest && services.length > 1 && <Winner label="سریع‌ترین" />}
              </Cell>
            ))}
          </Row>

          <Row label="گارانتی" head={rowHead}>
            {services.map((s) => (
              <Cell
                key={s.id}
                highlight={Boolean(s.warrantyMonths) && s.warrantyMonths === longestWarranty && services.length > 1}
              >
                {s.warrantyMonths ? (
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                    {toPersianDigits(s.warrantyMonths)} ماه
                  </span>
                ) : (
                  <Absent />
                )}
              </Cell>
            ))}
          </Row>

          <Row label="امتیاز کاربران" head={rowHead}>
            {services.map((s) => (
              <Cell key={s.id}>
                {s.rating ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-secondary text-secondary" aria-hidden="true" />
                    <span className="tabular-nums">{toPersianDigits(s.rating)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      ({toPersianDigits(s.reviewCount ?? 0)})
                    </span>
                  </span>
                ) : (
                  <Absent />
                )}
              </Cell>
            ))}
          </Row>

          <Row label="افزودنی‌ها" head={rowHead}>
            {services.map((s) => (
              <Cell key={s.id}>
                {s.addons?.length ? `${toPersianDigits(s.addons.length)} گزینه` : <Absent />}
              </Cell>
            ))}
          </Row>

          <tr>
            <th
              scope="colgroup"
              colSpan={services.length + 1}
              className="border-y border-border bg-muted/50 p-3 text-start text-xs font-black text-foreground"
            >
              ویژگی‌ها
            </th>
          </tr>

          {allFeatures.map((feature) => (
            <Row key={feature} label={feature} head={rowHead}>
              {services.map((s) => (
                <Cell key={s.id}>
                  {/* The icon is decoration; the word is what a screen reader reads. */}
                  {s.features?.includes(feature) ? (
                    <>
                      <Check className="h-5 w-5 text-success" aria-hidden="true" />
                      <span className="sr-only">دارد</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
                      <span className="sr-only">ندارد</span>
                    </>
                  )}
                </Cell>
              ))}
            </Row>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td className={cn(cellBase, rowHead, 'border-t')} />
            {services.map((s) => (
              <td key={s.id} className={cn(cellBase, 'border-s border-t text-center')}>
                <Button asChild size="sm" className="w-full gap-1.5">
                  <Link href={`${ROUTES.BOOKING}?service=${s.id}`}>
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    رزرو
                  </Link>
                </Button>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Row({
  label,
  hint,
  head,
  children,
}: {
  label: string;
  hint?: string;
  head: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-t border-border">
      <th scope="row" className={cn(cellBase, head)}>
        <span className="block font-bold text-foreground">{label}</span>
        {hint && <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">{hint}</span>}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <td className={cn(cellBase, 'border-s text-center', highlight && 'bg-success/5')}>
      <div className="flex flex-col items-center gap-1">{children}</div>
    </td>
  );
}

function Winner({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{label}</span>
  );
}

function Absent() {
  return <span className="text-muted-foreground">—</span>;
}
