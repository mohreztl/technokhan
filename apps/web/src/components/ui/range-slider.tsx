'use client';

import * as React from 'react';
import { formatNumberFa } from '@technokhan/shared';
import { normalizeRange } from '@/lib/range';
import { cn } from '@/lib/utils';

export interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  step?: number;
  minGap?: number;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

/** Two native range inputs for an accessible, keyboard-friendly price interval. */
export function RangeSlider({ min, max, value, onValueChange, step = 1, minGap = 0, label = 'بازه قیمت', formatValue = formatNumberFa, className }: RangeSliderProps) {
  const id = React.useId();
  const normalized = normalizeRange(value, min, max, minGap);
  const update = (next: [number, number]) => onValueChange(normalizeRange(next, min, max, minGap));

  return (
    <fieldset className={cn('space-y-3', className)}>
      <legend className="mb-2 text-sm font-semibold text-foreground">{label}</legend>
      <output htmlFor={`${id}-min ${id}-max`} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-xs font-semibold tabular-nums text-foreground">
        <span>{formatValue(normalized[0])}</span>
        <span aria-hidden="true">تا</span>
        <span>{formatValue(normalized[1])}</span>
      </output>
      <div className="grid gap-2">
        <label htmlFor={`${id}-min`} className="sr-only">حداقل {label}</label>
        <input id={`${id}-min`} type="range" min={min} max={max} step={step} value={normalized[0]} onChange={(event) => update([Number(event.target.value), normalized[1]])} className="h-11 w-full cursor-pointer" />
        <label htmlFor={`${id}-max`} className="sr-only">حداکثر {label}</label>
        <input id={`${id}-max`} type="range" min={min} max={max} step={step} value={normalized[1]} onChange={(event) => update([normalized[0], Number(event.target.value)])} className="h-11 w-full cursor-pointer" />
      </div>
    </fieldset>
  );
}
