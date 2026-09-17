'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** ± stepper with 44px targets. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  label = 'تعداد',
  className,
}: QuantityStepperProps) {
  const set = (next: number) => onChange(Math.max(min, Math.min(max, next)));
  const btn =
    'flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div
      className={cn(
        'inline-flex h-12 items-center overflow-hidden rounded-xl border border-border bg-card',
        disabled && 'opacity-60',
        className
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={btn}
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        aria-label="افزایش تعداد"
      >
        <Plus className="h-4 w-4" />
      </button>
      <output className="min-w-[3rem] text-center text-base font-bold tabular-nums" aria-live="polite">
        {toPersianDigits(value)}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => set(value - 1)}
        disabled={disabled || value <= min}
        aria-label="کاهش تعداد"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
