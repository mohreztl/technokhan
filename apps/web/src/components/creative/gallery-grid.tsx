'use client';

import { useId, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeftRight, LayoutGrid } from 'lucide-react';
import type { GalleryItem } from '@autolounge/shared';
import { SERVICE_TYPE_LABELS, ServiceType, toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { SERVICE_TYPE_ICONS } from './icon-map';
import type { LightboxProps } from './lightbox';

// Lazy: embla + the lightbox only load once someone opens an item.
const Lightbox = dynamic<LightboxProps>(() => import('./lightbox').then((m) => m.Lightbox), {
  ssr: false,
});

export type GalleryFilter = ServiceType | 'all';

export interface GalleryGridProps {
  items: GalleryItem[];
  /** show service-type filter chips (default true) */
  filters?: boolean;
  /** open the built-in lightbox on tap (default true) */
  lightbox?: boolean;
  /** called on tap with the item and its index within the current filter */
  onOpen?: (item: GalleryItem, index: number) => void;
  initialFilter?: GalleryFilter;
  className?: string;
}

const TYPE_ORDER = Object.values(ServiceType) as ServiceType[];

// Gallery items carry no dimensions, so vary the crop deterministically for a masonry rhythm.
const ASPECTS = ['aspect-[4/3]', 'aspect-square', 'aspect-[5/4]', 'aspect-[3/4]'];
function aspectFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ASPECTS[h % ASPECTS.length];
}

function GalleryCard({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.title} — مشاهده قبل و بعد`}
      className="group relative block w-full overflow-hidden rounded-2xl bg-muted text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className={cn('relative w-full', aspectFor(item.id))}>
        <Image
          src={item.cover ?? item.after}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-105"
        />
      </div>

      <span className="glass-effect absolute start-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-foreground">
        <ChevronsLeftRight className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
        قبل/بعد
      </span>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-12 text-white opacity-100 transition-opacity duration-300 group-focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
        <h3 className="line-clamp-1 text-sm font-bold">{item.title}</h3>
        {item.vehicle && <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{item.vehicle}</p>}
        {item.tags.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((t) => (
              <li key={t} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                #{t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  );
}

export function GalleryGrid({
  items,
  filters = true,
  lightbox = true,
  onOpen,
  initialFilter = 'all',
  className,
}: GalleryGridProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<GalleryFilter>(initialFilter);
  const [lb, setLb] = useState({ open: false, index: 0, ever: false });

  const chips = useMemo(() => {
    const counts = new Map<ServiceType, number>();
    for (const it of items) counts.set(it.serviceType, (counts.get(it.serviceType) ?? 0) + 1);
    const typed = TYPE_ORDER.filter((t) => counts.has(t)).map((t) => ({
      value: t as GalleryFilter,
      label: SERVICE_TYPE_LABELS[t] ?? t,
      count: counts.get(t) ?? 0,
      Icon: SERVICE_TYPE_ICONS[t] ?? LayoutGrid,
    }));
    return [{ value: 'all' as GalleryFilter, label: 'همه', count: items.length, Icon: LayoutGrid }, ...typed];
  }, [items]);

  const active: GalleryFilter = chips.some((c) => c.value === filter) ? filter : 'all';
  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((it) => it.serviceType === active)),
    [items, active]
  );

  const open = (item: GalleryItem, index: number) => {
    onOpen?.(item, index);
    if (lightbox) setLb({ open: true, index, ever: true });
  };

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed border-border/60 p-10 text-center text-muted-foreground',
          className
        )}
      >
        <LayoutGrid className="mx-auto mb-3 h-8 w-8 text-secondary" aria-hidden="true" />
        <p className="text-sm">هنوز نمونه‌کاری ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      {filters && chips.length > 2 && (
        <div
          role="radiogroup"
          aria-label="فیلتر نمونه‌کارها"
          className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {chips.map(({ value, label, count, Icon }) => {
            const on = value === active;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setFilter(value)}
                className={cn(
                  'relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                  on
                    ? 'border-transparent text-secondary-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                )}
              >
                {on && (
                  <motion.span
                    layoutId={reduced ? undefined : `${uid}-chip`}
                    className="absolute inset-0 rounded-full bg-secondary shadow-glow-secondary"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative h-4 w-4" aria-hidden="true" />
                <span className="relative">{label}</span>
                <span className="relative text-xs opacity-70">{toPersianDigits(count)}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((item, i) => (
            <motion.article
              key={item.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="mb-4 break-inside-avoid"
            >
              <GalleryCard item={item} onOpen={() => open(item, i)} />
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {lightbox && lb.ever && (
        <Lightbox
          items={filtered}
          index={lb.index}
          open={lb.open}
          onOpenChange={(o) => setLb((s) => ({ ...s, open: o }))}
        />
      )}
    </div>
  );
}
