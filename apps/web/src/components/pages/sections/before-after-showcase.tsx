'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Car } from 'lucide-react';
import { ROUTES, SERVICE_TYPE_LABELS, type GalleryItem } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { BeforeAfterSlider } from '@/components/creative/before-after-slider';
import { fadeInUp, viewportConfig } from '@/lib/animation-variants';

export interface BeforeAfterShowcaseProps {
  items: GalleryItem[];
}

/** Interactive before/after slider for the first gallery items with tappable thumbnails. */
export function BeforeAfterShowcase({ items }: BeforeAfterShowcaseProps) {
  const picks = React.useMemo(() => items.slice(0, 3), [items]);
  const [index, setIndex] = React.useState(0);
  const active = picks[Math.min(index, picks.length - 1)];

  if (!active) return null;

  return (
    <section className="py-16 lg:py-24" aria-labelledby="before-after-title">
      <div className="container-custom">
        <SectionHeading
          id="before-after-title"
          eyebrow="قبل و بعد"
          title="تفاوت را با چشم خود ببینید"
          subtitle="دستگیره را بکشید تا نتیجهٔ واقعی کار تیم اتولانژ روی خودروهای مشتریان را مقایسه کنید."
        />

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig.once}
          className="mx-auto max-w-4xl"
        >
          <div className="overflow-hidden rounded-3xl border border-border/60 shadow-luxury">
            <BeforeAfterSlider
              key={active.id}
              before={active.before}
              after={active.after}
              alt={active.title}
              aspect="4/3"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Car className="h-4 w-4 text-secondary" aria-hidden="true" />
                <span className="truncate" dir="auto">
                  {active.vehicle ?? active.title}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {SERVICE_TYPE_LABELS[active.serviceType] ?? active.serviceType}
                {active.vehicle ? ` · ${active.title}` : null}
              </p>
            </div>

            {picks.length > 1 && (
              <div className="flex items-center gap-2" role="tablist" aria-label="انتخاب نمونه کار">
                {picks.map((item, i) => {
                  const selected = i === index;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-label={item.title}
                      onClick={() => setIndex(i)}
                      className={cn(
                        'relative h-14 w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                        selected
                          ? 'border-secondary shadow-glow-secondary'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      )}
                    >
                      <Image
                        src={item.cover ?? item.after}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild variant="secondary" size="lg" className="min-h-12 gap-2 px-8 shadow-glow-secondary">
              <Link href={ROUTES.GALLERY}>
                نمونه کارهای بیشتر
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
