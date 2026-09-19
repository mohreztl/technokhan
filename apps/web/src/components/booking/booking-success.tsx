'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CalendarPlus, CheckCircle2, ClipboardList, Copy, CreditCard, Home } from 'lucide-react';
import type { Booking, Service } from '@autolounge/shared';
import { CONTACT, ROUTES, formatToman, toPersianDigits } from '@autolounge/shared';
import { ConfettiBurst } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toaster';
import { useRequestBookingPayment } from '@/lib/hooks';
import { savePendingPayment } from '@/components/checkout/pending-payment';
import { buildIcs, downloadIcs } from '@/lib/booking/ics';
import { formatSlot, slotDurationMinutes, slotStartDate } from '@/lib/booking/wizard';
import { formatJalali, formatJalaliDateTime, fromIsoDate } from '@/lib/jalali';

interface BookingSuccessProps {
  booking: Booking;
  service: Service;
  durationMinutes?: number;
  /** address string when the service is done on-site; otherwise the centre */
  locationLabel?: string;
}

/** Post-submit screen: confetti, tracking code, payment / calendar / navigation actions. */
export function BookingSuccess({ booking, service, durationMinutes, locationLabel }: BookingSuccessProps) {
  const [fire, setFire] = useState(false);
  const payment = useRequestBookingPayment();

  useEffect(() => {
    const t = window.setTimeout(() => setFire(true), 200);
    window.scrollTo({ top: 0 });
    return () => window.clearTimeout(t);
  }, []);

  const code = booking.trackingCode ?? booking.id;
  const isoDate = String(booking.date).slice(0, 10);
  const date = fromIsoDate(isoDate);
  const location = locationLabel ?? CONTACT.address;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast.copySuccess(code);
    } catch {
      showToast.error('کپی انجام نشد', 'کد را دستی یادداشت کنید.');
    }
  };

  const payDeposit = async () => {
    try {
      const r = await payment.mutateAsync({ bookingId: booking.id, callbackUrl: '/checkout/callback' });
      savePendingPayment({ bookingId: booking.id, authority: r.authority, amount: r.amount });
      window.location.assign(r.paymentUrl);
    } catch (e) {
      showToast.error('شروع پرداخت ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  const addToCalendar = () => {
    const ics = buildIcs({
      title: `اتولانژ – ${service.name}`,
      description: `کد پیگیری: ${code}\nخودرو: ${booking.carModel} (${booking.carColor})`,
      start: slotStartDate(isoDate, booking.timeSlot),
      durationMinutes: durationMinutes ?? slotDurationMinutes(booking.timeSlot),
      location,
      uid: `booking-${booking.id}@autolounge.ir`,
      url: `${window.location.origin}${ROUTES.PROFILE}?tab=bookings`,
    });
    downloadIcs(`autolounge-${code}.ics`, ics);
    showToast.success('فایل تقویم آماده شد', 'آن را در تقویم گوشی یا کامپیوتر خود باز کنید.');
  };

  return (
    <div className="container-custom relative pb-12">
      <ConfettiBurst fire={fire} fixed />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-lg space-y-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success"
          >
            <CheckCircle2 className="h-11 w-11" aria-hidden="true" />
          </motion.div>
          <h1 className="text-2xl font-black sm:text-3xl">رزرو شما ثبت شد</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            پس از بررسی، تأیید نهایی از طریق پیامک اطلاع داده می‌شود.
          </p>
        </div>

        <div className="glass-effect-strong rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">کد پیگیری</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span dir="ltr" className="font-mono text-2xl font-black tracking-widest text-secondary">
              {code}
            </span>
            <Button variant="outline" size="sm" onClick={copyCode}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              کپی
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            ثبت‌شده در {formatJalaliDateTime(booking.createdAt)}
          </p>
          <Link
            href={`${ROUTES.TRACK}?code=${encodeURIComponent(code)}`}
            className="link-hover mt-3 inline-flex min-h-10 items-center text-xs font-semibold text-secondary"
          >
            پیگیری با این کد
          </Link>
        </div>

        <div className="glass-effect space-y-4 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
              {service.images?.[0] && (
                <Image src={service.images[0]} alt="" fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-bold">{service.name}</h2>
              <p className="text-sm text-muted-foreground">
                {formatJalali(date, true)}
                <span className="mx-1">·</span>
                <span dir="ltr" className="tabular-nums">
                  {formatSlot(booking.timeSlot)}
                </span>
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">خودرو</dt>
              <dd className="font-medium">
                {booking.carModel} · {toPersianDigits(String(booking.carYear))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">رنگ</dt>
              <dd className="font-medium">{booking.carColor}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">محل</dt>
              <dd className="font-medium">{booking.location}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">مبلغ تخمینی</dt>
              <dd className="font-bold text-secondary">{formatToman(booking.totalPrice)}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            size="lg"
            onClick={payDeposit}
            loading={payment.isPending}
            loadingText="انتقال به درگاه…"
            className="sm:col-span-2"
          >
            <CreditCard className="h-5 w-5" aria-hidden="true" />
            پرداخت آنلاین رزرو
          </Button>
          <Button variant="outline" size="lg" onClick={addToCalendar}>
            <CalendarPlus className="h-5 w-5" aria-hidden="true" />
            افزودن به تقویم
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href={`${ROUTES.PROFILE}?tab=bookings`}>
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
              مشاهدهٔ رزروها
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild className="sm:col-span-2">
            <Link href={ROUTES.HOME}>
              <Home className="h-5 w-5" aria-hidden="true" />
              صفحهٔ اصلی
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
