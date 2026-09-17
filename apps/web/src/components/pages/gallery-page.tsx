'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarCheck, Camera } from 'lucide-react';
import { ROUTES, SERVICE_TYPE_LABELS, type GalleryItem, type ServiceType } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { AmbientOrbs } from '@/components/ui/ambient';
import { GalleryGrid, type GalleryFilter } from '@/components/creative/gallery-grid';

export interface GalleryPageProps {
  items: GalleryItem[];
}

function GalleryContent({ items }: GalleryPageProps) {
  const searchParams = useSearchParams();
  const raw = searchParams.get('filter');
  const initialFilter: GalleryFilter = raw && raw in SERVICE_TYPE_LABELS ? (raw as ServiceType) : 'all';
  const typeCount = new Set(items.map((item) => item.serviceType)).size;

  return (
    <>
      <section className="relative overflow-hidden py-14 text-center lg:py-20" aria-labelledby="gallery-title">
        <AmbientOrbs variant="section" />
        <div className="container-custom relative">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.25em] text-secondary">
            <Camera className="h-4 w-4" aria-hidden="true" />
            نمونه کارها
          </p>
          <h1 id="gallery-title" className="mx-auto max-w-3xl text-balance text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
            قبل و بعد پروژه‌های واقعی اتولانژ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-7 text-muted-foreground sm:text-base">
            هر تصویر یک خودروی واقعی از مشتریان ماست؛ دستگیره را بکشید تا تفاوت را با چشم خود ببینید.
          </p>
          <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm">
              <dt className="text-xs text-muted-foreground">پروژه</dt>
              <dd className="mt-1 text-3xl font-black text-foreground">
                <AnimatedCounter value={items.length} />
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm">
              <dt className="text-xs text-muted-foreground">نوع خدمت</dt>
              <dd className="mt-1 text-3xl font-black text-foreground">
                <AnimatedCounter value={typeCount} />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="pb-16 lg:pb-24" aria-label="گالری">
        <div className="container-custom">
          <GalleryGrid items={items} initialFilter={initialFilter} />
        </div>
      </section>

      <section className="bg-primary py-14 text-center text-primary-foreground lg:py-20" aria-labelledby="gallery-cta-title">
        <div className="container-custom">
          <h2 id="gallery-cta-title" className="text-balance text-2xl font-black sm:text-3xl">
            خودروی شما، پروژهٔ بعدی ماست
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-primary-foreground/75 sm:text-base">
            همین حالا نوبت خود را رزرو کنید؛ مشاورهٔ اولیه و بازدید رایگان است.
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-6 min-h-12 gap-2 px-8 shadow-glow-secondary">
            <Link href={ROUTES.BOOKING}>
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              رزرو نوبت
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

/** Gallery route body (wrapped in Suspense because it reads `useSearchParams`). */
export function GalleryPage({ items }: GalleryPageProps) {
  return (
    <React.Suspense fallback={null}>
      <GalleryContent items={items} />
    </React.Suspense>
  );
}
