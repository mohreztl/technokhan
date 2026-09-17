'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  /** Rendered after the number in the RTL flow, e.g. «تومان». */
  unit?: string;
  /** Small hint under the number, e.g. «۳ مورد در انتظار». */
  hint?: string;
  /** Delta text; `deltaTone` colors it. */
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
  /** Whole card becomes a link. */
  href?: string;
  accent?: 'gold' | 'navy' | 'success' | 'warning';
  loading?: boolean;
  className?: string;
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, { bar: string; icon: string }> = {
  gold: { bar: 'from-secondary via-secondary/70 to-transparent', icon: 'bg-secondary/20 text-secondary-800 dark:text-secondary-300' },
  navy: { bar: 'from-primary via-primary/60 to-transparent dark:from-primary-200', icon: 'bg-primary/10 text-primary dark:bg-primary-200/15 dark:text-primary-100' },
  success: { bar: 'from-success via-success/60 to-transparent', icon: 'bg-success/10 text-success' },
  warning: { bar: 'from-warning via-warning/60 to-transparent', icon: 'bg-warning/10 text-warning' },
};

/** KPI tile: icon, label, animated Persian number, optional unit / delta / link. */
export function StatCard({
  icon,
  label,
  value,
  unit,
  hint,
  delta,
  deltaTone = 'neutral',
  href,
  accent = 'gold',
  loading = false,
  className,
}: StatCardProps) {
  const a = ACCENTS[accent];

  const body = (
    <>
      <span className={cn('absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l', a.bar)} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5', a.icon)} aria-hidden="true">
          {icon}
        </span>
        {href && (
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground transition-transform rtl:-scale-x-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-8 w-24" />
      ) : (
        <p className="mt-1 flex items-baseline gap-1.5 text-2xl font-black text-foreground">
          <AnimatedCounter value={value} duration={1.2} />
          {unit && <span className="text-sm font-semibold text-muted-foreground">{unit}</span>}
        </p>
      )}
      {(delta || hint) && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold',
                deltaTone === 'up' && 'text-success',
                deltaTone === 'down' && 'text-destructive'
              )}
            >
              {deltaTone === 'up' && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
              {deltaTone === 'down' && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              {delta}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </p>
      )}
    </>
  );

  const classes = cn(
    'group relative block overflow-hidden rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all duration-300',
    href && 'hover:-translate-y-0.5 hover:shadow-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={`${label}: ${value}`}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}
