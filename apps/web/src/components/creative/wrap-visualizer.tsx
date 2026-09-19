'use client';

import * as React from 'react';
import { useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import type { WrapColor, WrapFinish } from '@autolounge/shared';
import { ROUTES, formatToman, toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { CarSilhouette } from './car-silhouette';

export const WRAP_FINISH_LABELS: Record<WrapFinish, string> = {
  gloss: 'براق',
  satin: 'ساتن',
  matte: 'مات',
  chrome: 'کروم',
};

const FINISH_ORDER: WrapFinish[] = ['gloss', 'satin', 'matte', 'chrome'];

/** Used when the catalog has no colours yet so the stage still renders. */
export const FALLBACK_WRAP_COLOR: WrapColor = {
  id: 'navy',
  name: 'سرمه‌ای',
  nameEn: 'Navy',
  hex: '#001F3F',
  finishes: ['gloss', 'satin', 'matte'],
  popular: true,
  priceFactor: 1,
};

export function buildWrapBookingHref(
  colorId: string,
  finish: WrapFinish,
  serviceId = 'car-wrap'
): string {
  const params = new URLSearchParams({ service: serviceId, color: colorId, finish });
  return `${ROUTES.BOOKING}?${params.toString()}`;
}

/** Black or white — whichever stays readable on top of `hex`. */
export function readableOn(hex: string): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return '#ffffff';
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#111111' : '#ffffff';
}

export interface WrapVisualizerProps {
  colors: WrapColor[];
  initialColorId?: string;
  initialFinish?: WrapFinish;
  /** base wrap price (Toman, medium vehicle); the estimate is `basePrice × priceFactor` */
  basePrice?: number;
  /** service id used in the booking link (default `car-wrap`) */
  serviceId?: string;
  onSelect?: (color: WrapColor, finish: WrapFinish) => void;
  className?: string;
}

export function WrapVisualizer({
  colors,
  initialColorId,
  initialFinish = 'gloss',
  basePrice,
  serviceId = 'car-wrap',
  onSelect,
  className,
}: WrapVisualizerProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const stageInView = useInView(stageRef, { amount: 0.3 });

  const sorted = useMemo(
    () => [...colors].sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular))),
    [colors]
  );
  const hasColors = sorted.length > 0;

  const [colorId, setColorId] = useState<string>(initialColorId ?? sorted[0]?.id ?? '');
  const [finish, setFinish] = useState<WrapFinish>(initialFinish);

  const color = sorted.find((c) => c.id === colorId) ?? sorted[0] ?? FALLBACK_WRAP_COLOR;
  const available = useMemo(() => {
    const list = FINISH_ORDER.filter((f) => color.finishes.includes(f));
    return list.length ? list : (['gloss'] as WrapFinish[]);
  }, [color]);
  const activeFinish: WrapFinish = available.includes(finish) ? finish : available[0];

  const factor = color.priceFactor ?? 1;
  const estimate =
    basePrice != null ? Math.round((basePrice * factor) / 10_000) * 10_000 : null;
  const href = buildWrapBookingHref(color.id, activeFinish, serviceId);

  const selectColor = (next: WrapColor) => {
    setColorId(next.id);
    const nextAvailable = FINISH_ORDER.filter((f) => next.finishes.includes(f));
    const nextFinish = nextAvailable.includes(activeFinish)
      ? activeFinish
      : (nextAvailable[0] ?? 'gloss');
    onSelect?.(next, nextFinish);
  };

  const selectFinish = (next: WrapFinish) => {
    setFinish(next);
    onSelect?.(color, next);
  };

  // Roving keyboard selection inside the swatch radiogroup (left = forward in RTL).
  const onSwatchKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasColors) return;
    const idx = sorted.findIndex((c) => c.id === color.id);
    let next = idx;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = (idx + 1) % sorted.length;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp')
      next = (idx - 1 + sorted.length) % sorted.length;
    else return;
    e.preventDefault();
    const target = sorted[next];
    selectColor(target);
    groupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-swatch-id="${CSS.escape(target.id)}"]`)
      ?.focus();
  };

  return (
    <section
      className={cn('grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-10', className)}
      aria-label="شبیه‌ساز رنگ رپ خودرو"
    >
      {/* Stage */}
      <div
        ref={stageRef}
        className="glass-effect relative overflow-hidden rounded-3xl p-4 sm:p-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--secondary)/0.18),transparent_65%)]"
        />
        <CarSilhouette
          color={color.hex}
          finish={activeFinish}
          shine={stageInView && !reduced}
          animated={!reduced}
          title={`خودرو با رنگ ${color.name} و جلوه ${WRAP_FINISH_LABELS[activeFinish]}`}
          className="relative"
        />
        <div className="relative mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">{color.name}</span>
          <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs text-foreground">
            {WRAP_FINISH_LABELS[activeFinish]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">انتخاب رنگ</h3>
          {hasColors ? (
            <div
              ref={groupRef}
              role="radiogroup"
              aria-label="رنگ رپ"
              onKeyDown={onSwatchKeyDown}
              className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-wrap lg:snap-none lg:overflow-visible lg:px-0"
            >
              {sorted.map((c) => {
                const active = c.id === color.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={c.name}
                    data-swatch-id={c.id}
                    tabIndex={active ? 0 : -1}
                    onClick={() => selectColor(c)}
                    className="group flex w-16 shrink-0 snap-center flex-col items-center gap-1.5 rounded-xl py-1 outline-hidden"
                  >
                    <span
                      className={cn(
                        'relative flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all duration-300',
                        active
                          ? 'scale-110 shadow-glow-secondary ring-secondary'
                          : 'ring-border/40 group-hover:ring-border group-focus-visible:ring-secondary'
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {active && (
                        <Check className="h-5 w-5" strokeWidth={3} style={{ color: readableOn(c.hex) }} />
                      )}
                      {c.popular && !active && (
                        <span
                          aria-hidden="true"
                          className="absolute -inset-e-0.5 -top-0.5 h-3 w-3 rounded-full bg-secondary ring-2 ring-background"
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        'max-w-full truncate text-[11px] leading-tight',
                        active ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              رنگ‌های رپ به‌زودی اضافه می‌شوند.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">نوع جلوه</h3>
          <div
            role="radiogroup"
            aria-label="نوع جلوه"
            className="inline-flex max-w-full rounded-full bg-muted p-1"
          >
            {available.map((f) => {
              const active = f === activeFinish;
              return (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => selectFinish(f)}
                  className="relative h-11 min-w-[68px] rounded-full px-4 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  {active && (
                    <motion.span
                      layoutId={reduced ? undefined : `${uid}-finish-pill`}
                      className="absolute inset-0 rounded-full bg-secondary shadow-glow-secondary"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={cn(
                      'relative',
                      active ? 'font-semibold text-secondary-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {WRAP_FINISH_LABELS[f]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {estimate != null && (
          <div className="rounded-2xl border border-border/50 bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">تخمین هزینه (خودروی متوسط)</div>
            <div className="mt-1 text-xl font-bold text-secondary">{formatToman(estimate)}</div>
            {factor !== 1 && (
              <div className="mt-1 text-xs text-muted-foreground">
                ضریب رنگ: {toPersianDigits(factor)}×
              </div>
            )}
          </div>
        )}

        <Button asChild variant="secondary" size="lg" className="w-full lg:w-auto">
          <Link href={href}>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            رزرو رپ با این رنگ
          </Link>
        </Button>
      </div>
    </section>
  );
}
