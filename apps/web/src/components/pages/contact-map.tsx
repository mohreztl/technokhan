'use client';

import * as React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { CONTACT } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ContactMapProps {
  className?: string;
}

/** OpenStreetMap embed loaded on demand (no third-party request until the visitor asks). */
export function ContactMap({ className }: ContactMapProps) {
  const [show, setShow] = React.useState(false);
  const { lat, lng } = CONTACT.location;
  const bbox = [lng - 0.01, lat - 0.006, lng + 0.01, lat + 0.006].map((n) => n.toFixed(5)).join(',');
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const directions = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
      <div className="relative aspect-4/3 bg-muted sm:aspect-video">
        {show ? (
          <iframe
            src={embedSrc}
            title="نقشهٔ موقعیت اتولانژ"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,rgba(194,178,128,0.18),transparent_60%)] p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-foreground">{CONTACT.address}</p>
            <Button type="button" variant="primary" onClick={() => setShow(true)} className="min-h-11">
              نمایش نقشه
            </Button>
            <p className="text-[11px] text-muted-foreground">نقشه از OpenStreetMap بارگذاری می‌شود.</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <p className="text-xs text-muted-foreground">{CONTACT.workingHours}</p>
        <Button asChild variant="outline" className="min-h-11 gap-2">
          <a href={directions} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-4 w-4" aria-hidden="true" />
            مسیریابی
          </a>
        </Button>
      </div>
    </div>
  );
}
