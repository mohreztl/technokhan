'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { QuoteConfiguratorProps } from '@/components/creative/quote-configurator';
import { Skeleton } from '@/components/ui/skeleton';

export function QuoteSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-busy="true">
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      {!compact && (
        <div className="space-y-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      )}
      <Skeleton className="h-14 rounded-xl" />
    </div>
  );
}

const QuoteConfigurator = dynamic(
  () => import('@/components/creative/quote-configurator').then((m) => m.QuoteConfigurator),
  { loading: () => <QuoteSkeleton /> }
);

/** Code-split wrapper around `QuoteConfigurator` (below-the-fold usage). */
export function QuoteCalculator(props: QuoteConfiguratorProps) {
  return <QuoteConfigurator {...props} />;
}
