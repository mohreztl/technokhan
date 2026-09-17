'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DetailCardProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

/** Bordered section with a small gold-accented heading. */
export function DetailCard({ title, icon, action, className, contentClassName, children }: DetailCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-background-secondary/60 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          {icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/20 text-secondary-800 dark:text-secondary-300 [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
              {icon}
            </span>
          )}
          {title}
        </h2>
        {action}
      </header>
      <div className={cn('p-4', contentClassName)}>{children}</div>
    </section>
  );
}

export interface DetailRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** `ltr` for phone numbers, codes and e-mails. */
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export function DetailRow({ label, value, dir, className }: DetailRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-2 text-sm', className)}>
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-semibold text-foreground" dir={dir}>
        {value ?? '—'}
      </dd>
    </div>
  );
}

export function DetailList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dl className={cn('divide-y divide-border/50', className)}>{children}</dl>;
}
