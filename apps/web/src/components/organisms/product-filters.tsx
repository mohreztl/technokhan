'use client';

import * as React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { formatTomanCompact, toPersianDigits, type ProductListQuery } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  PRODUCT_SORT_OPTIONS,
  applySort,
  countActiveFilters,
  sortIdOf,
  type ProductSortId,
} from '@/components/catalog/product-query';

export interface PriceBounds {
  min: number;
  max: number;
}

export interface ProductFiltersPanelProps {
  /** Current query (URL is the source of truth). */
  value: ProductListQuery;
  /** Called with the next query whenever a control changes. */
  onChange: (next: ProductListQuery) => void;
  categories: Record<string, string>;
  brands: string[];
  priceBounds: PriceBounds;
  /** Show the sort group inside the panel (desktop sidebar). */
  showSort?: boolean;
  className?: string;
}

/** Collapsible group used inside the panel. */
export function FilterSection({
  title,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <div className="border-b border-border/70 py-2 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex min-h-11 w-full items-center justify-between gap-2 text-start text-sm font-bold text-foreground"
      >
        <span className="flex items-center gap-2">
          {title}
          {count ? (
            <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[11px] font-bold text-foreground">
              {toPersianDigits(count)}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div id={id} className="pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center rounded-xl border px-3.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/**
 * Filter controls for the products list. Stateless: renders `value` and
 * reports the next query through `onChange` (page is reset by the caller).
 */
export function ProductFiltersPanel({
  value,
  onChange,
  categories,
  brands,
  priceBounds,
  showSort = false,
  className,
}: ProductFiltersPanelProps) {
  const step = Math.max(10_000, roundTo((priceBounds.max - priceBounds.min) / 40, 10_000));
  const min = value.minPrice ?? priceBounds.min;
  const max = value.maxPrice ?? priceBounds.max;
  const active = countActiveFilters(value);

  const patch = (changes: Partial<ProductListQuery>, clear: (keyof ProductListQuery)[] = []) => {
    const next: ProductListQuery = { ...value, ...changes };
    delete next.page;
    for (const key of clear) delete next[key];
    onChange(next);
  };

  const setPrice = (nextMin: number, nextMax: number) => {
    const lo = Math.max(priceBounds.min, Math.min(nextMin, nextMax));
    const hi = Math.min(priceBounds.max, Math.max(nextMax, nextMin));
    const changes: Partial<ProductListQuery> = {};
    const clear: (keyof ProductListQuery)[] = [];
    if (lo > priceBounds.min) changes.minPrice = lo;
    else clear.push('minPrice');
    if (hi < priceBounds.max) changes.maxPrice = hi;
    else clear.push('maxPrice');
    patch(changes, clear);
  };

  const reset = () => {
    const next: ProductListQuery = { limit: value.limit };
    if (value.search) next.search = value.search;
    if (value.sortBy) next.sortBy = value.sortBy;
    if (value.sortOrder) next.sortOrder = value.sortOrder;
    onChange(next);
  };

  return (
    <div className={cn('flex flex-col', className)} role="group" aria-label="فیلتر محصولات">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-black text-foreground">
          فیلترها
          {active > 0 && (
            <span className="ms-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              {toPersianDigits(active)}
            </span>
          )}
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={active === 0} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          پاک کردن
        </Button>
      </div>

      <FilterSection title="دسته‌بندی" count={value.category ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          <ChoiceChip active={!value.category} onClick={() => patch({}, ['category'])}>
            همه
          </ChoiceChip>
          {Object.entries(categories).map(([key, label]) => (
            <ChoiceChip
              key={key}
              active={value.category === key}
              onClick={() => (value.category === key ? patch({}, ['category']) : patch({ category: key }))}
            >
              {label}
            </ChoiceChip>
          ))}
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="برند" count={value.brand ? 1 : 0}>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <ChoiceChip
                key={brand}
                active={value.brand === brand}
                onClick={() => (value.brand === brand ? patch({}, ['brand']) : patch({ brand }))}
              >
                <span dir="ltr">{brand}</span>
              </ChoiceChip>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="محدودهٔ قیمت" count={value.minPrice !== undefined || value.maxPrice !== undefined ? 1 : 0}>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold tabular-nums">
            <span>{formatTomanCompact(min)}</span>
            <span className="text-muted-foreground">تا</span>
            <span>{formatTomanCompact(max)}</span>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">حداقل</span>
            <input
              type="range"
              dir="ltr"
              min={priceBounds.min}
              max={priceBounds.max}
              step={step}
              value={min}
              onChange={(e) => setPrice(Number(e.target.value), max)}
              aria-label="حداقل قیمت"
              aria-valuetext={formatTomanCompact(min)}
              className="h-11 w-full cursor-pointer accent-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">حداکثر</span>
            <input
              type="range"
              dir="ltr"
              min={priceBounds.min}
              max={priceBounds.max}
              step={step}
              value={max}
              onChange={(e) => setPrice(min, Number(e.target.value))}
              aria-label="حداکثر قیمت"
              aria-valuetext={formatTomanCompact(max)}
              className="h-11 w-full cursor-pointer accent-primary"
            />
          </label>
        </div>
      </FilterSection>

      <FilterSection title="موجودی" count={value.inStock ? 1 : 0}>
        <Checkbox
          label="فقط کالاهای موجود"
          checked={!!value.inStock}
          onChange={(e) => (e.target.checked ? patch({ inStock: true }) : patch({}, ['inStock']))}
        />
      </FilterSection>

      {showSort && (
        <FilterSection title="مرتب‌سازی">
          <SortOptions value={sortIdOf(value)} onChange={(id) => onChange(applySort(value, id))} />
        </FilterSection>
      )}
    </div>
  );
}

/** Radio-style sort list shared by the sidebar and the mobile sort sheet. */
export function SortOptions({
  value,
  onChange,
  className,
}: {
  value: ProductSortId;
  onChange: (id: ProductSortId) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)} role="radiogroup" aria-label="مرتب‌سازی">
      {PRODUCT_SORT_OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-medium transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
            )}
          >
            {option.label}
            <span
              aria-hidden="true"
              className={cn(
                'h-4 w-4 rounded-full border-2 transition-colors',
                active ? 'border-primary bg-primary shadow-[inset_0_0_0_3px_hsl(var(--background))]' : 'border-border'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
