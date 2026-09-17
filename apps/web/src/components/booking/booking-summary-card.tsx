'use client';

import Image from 'next/image';
import type { QuoteResult, Service } from '@autolounge/shared';
import { SERVICE_TYPE_LABELS, toPersianDigits } from '@autolounge/shared';
import { RollingNumber, formatDurationFa } from '@/components/creative';
import type { BookingDraft } from '@/lib/booking/draft';
import { formatSlot, sizeLabel, vehicleModelLabel } from '@/lib/booking/wizard';
import { formatJalali, fromIsoDate } from '@/lib/jalali';
import { cn } from '@/lib/utils';

interface BookingSummaryCardProps {
  draft: BookingDraft;
  service: Service;
  quote: QuoteResult;
  className?: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium">{value}</dd>
    </div>
  );
}

/** Sticky desktop summary of the running booking draft. */
export function BookingSummaryCard({ draft, service, quote, className }: BookingSummaryCardProps) {
  const date = draft.date ? fromIsoDate(draft.date) : null;
  const vehicle = draft.vehicle.model ? vehicleModelLabel(draft.vehicle) : null;

  return (
    <div className={cn('glass-effect-strong space-y-4 rounded-2xl p-5', className)}>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          {service.images?.[0] && (
            <Image src={service.images[0]} alt="" fill sizes="56px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[service.type] ?? ''}</p>
          <h3 className="truncate font-bold">{service.name}</h3>
        </div>
      </div>

      <dl className="space-y-2.5 text-sm">
        <Row label="اندازهٔ خودرو" value={sizeLabel(draft.size)} />
        {quote.addons.length > 0 && (
          <Row label="افزودنی‌ها" value={quote.addons.map((a) => a.name).join('، ')} />
        )}
        <Row
          label="زمان"
          value={
            date ? (
              <>
                {formatJalali(date, true)}
                {draft.timeSlot && (
                  <span dir="ltr" className="block text-xs text-muted-foreground">
                    {formatSlot(draft.timeSlot)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
        />
        <Row
          label="خودرو"
          value={
            vehicle ? (
              <>
                {vehicle}
                {draft.vehicle.year && (
                  <span className="text-muted-foreground"> · {toPersianDigits(String(draft.vehicle.year))}</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
        />
        <Row label="محل" value={draft.location === 'onsite' ? 'در محل شما' : 'مرکز اتولانژ'} />
        <Row label="مدت تقریبی" value={formatDurationFa(quote.durationMinutes)} />
      </dl>

      <div className="border-t border-border/50 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">جمع تخمینی</span>
          <span className="text-xl font-black text-secondary">
            <RollingNumber value={quote.total} />
            <span className="ms-1 text-sm font-medium text-foreground">تومان</span>
          </span>
        </div>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          قیمت نهایی پس از بازدید خودرو قطعی می‌شود.
        </p>
      </div>
    </div>
  );
}
