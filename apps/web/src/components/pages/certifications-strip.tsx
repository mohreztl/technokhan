'use client';

import * as React from 'react';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { toPersianDigits, type Certification } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { SectionHeading } from '@/components/ui/premium-components';

export interface CertificationsStripProps {
  items: Certification[];
}

const MARQUEE_KEYFRAMES = `
@keyframes al-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(50%); }
}
`;

/** Logo marquee (CSS animation, paused under reduced motion / hover); tap opens the description. */
export function CertificationsStrip({ items }: CertificationsStripProps) {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState<Certification | null>(null);
  const animate = !reduced && items.length > 1;
  const track = animate ? [...items, ...items] : items;

  return (
    <section className="overflow-hidden bg-muted/40 py-16 lg:py-24" aria-labelledby="certs-title">
      <style>{MARQUEE_KEYFRAMES}</style>
      <div className="container-custom">
        <SectionHeading
          id="certs-title"
          eyebrow="گواهی‌نامه‌ها"
          title="مورد تأیید برندهای جهانی"
          subtitle="برای مشاهدهٔ جزئیات هر گواهی روی آن بزنید."
        />
      </div>

      <div className="relative" dir="ltr">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent sm:w-24" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-background to-transparent sm:w-24" />
        <ul
          className={cn(
            'flex w-max items-stretch gap-4 px-4 [animation-play-state:running] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]',
            !animate && 'mx-auto w-full flex-wrap justify-center'
          )}
          style={animate ? { animation: `al-marquee ${Math.max(20, items.length * 8)}s linear infinite` } : undefined}
        >
          {track.map((cert, index) => (
            <li key={`${cert.id}-${index}`} aria-hidden={animate && index >= items.length ? true : undefined}>
              <button
                type="button"
                title={cert.description}
                onClick={() => setActive(cert)}
                aria-haspopup="dialog"
                tabIndex={animate && index >= items.length ? -1 : 0}
                className="flex h-full w-56 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-secondary/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary"
                dir="rtl"
              >
                <span className="relative h-16 w-full">
                  <Image src={cert.image} alt={cert.nameEn} fill sizes="200px" className="object-contain" />
                </span>
                <span className="text-sm font-bold text-foreground">{cert.name}</span>
                <span className="text-xs text-muted-foreground" dir="ltr">
                  {cert.nameEn}
                </span>
                {cert.year ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    از {toPersianDigits(cert.year)}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ResponsiveDialog
        open={active !== null}
        onOpenChange={(open) => !open && setActive(null)}
        title={active?.name}
        description={active?.nameEn}
        snapPoints={[0.55, 0.9]}
        desktopClassName="max-w-md"
      >
        {active && (
          <div className="space-y-4">
            <div className="relative mx-auto h-24 w-48">
              <Image src={active.image} alt={active.nameEn} fill sizes="192px" className="object-contain" />
            </div>
            <p className="text-sm leading-8 text-foreground/90">{active.description}</p>
            {active.year ? (
              <p className="text-xs font-semibold text-muted-foreground">سال دریافت: {toPersianDigits(active.year)}</p>
            ) : null}
          </div>
        )}
      </ResponsiveDialog>
    </section>
  );
}
