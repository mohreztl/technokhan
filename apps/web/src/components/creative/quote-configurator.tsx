'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Car, Check, Clock, Plus } from 'lucide-react';
import type { QuoteInput, QuoteResult, Service, VehicleSize } from '@autolounge/shared';
import {
  ROUTES,
  VEHICLE_SIZES,
  computeQuote,
  formatToman,
  formatTomanCompact,
  toPersianDigits,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RollingNumber } from './rolling-number';
import { SERVICE_TYPE_ICONS } from './icon-map';

/** `/booking?service=<id>&size=<size>&addons=<a,b>` */
export function buildBookingHref(input: QuoteInput): string {
  const params = new URLSearchParams({ service: input.serviceId, size: input.size });
  if (input.addonIds.length) params.set('addons', input.addonIds.join(','));
  return `${ROUTES.BOOKING}?${params.toString()}`;
}

/** 45 -> «حدود ۴۵ دقیقه», 150 -> «حدود ۲٫۵ ساعت» */
export function formatDurationFa(minutes: number): string {
  if (minutes < 60) return `حدود ${toPersianDigits(minutes)} دقیقه`;
  const half = Math.round((minutes / 60) * 2) / 2;
  const text = Number.isInteger(half) ? String(half) : half.toFixed(1).replace('.', '٫');
  return `حدود ${toPersianDigits(text)} ساعت`;
}

const SIZE_ICON: Record<VehicleSize, string> = {
  small: 'h-5 w-5',
  medium: 'h-7 w-7',
  large: 'h-9 w-9',
};

export interface QuoteConfiguratorProps {
  services: Service[];
  initialServiceId?: string;
  initialSize?: VehicleSize;
  initialAddonIds?: string[];
  /** tighter spacing, hides helper copy (e.g. inside a service page sidebar) */
  compact?: boolean;
  onChange?: (input: QuoteInput, quote: QuoteResult) => void;
  className?: string;
}

