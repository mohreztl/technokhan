'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Home,
  Loader2,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import type { PaymentVerifyResult } from '@autolounge/shared';
import { ROUTES, formatToman, toPersianDigits } from '@autolounge/shared';
import { ConfettiBurst } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';
import {
  clearPendingPayment,
  readPendingPayment,
  savePendingPayment,
  type PendingPayment,
} from '@/components/checkout/pending-payment';
import { useRequestPayment, useVerifyPayment } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useCartStore } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils';

type CallbackState =
  | { kind: 'verifying' }
  | { kind: 'success'; result: PaymentVerifyResult }
  | { kind: 'failed'; message: string; cancelled: boolean }
  | { kind: 'unconfirmed'; message: string };

const VERIFY_STEPS = ['دریافت پاسخ درگاه', 'تأیید تراکنش', 'به‌روزرسانی سفارش'];

export function PaymentCallbackSkeleton() {
  return (
    <div className="container-custom pb-16" aria-busy="true" aria-label="در حال بارگذاری">
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <Skeleton className="mx-auto h-7 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}

function VerifyingView() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = [600, 1400].map((ms, i) => window.setTimeout(() => setDone(i + 1), ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="relative mx-auto mb-6 h-24 w-24">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-4 border-secondary/20 border-t-secondary"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-secondary">
          <CreditCard className="h-9 w-9" aria-hidden="true" />
        </span>
      </div>
      <h1 className="text-xl font-black">در حال بررسی پرداخت…</h1>
      <p className="mt-2 text-sm text-muted-foreground">لطفاً این صفحه را نبندید.</p>
      <ol className="mx-auto mt-6 max-w-xs space-y-2 text-start text-sm" aria-live="polite">
        {VERIFY_STEPS.map((label, i) => {
          const complete = i < done;
          const active = i === done;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors',
                  complete && 'border-success bg-success text-success-foreground',
                  active && 'border-secondary text-secondary',
                  !complete && !active && 'border-border text-muted-foreground'
                )}
              >
                {complete ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  toPersianDigits(String(i + 1))
                )}
              </span>
              <span className={cn(!complete && !active && 'text-muted-foreground')}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Landing page for the gateway redirect (`?Authority=…&Status=OK|NOK`).
 * Verifies once on mount, then shows success / failure with the next actions.
 */
export function PaymentCallbackClient() {
  const searchParams = useSearchParams();
  const authority = searchParams?.get('Authority') ?? '';
  const statusParam: 'OK' | 'NOK' = searchParams?.get('Status') === 'OK' ? 'OK' : 'NOK';

  const verify = useVerifyPayment();
  const requestPayment = useRequestPayment();
  const clearCart = useCartStore((s) => s.clearCart);

  const [state, setState] = useState<CallbackState>({ kind: 'verifying' });
  const [fire, setFire] = useState(false);
  const pendingRef = useRef<PendingPayment | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    pendingRef.current = readPendingPayment();

    if (!authority) {
      setState({ kind: 'failed', message: 'شناسهٔ پرداخت در آدرس بازگشت یافت نشد.', cancelled: false });
      return;
    }

    verify
      .mutateAsync({ authority, status: statusParam })
      .then((result) => {
        if (result.success) {
          if (result.orderId ?? pendingRef.current?.orderId) clearCart();
          clearPendingPayment();
          setState({ kind: 'success', result });
          window.setTimeout(() => setFire(true), 200);
        } else {
          setState({
            kind: 'failed',
            message: result.message ?? (statusParam === 'NOK' ? 'پرداخت توسط شما لغو شد.' : 'پرداخت تأیید نشد.'),
            cancelled: statusParam === 'NOK',
          });
        }
      })
      .catch((e: unknown) => {
        // The payment may well have been captured; we simply could not reach the API to
        // confirm it. Never present that as a failure with a "pay again" button.
        const offline = typeof e === 'object' && e !== null && (e as { offline?: boolean }).offline === true;
        if (offline) {
          setState({
            kind: 'unconfirmed',
            message: 'ارتباط با سرور برقرار نشد، بنابراین نتیجهٔ پرداخت هنوز تأیید نشده است.',
          });
          return;
        }
        setState({
          kind: 'failed',
          message: e instanceof Error ? e.message : 'بررسی پرداخت ناموفق بود.',
          cancelled: statusParam === 'NOK',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = pendingRef.current;
  const orderId = (state.kind === 'success' ? state.result.orderId : undefined) ?? pending?.orderId;
  const bookingId = (state.kind === 'success' ? state.result.bookingId : undefined) ?? pending?.bookingId;

  const retry = async () => {
    if (!orderId) return;
    try {
      const r = await requestPayment.mutateAsync({ orderId, callbackUrl: '/checkout/callback' });
      savePendingPayment({ orderId, authority: r.authority, amount: r.amount });
      window.location.assign(r.paymentUrl);
    } catch (e) {
      showToast.error('شروع پرداخت ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <div className="container-custom relative pb-16">
      {state.kind === 'verifying' && <VerifyingView />}

      {state.kind === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-md space-y-6"
        >
          <ConfettiBurst fire={fire} fixed />
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success"
            >
              <CheckCircle2 className="h-11 w-11" aria-hidden="true" />
            </motion.div>
            <h1 className="text-2xl font-black">پرداخت با موفقیت انجام شد</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {bookingId ? 'پرداخت رزرو شما ثبت شد.' : 'سفارش شما در حال پردازش است.'}
            </p>
          </div>

          <dl className="glass-effect-strong space-y-3 rounded-2xl p-5 text-sm">
            {state.result.refId && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">شمارهٔ پیگیری</dt>
                <dd dir="ltr" className="font-mono font-bold tracking-wider">
                  {toPersianDigits(state.result.refId)}
                </dd>
              </div>
            )}
            {typeof state.result.amount === 'number' && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">مبلغ</dt>
                <dd className="font-bold text-secondary">{formatToman(state.result.amount)}</dd>
              </div>
            )}
            {state.result.cardNumber && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">شمارهٔ کارت</dt>
                <dd dir="ltr" className="font-mono">
                  {toPersianDigits(state.result.cardNumber)}
                </dd>
              </div>
            )}
          </dl>

          <div className="grid gap-3">
            {orderId && (
              <Button size="lg" asChild>
                <Link href={`${ROUTES.ORDERS}/${orderId}`}>
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                  مشاهدهٔ سفارش
                </Link>
              </Button>
            )}
            {bookingId && (
              <Button size="lg" asChild>
                <Link href={`${ROUTES.PROFILE}?tab=bookings`}>
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  مشاهدهٔ رزرو
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="lg" asChild>
              <Link href={ROUTES.HOME}>
                <Home className="h-5 w-5" aria-hidden="true" />
                صفحهٔ اصلی
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {state.kind === 'unconfirmed' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-md space-y-6"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Clock className="h-11 w-11" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black">نتیجهٔ پرداخت هنوز مشخص نیست</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{state.message}</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              اگر مبلغ از حساب شما کسر شده باشد، سفارش پس از برقراری ارتباط به‌صورت خودکار تأیید می‌شود. لطفاً پیش از
              بررسی وضعیت سفارش، دوباره پرداخت نکنید.
            </p>
          </div>

          <div className="grid gap-3">
            <Button size="lg" onClick={() => window.location.reload()}>
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
              بررسی دوباره
            </Button>
            {orderId && (
              <Button variant="outline" size="lg" asChild>
                <Link href={`${ROUTES.ORDERS}/${orderId}`}>
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                  مشاهدهٔ وضعیت سفارش
                </Link>
              </Button>
            )}
            {bookingId && (
              <Button variant="outline" size="lg" asChild>
                <Link href={`${ROUTES.PROFILE}?tab=bookings`}>
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  مشاهدهٔ رزروها
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {state.kind === 'failed' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-md space-y-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <XCircle className="h-11 w-11" aria-hidden="true" />
            </motion.div>
            <h1 className="text-2xl font-black">{state.cancelled ? 'پرداخت لغو شد' : 'پرداخت ناموفق بود'}</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{state.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              اگر مبلغی از حساب شما کسر شده باشد، حداکثر تا ۷۲ ساعت به حسابتان بازمی‌گردد.
            </p>
          </div>

          <div className="grid gap-3">
            {orderId && (
              <Button size="lg" onClick={retry} loading={requestPayment.isPending} loadingText="انتقال به درگاه…">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
                پرداخت مجدد
              </Button>
            )}
            {orderId && (
              <Button variant="outline" size="lg" asChild>
                <Link href={`${ROUTES.ORDERS}/${orderId}`}>
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                  مشاهدهٔ سفارش
                </Link>
              </Button>
            )}
            {bookingId ? (
              <Button variant="outline" size="lg" asChild>
                <Link href={`${ROUTES.PROFILE}?tab=bookings`}>
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  مشاهدهٔ رزروها
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="lg" asChild>
                <Link href={ROUTES.CART}>
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  بازگشت به سبد خرید
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
