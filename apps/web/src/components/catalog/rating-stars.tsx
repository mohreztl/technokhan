'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';

export interface RatingStarsProps {
  value: number;
  /** Number of reviews, shown as «(۱۲ نظر)». */
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

/** Read-only five-star rating with fractional fill and Persian digits. */
export function RatingStars({ value, count, size = 'md', showValue = true, className }: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="img"
      aria-label={`امتیاز ${toPersianDigits(clamped.toFixed(1))} از ۵`}
    >
      <span className="flex items-center gap-0.5" dir="ltr" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, clamped - i));
          return (
            <span key={i} className={cn('relative inline-block', sizes[size])}>
              <Star className={cn('absolute inset-0 text-muted-foreground/30', sizes[size])} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn('fill-secondary text-secondary', sizes[size])} />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {toPersianDigits(clamped.toFixed(1))}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({toPersianDigits(count)} نظر)</span>
      )}
    </div>
  );
}

export interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  className?: string;
}

/** Interactive star picker used by review forms (44px targets). */
export function StarPicker({ value, onChange, label = 'امتیاز شما', error, className }: StarPickerProps) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label} dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${toPersianDigits(star)} ستاره`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                star <= active ? 'fill-secondary text-secondary' : 'text-muted-foreground/40'
              )}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
