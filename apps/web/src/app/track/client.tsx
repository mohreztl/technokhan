'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CircleSlash, PackageSearch, Search, Truck } from 'lucide-react';
import {
  PAYMENT_STATUS_LABELS,
  ROUTES,
  formatToman,
  isTerminalStatus,
  toPersianDigits,
  trackingTimeline,
} from '@autolounge/shared';
import type { TrackResult } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { demoTrack } from '@/lib/api/demo';
import { formatJalali, formatJalaliDateTime } from '@/lib/jalali';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/premium-components';
import { StatusBadge } from '@/components/admin/status-badge';
import { lookupTrackAction } from './actions';
import type { TrackState } from './actions';

const INITIAL: TrackState = { status: 'idle' };

export function TrackPageClient({ initialCode = '' }: { initialCode?: string }) {
  const [state, submit, pending] = React.useActionState(lookupTrackAction, INITIAL);

  // The server action cannot see the demo transport — it lives in localStorage.
  // When the API is unreachable the action says so and the browser finishes the
  // lookup locally, which is the same contract `withDemoFallback` implements.
  const [fallback, setFallback] = React.useState<TrackState | null>(null);
  React.useEffect(() => {
    if (state.status !== 'unreachable') {
      setFallback(null);
      return;
    }
    let live = true;
    void demoTrack.lookup(state.values).then((response) => {
      if (!live) return;
      setFallback(
        response.ok
          ? { status: 'found', result: response.data, values: state.values }
          : { status: 'missing', message: response.error, values: state.values }
      );
    });
    return () => {
      live = false;
    };
  }, [state]);

  const shown = fallback ?? state;
  const busy = pending || state.status === 'unreachable';
  const previous = 'values' in state ? state.values : null;
  const error = shown.status === 'invalid' || shown.status === 'missing' ? shown.message : null;

  return (
    <div className="container-page space-y-8 py-8 md:py-12">
      <SectionHeading
        eyebrow="پیگیری"
        title="سفارش یا نوبت خود را دنبال کنید"
        subtitle="کد پیگیری‌ای که پس از ثبت برایتان پیامک شد را همراه با شمارهٔ موبایل وارد کنید. نیازی به ورود به حساب کاربری نیست."
      />

      <form
        action={submit}
        className="mx-auto grid w-full max-w-2xl gap-4 rounded-3xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="code"
            label="کد پیگیری"
            placeholder="OR-9726DQ"
            dir="ltr"
            className="text-start font-mono tracking-wider"
            autoComplete="off"
            required
            startIcon={<PackageSearch />}
            defaultValue={previous?.code ?? initialCode}
            error={shown.status === 'invalid' ? shown.message : undefined}
          />
          <Input
            name="phoneNumber"
            label="شمارهٔ موبایل"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            inputMode="numeric"
            dir="ltr"
            className="text-start"
            autoComplete="tel"
            required
            defaultValue={previous?.phoneNumber ?? ''}
          />
        </div>
        <Button type="submit" className="gap-2 sm:w-fit sm:justify-self-start" loading={busy} loadingText="در حال جست‌وجو…">
          <Search className="h-4 w-4" aria-hidden="true" />
          پیگیری
        </Button>
        <p className="text-xs leading-6 text-muted-foreground">
          کد سفارش‌ها با{' '}
          <span dir="ltr" className="font-mono">
            OR-
          </span>{' '}
          و کد نوبت‌ها با{' '}
          <span dir="ltr" className="font-mono">
            BK-
          </span>{' '}
          شروع می‌شود.
        </p>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key={`error-${error}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex w-full max-w-2xl items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 text-destructive"
          >
            <CircleSlash className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
              <p className="text-destructive/80">
                کد و شماره را یک بار دیگر بررسی کنید. اگر باز هم پیدا نشد،{' '}
                <Link href={ROUTES.CONTACT} className="underline underline-offset-4">
                  با ما تماس بگیرید
                </Link>
                .
              </p>
            </div>
          </motion.div>
        )}

        {shown.status === 'found' && (
          <motion.div key={shown.result.code} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TrackResultCard result={shown.result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrackResultCard({ result }: { result: TrackResult }) {
  const steps = trackingTimeline(result.kind, result.status);
  const cancelled = result.status === 'cancelled';
  const done = isTerminalStatus(result.kind, result.status);
  const noun = result.kind === 'order' ? 'سفارش' : 'نوبت';

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{noun}</p>
          <p dir="ltr" className="font-mono text-lg font-black tracking-wider text-foreground">
            {result.code}
          </p>
        </div>
        <StatusBadge kind={result.kind} status={result.status} />
      </header>

      {cancelled ? (
        <p className="rounded-2xl bg-destructive/5 p-4 text-sm leading-6 text-destructive">
          این {noun} لغو شده است. برای پیگیری بیشتر با پشتیبانی تماس بگیرید.
        </p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-4">
          {steps.map((step) => (
            <li key={step.status} className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-1.5 sm:w-full sm:rounded-full sm:border-0',
                  step.done
                    ? 'border-secondary bg-secondary text-secondary-foreground'
                    : 'border-border bg-background-secondary text-muted-foreground'
                )}
              >
                <Check className={cn('h-3.5 w-3.5 sm:hidden', !step.done && 'opacity-0')} />
              </span>
              <span
                className={cn(
                  'text-xs leading-5',
                  step.current ? 'font-bold text-foreground' : step.done ? 'text-foreground/80' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      )}

      <dl className="grid gap-x-6 gap-y-2.5 border-t border-border/60 pt-4 text-sm sm:grid-cols-2">
        {result.kind === 'booking' ? (
          <>
            <Row label="خدمت" value={result.serviceName} />
            <Row label="تاریخ" value={result.date ? formatJalali(result.date, true) : undefined} />
            <Row label="بازهٔ زمانی" value={result.timeSlot ? toPersianDigits(result.timeSlot) : undefined} dir="ltr" />
          </>
        ) : (
          <>
            <Row label="تعداد اقلام" value={result.itemCount ? toPersianDigits(result.itemCount) : undefined} />
            <Row label="مقصد" value={result.destination} />
            <Row label="وضعیت پرداخت" value={result.paymentStatus ? PAYMENT_STATUS_LABELS[result.paymentStatus] : undefined} />
          </>
        )}
        <Row label="مبلغ" value={formatToman(result.totalPrice)} />
        <Row label="ثبت" value={formatJalaliDateTime(result.createdAt)} />
        <Row label="آخرین تغییر" value={formatJalaliDateTime(result.updatedAt)} />
      </dl>

      {result.shipmentCode && (
        <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-background-secondary/70 p-3.5 text-sm">
          <Truck className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <span className="text-muted-foreground">کد رهگیری مرسولهٔ پستی:</span>
          <span dir="ltr" className="font-mono font-bold text-foreground">
            {result.shipmentCode}
          </span>
        </p>
      )}

      {!done && (
        <p className="text-xs leading-6 text-muted-foreground">
          وضعیت را هر زمان با همین کد می‌توانید دوباره ببینید. تغییر وضعیت برایتان پیامک هم می‌شود.
        </p>
      )}

      <Button asChild variant="outline" size="sm" className="gap-2">
        <Link href={result.kind === 'order' ? ROUTES.ORDERS : ROUTES.PROFILE}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {result.kind === 'order' ? 'سفارش‌های من' : 'نوبت‌های من'}
        </Link>
      </Button>
    </section>
  );
}

function Row({ label, value, dir }: { label: string; value?: React.ReactNode; dir?: 'ltr' }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-3 sm:justify-start sm:gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd dir={dir} className={cn('font-semibold text-foreground', dir === 'ltr' && 'text-start')}>
        {value}
      </dd>
    </div>
  );
}
