'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Ban, CalendarDays, Car, Copy, CreditCard, MapPin } from 'lucide-react';
import type { Booking } from '@autolounge/shared';
import { findService, formatToman, toPersianDigits } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { showToast } from '@/components/ui/toaster';
import { savePendingPayment } from '@/components/checkout/pending-payment';
import { BookingStatusBadge } from '@/components/orders/status-badge';
import { useCancelBooking, useRequestBookingPayment } from '@/lib/hooks';
import { formatSlot } from '@/lib/booking/wizard';
import { formatJalali, fromIsoDate } from '@/lib/jalali';
import { cn } from '@/lib/utils';

export interface BookingCardProps {
  booking: Booking;
  compact?: boolean;
  className?: string;
}

/** Booking summary with deposit payment and cancellation actions. */
export function BookingCard({ booking, compact, className }: BookingCardProps) {
  const payment = useRequestBookingPayment();
  const cancel = useCancelBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const service = booking.service ?? findService(booking.serviceId);
  const image = service?.images?.[0];
  const date = fromIsoDate(String(booking.date).slice(0, 10));
  const code = booking.trackingCode ?? booking.id;
  const canPay = booking.status === 'pending';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast.copySuccess(code);
    } catch {
      showToast.error('کپی انجام نشد');
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

  const doCancel = async () => {
    try {
      await cancel.mutateAsync(booking.id);
      setConfirmOpen(false);
      showToast.success('رزرو لغو شد');
    } catch (e) {
      showToast.error('لغو رزرو ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn('glass-effect rounded-2xl p-4', className)}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {image && <Image src={image} alt="" fill sizes="64px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-bold">{service?.name ?? 'خدمت اتولانژ'}</h3>
            <BookingStatusBadge status={booking.status} size="sm" />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
            <span>{formatJalali(date, true)}</span>
            <span dir="ltr" className="text-muted-foreground tabular-nums">
              {formatSlot(booking.timeSlot)}
            </span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Car className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {booking.carModel} · {booking.carColor}
            {booking.carPlate && <span dir="rtl"> · {toPersianDigits(booking.carPlate)}</span>}
          </p>
          {!compact && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {booking.location}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground">کد:</span>
          <span dir="ltr" className="font-mono text-xs font-bold tracking-wider">
            {code}
          </span>
          <IconButton
            label="کپی کد پیگیری"
            icon={<Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            variant="ghost"
            size="sm"
            onClick={copyCode}
          />
        </div>
        <span className="text-sm font-black text-secondary">{formatToman(booking.totalPrice)}</span>
      </div>

      {!compact && (canPay || canCancel) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {canPay && (
            <Button size="sm" onClick={payDeposit} loading={payment.isPending} loadingText="انتقال به درگاه…">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              پرداخت بیعانه
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmOpen(true)}
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
              لغو رزرو
            </Button>
          )}
        </div>
      )}

      <ResponsiveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="لغو رزرو"
        description="آیا از لغو این رزرو مطمئن هستید؟"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={() => setConfirmOpen(false)} disabled={cancel.isPending}>
              انصراف
            </Button>
            <Button variant="destructive" size="lg" onClick={doCancel} loading={cancel.isPending} loadingText="در حال لغو…">
              بله، لغو کن
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-7 text-muted-foreground">
          رزرو «{service?.name ?? 'خدمت'}» برای {formatJalali(date, true)} لغو خواهد شد. در صورت پرداخت بیعانه، مبلغ طی ۷۲
          ساعت بازمی‌گردد.
        </p>
      </ResponsiveDialog>
    </motion.article>
  );
}
