'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = <ChevronLeft className="h-4 w-4" />,
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2', className)}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors link-hover"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium',
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-muted-foreground" aria-hidden="true">
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
