'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { ROUTES } from '@technokhan/shared';
import { cn } from '@/lib/utils';

export interface AdminPageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Buttons rendered at the end of the row (stack under the title on phones). */
  actions?: React.ReactNode;
  /** Link back to the parent list, e.g. `/admin/orders`. */
  backHref?: string;
  backLabel?: string;
  /** Hide the «بازگشت به سایت» link (shown by default). */
  hideSiteLink?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  backHref,
  backLabel = 'بازگشت',
  hideSiteLink = false,
  className,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('mb-5 space-y-3 lg:mb-6', className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-0" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : (
          <span />
        )}
        {!hideSiteLink && (
          <Link
            href={ROUTES.HOME}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            بازگشت به سایت
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-foreground text-balance lg:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
