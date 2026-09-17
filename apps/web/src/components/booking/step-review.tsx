'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Car, LogIn, Pencil, Sparkles } from 'lucide-react';
import { formatToman, toPersianDigits } from '@autolounge/shared';
import { RollingNumber, formatDurationFa } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/store/auth-store';
import { formatSlot, sizeLabel, vehicleModelLabel } from '@/lib/booking/wizard';
import { formatJalali, fromIsoDate } from '@/lib/jalali';
import type { StepProps } from './step-props';

function ReviewSection({
  icon: Icon,
  title,
  onEdit,
  children,
}: {
  icon: LucideIcon;
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-effect rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold">
          <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
          {title}
        </h3>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`ویرایش ${title}`}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            ویرایش
          </Button>
        )}
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium">{value}</dd>
    </div>
  );
}

/** Step ۴ — everything the user chose, the price breakdown and the sign-in hint. */
export function StepReview({ draft, service, quote, errors, onEdit }: StepProps) {
  const { status } = useAuth();
  const date = draft.date ? fromIsoDate(draft.date) : null;

  return (
    <div className="space-y-4">
      <ReviewSection icon={Sparkles} title="خدمت" onEdit={() => onEdit?.(0)}>
        <Row label="خدمت" value={service.name} />
        <Row label="اندازهٔ خودرو" value={sizeLabel(draft.size)} />
        <Row label="مدت تقریبی" value={formatDurationFa(quote.durationMinutes)} />
        {quote.addons.length > 0 && (
          <Row
            label="افزودنی‌ها"
            value={
              <span className="flex flex-wrap justify-end gap-1">
                {quote.addons.map((a) => (
                  <span key={a.id} className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs">
                    {a.name}
                  </span>
                ))}
              </span>
            }
          />
        )}
      </ReviewSection>

      <ReviewSection icon={CalendarDays} title="زمان مراجعه" onEdit={() => onEdit?.(1)}>
        <Row label="روز" value={date ? formatJalali(date, true) : '—'} />
        <Row
          label="بازه"
          value={
            draft.timeSlot ? (
              <span dir="ltr" className="tabular-nums">
                {formatSlot(draft.timeSlot)}
              </span>
            ) : (
              '—'
            )
          }
        />
      </ReviewSection>

      <ReviewSection icon={Car} title="خودرو و محل" onEdit={() => onEdit?.(2)}>
        <Row label="خودرو" value={vehicleModelLabel(draft.vehicle) || '—'} />
        <Row label="سال ساخت" value={draft.vehicle.year ? toPersianDigits(String(draft.vehicle.year)) : '—'} />
        <Row label="رنگ" value={draft.vehicle.color || '—'} />
        {draft.vehicle.plate.trim() && (
          <Row label="پلاک" value={<span dir="rtl">{toPersianDigits(draft.vehicle.plate)}</span>} />
        )}
        <Row label="محل انجام" value={draft.location === 'onsite' ? 'در محل شما' : 'مرکز اتولانژ'} />
        {draft.location === 'onsite' && draft.onsiteAddress.trim() && (
          <Row label="آدرس" value={<span className="line-clamp-2">{draft.onsiteAddress.trim()}</span>} />
        )}
        {draft.notes.trim() && (
          <Row label="توضیحات" value={<span className="line-clamp-3">{draft.notes.trim()}</span>} />
        )}
      </ReviewSection>

      <section className="glass-effect-strong rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 font-bold">جزئیات هزینه</h3>
        <dl className="space-y-2 text-sm">
          <Row label={`قیمت پایه (${sizeLabel(draft.size)})`} value={formatToman(quote.base)} />
          {quote.addons.map((a) => (
            <Row key={a.id} label={a.name} value={`+ ${formatToman(a.price)}`} />
          ))}
          <div className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-3">
            <dt className="font-bold">جمع تخمینی</dt>
            <dd className="text-xl font-black text-secondary">
              <RollingNumber value={quote.total} />
              <span className="ms-1 text-sm font-medium text-foreground">تومان</span>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          پرداخت آنلاین اختیاری است؛ می‌توانید کل مبلغ را همین حالا بپردازید یا هنگام تحویل خودرو تسویه کنید.
        </p>
      </section>

      {status === 'anonymous' && (
        <div className="flex items-start gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <p className="leading-6">
            برای ثبت نهایی باید وارد حساب شوید. با زدن «ثبت رزرو» پنجرهٔ ورود باز می‌شود و پس از ورود،
            رزرو به‌صورت خودکار ثبت خواهد شد.
          </p>
        </div>
      )}

      {errors.submit && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.submit}
        </p>
      )}
    </div>
  );
}