function StepHeading({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
        {toPersianDigits(n)}
      </span>
      <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function QuoteConfigurator({
  services,
  initialServiceId,
  initialSize = 'medium',
  initialAddonIds = [],
  compact = false,
  onChange,
  className,
}: QuoteConfiguratorProps) {
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? '');
  const [size, setSize] = useState<VehicleSize>(initialSize);
  const [addonIds, setAddonIds] = useState<string[]>(initialAddonIds);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? services[0],
    [services, serviceId]
  );
  const currentServiceId = service?.id ?? '';

  // Only keep add-ons that exist on the selected service.
  const addonKey = useMemo(
    () => addonIds.filter((id) => service?.addons?.some((a) => a.id === id)).join(','),
    [addonIds, service]
  );

  const input = useMemo<QuoteInput>(
    () => ({ serviceId: currentServiceId, size, addonIds: addonKey ? addonKey.split(',') : [] }),
    [currentServiceId, size, addonKey]
  );

  const quote = useMemo<QuoteResult | null>(
    () => (service ? computeQuote(service, size, input.addonIds) : null),
    [service, size, input.addonIds]
  );

  // Notify the parent only when the configuration actually changes.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const lastSignature = useRef('');
  useEffect(() => {
    if (!service || !quote) return;
    const signature = `${input.serviceId}|${input.size}|${addonKey}|${quote.total}|${quote.durationMinutes}`;
    if (signature === lastSignature.current) return;
    lastSignature.current = signature;
    onChangeRef.current?.(input, quote);
  }, [service, quote, input, addonKey]);

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (services.length === 0 || !service || !quote) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed border-border/60 p-8 text-center',
          className
        )}
      >
        <Car className="mx-auto mb-3 h-8 w-8 text-secondary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          هنوز خدمتی برای پیکربندی ثبت نشده است.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={ROUTES.SERVICES}>مشاهده خدمات</Link>
        </Button>
      </div>
    );
  }

  const addons = service.addons ?? [];
  const sizeLabel = VEHICLE_SIZES.find((v) => v.id === size)?.label ?? '';
  const href = buildBookingHref(input);
  const showServiceStep = !compact || services.length > 1;

  return (
    <div
      className={cn(
        'lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8',
        className
      )}
    >
      <div className={cn('space-y-6', compact && 'space-y-4')}>
        {showServiceStep && (
          <section aria-label="انتخاب خدمت">
            <StepHeading n={1} title="خدمت مورد نظر" />
            <div
              role="radiogroup"
              aria-label="خدمت"
              className="hide-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
            >
              {services.map((s) => {
                const active = s.id === service.id;
                const Icon = SERVICE_TYPE_ICONS[s.type] ?? Car;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setServiceId(s.id)}
                    className={cn(
                      'flex min-w-[150px] max-w-[190px] shrink-0 snap-start flex-col items-start gap-2 rounded-2xl border p-3 text-start transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary',
                      active
                        ? 'border-secondary bg-secondary/10 shadow-glow-secondary'
                        : 'border-border/50 bg-muted/30 hover:border-border'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                        active ? 'bg-secondary text-secondary-foreground' : 'bg-background text-secondary'
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="line-clamp-1 text-sm font-semibold text-foreground">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      از {formatTomanCompact(s.price)} تومان
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section aria-label="اندازه خودرو">
          <StepHeading n={showServiceStep ? 2 : 1} title="اندازه خودرو" />
          <div role="radiogroup" aria-label="اندازه خودرو" className="grid grid-cols-3 gap-2 sm:gap-3">
            {VEHICLE_SIZES.map((v) => {
              const active = v.id === size;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSize(v.id)}
                  className={cn(
                    'flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary sm:p-3',
                    active
                      ? 'border-secondary bg-secondary/10 shadow-glow-secondary'
                      : 'border-border/50 bg-muted/30 hover:border-border'
                  )}
                >
                  <span className="flex h-9 items-end">
                    <Car
                      className={cn(
                        'transition-transform duration-300',
                        active ? 'text-secondary' : 'text-muted-foreground',
                        SIZE_ICON[v.id]
                      )}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-xs font-semibold text-foreground sm:text-sm">{v.label}</span>
                  {!compact && (
                    <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground sm:text-xs">
                      {v.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="افزودنی‌ها">
          <StepHeading
            n={showServiceStep ? 3 : 2}
            title="افزودنی‌ها"
            hint={addons.length ? 'اختیاری' : undefined}
          />
          {addons.length === 0 ? (
            <p className="text-sm text-muted-foreground">این خدمت افزودنی ندارد.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {addons.map((a) => {
                const on = input.addonIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    title={a.description}
                    onClick={() => toggleAddon(a.id)}
                    className={cn(
                      'inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary',
                      on
                        ? 'border-secondary bg-secondary text-secondary-foreground shadow-glow-secondary'
                        : 'border-border/60 bg-muted/30 text-foreground hover:border-secondary/60'
                    )}
                  >
                    {on ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>{a.name}</span>
                    <span className={cn('text-xs', on ? 'text-secondary-foreground/80' : 'text-muted-foreground')}>
                      + {formatTomanCompact(a.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Summary */}
      <aside
        aria-label="خلاصه قیمت"
        className={cn('glass-effect-strong mt-6 rounded-2xl p-4 sm:p-5 lg:sticky lg:top-24 lg:mt-0')}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">قیمت پایه ({sizeLabel})</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatToman(quote.base)}</dd>
          </div>
          {quote.addons.map((a) => (
            <div key={a.id} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{a.name}</dt>
              <dd className="tabular-nums text-foreground">+ {formatToman(a.price)}</dd>
            </div>
          ))}
        </dl>
        <div className="my-3 border-t border-border/50" />
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">جمع کل</div>
            <div className="text-2xl font-bold text-secondary">
              <RollingNumber value={quote.total} />{' '}
              <span className="text-sm font-medium text-foreground">تومان</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatDurationFa(quote.durationMinutes)}
          </div>
        </div>
        <Button asChild variant="secondary" size="lg" className="mt-4 w-full">
          <Link href={href}>
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            رزرو همین پیکربندی
          </Link>
        </Button>
        {!compact && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            قیمت نهایی پس از بازدید کارشناس تأیید می‌شود.
          </p>
        )}
      </aside>
    </div>
  );
}
