'use client';

import { Star } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';

export function RatingStars({ value, className, size = 'md' }: { value: number; className?: string; size?: 'sm' | 'md' }) {
  const rounded = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={`امتیاز ${toPersianDigits(rounded)} از ۵`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
            i < rounded ? 'fill-secondary text-secondary' : 'text-border'
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
