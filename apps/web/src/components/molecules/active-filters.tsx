'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { formatTomanCompact, type ProductListQuery } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  PRODUCT_SORT_OPTIONS,
  sortIdOf,
  type ProductFilterKey,
} from '@/components/catalog/product-query';

export interface ActiveFiltersProps {
  filters: ProductListQuery;
  categoryLabels: Record<string, string>;
  priceBounds: { min: number; max: number };
  onRemove: (key: ProductFilterKey) => void;
  onClearAll: () => void;
  className?: string;
}

interface Chip {
  key: ProductFilterKey;
  label: string;
}

export function activeFilterChips(
  filters: ProductListQuery,
  categoryLabels: Record<string, string>,
  priceBounds: { min: number; max: number }
): Chip[] {
  const chips: Chip[] = [];
  if (filters.search) chips.push({ key: 'search', label: `جستجو: ${filters.search}` });
  if (filters.category) {
    chips.push({ key: 'category', label: categoryLabels[filters.category] ?? filters.category });
  }
  if (filters.brand) chips.push({ key: 'brand', label: filters.brand });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const lo = formatTomanCompact(filters.minPrice ?? priceBounds.min);
    const hi = formatTomanCompact(filters.maxPrice ?? priceBounds.max);
    chips.push({ key: 'minPrice', label: `${lo} تا ${hi}` });
  }
  if (filters.inStock) chips.push({ key: 'inStock', label: 'فقط موجود' });
  const sortId = sortIdOf(filters);
  if (sortId !== 'newest') {
    const option = PRODUCT_SORT_OPTIONS.find((o) => o.id === sortId);
    if (option) chips.push({ key: 'sort', label: `مرتب‌سازی: ${option.label}` });
  }
  return chips;
}

/** Removable chips for every filter in effect, with a «پاک کردن همه» action. */
export function ActiveFilters({
  filters,
  categoryLabels,
  priceBounds,
  onRemove,
  onClearAll,
  className,
}: ActiveFiltersProps) {
  const chips = activeFilterChips(filters, categoryLabels, priceBounds);
  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} aria-label="فیلترهای فعال">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            onClick={() => onRemove(chip.key)}
            aria-label={`حذف فیلتر ${chip.label}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 ps-3 pe-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <span dir="auto">{chip.label}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
              <X className="h-3 w-3" aria-hidden="true" />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
      <Button type="button" variant="link" size="sm" onClick={onClearAll} className="min-h-10 px-1 text-xs">
        پاک کردن همه
      </Button>
    </div>
  );
}
