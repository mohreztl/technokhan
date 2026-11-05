'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarCheck2, Clock3, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@technokhan/shared';
import { Button } from '@/components/ui/button';

/** A deliberately small booking entry point for the home page. The complete
 * four-step flow stays on /booking, where it has enough room to breathe. */
export function QuoteTeaser() {
  return (
    <section className="border-y border-border/60 bg-primary py-12 text-primary-foreground sm:py-16" aria-labelledby="booking-teaser-title">
      <div className="container-custom flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="booking-teaser-title" className="text-2xl font-black sm:text-3xl">
            نوبتتان را ساده رزرو کنید
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-primary-foreground/75 sm:text-base">
            خدمت، روز و ساعت مناسب را انتخاب کنید؛ قیمت و زمان اجرا قبل از ثبت نهایی شفاف نمایش داده می‌شود.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-foreground/80">
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-secondary" /> انتخاب زمان آزاد</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> تأیید پیامکی</span>
          </div>
        </div>
        <Button asChild size="lg" className="min-h-14 shrink-0 gap-3 bg-secondary px-7 text-secondary-foreground hover:bg-secondary/90">
          <Link href={ROUTES.BOOKING}>
            <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
            رزرو نوبت
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
