'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

/** Horizontal, scrollable on narrow screens; the last item is the current page. */
export function Breadcrumb({
  items,
  separator = <ChevronLeft className="h-4 w-4" />,
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="مسیر صفحه"
      className={cn('hide-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}
    >
      <ol className="flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="link-hover rounded px-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn('px-0.5 py-1 font-medium', isLast ? 'text-foreground' : 'text-muted-foreground')}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-muted-foreground/60" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
