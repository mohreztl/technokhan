'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES, WRAP_COLORS } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/ui/premium-components';

const WrapVisualizer = dynamic(
  () => import('@/components/creative/wrap-visualizer').then((m) => m.WrapVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 rounded-3xl border border-border bg-card p-4 sm:p-6" aria-busy="true">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-11 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    ),
  }
);

export interface WrapTeaserProps {
  /** Base wrap price (Toman) used for the live estimate. */
  basePrice?: number;
}

/** Home teaser for the wrap colour visualiser (client-only, code-split). */
export function WrapTeaser({ basePrice }: WrapTeaserProps) {
  return (
    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground lg:py-24" aria-labelledby="wrap-teaser-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,rgba(194,178,128,0.18),transparent)]"
      />
      <div className="container-custom relative">
        <SectionHeading
          id="wrap-teaser-title"
          eyebrow="رپ و تغییر رنگ"
          title="رنگ خودروی رؤیایی‌تان را انتخاب کنید"
          subtitle="پیش از رزرو، رنگ و جلوهٔ رپ را روی خودرو امتحان کنید و برآورد قیمت را همان‌جا ببینید."
          className="[&_h2]:text-primary-foreground [&_p]:text-primary-foreground/75"
        />

        <div className="mx-auto max-w-4xl">
          <WrapVisualizer colors={WRAP_COLORS} basePrice={basePrice} serviceId="car-wrap" />
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild variant="ghost" size="lg" className="min-h-12 gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            <Link href={`${ROUTES.SERVICES}/car-wrap`}>
              جزئیات خدمت رپ خودرو
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
