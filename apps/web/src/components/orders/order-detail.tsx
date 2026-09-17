'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  MapPin,
  Package,
  PackageOpen,
  Receipt,
} from 'lucide-react';
import { PAYMENT_METHOD_LABELS, ROUTES, formatToman, toPersianDigits } from '@autolounge/shared';
import { ConfettiBurst } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';
import { AddressCard } from '@/components/checkout/address-card';
import { savePendingPayment } from '@/components/checkout/pending-payment';
import { useCancelOrder, useOrder, useRequestPayment } from '@/lib/hooks';
import { formatJalali, formatJalaliDateTime } from '@/lib/jalali';
import { OrderStatusStepper } from './order-status-stepper';
import { OrderStatusBadge, PaymentStatusBadge } from './status-badge';

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="در حال بارگذاری سفارش">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Package; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-effect rounded-2xl p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 font-bold">
        <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export interface OrderDetailProps {
  id: string;
}

/** Full order page: status stepper, items, address, payment and the available actions. */
export function OrderDetail({ id }: OrderDetailProps) {
  const searchParams = useSearchParams();
  const isNew = searchParams?.get('new') === '1';
  const order = useOrder(id);
  const cancel = useCancelOrder();
  const requestPayment = useRequestPayment();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fire, setFire] = useState(false);
  const data = order.data;

  useEffect(() => {
    if (!isNew || !data) return;
    const t = window.setTimeout(() => setFire(true), 300);
    return () => window.clearTimeout(t);
  }, [isNew, data]);

  if (order.isLoading) return <OrderDetailSkeleton />;

  if (order.isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
        <PackageOpen className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <p className="font-bold">سفارش پیدا نشد</p>
        <p className="text-sm text-muted-foreground">
          {order.error instanceof Error ? order.error.message : 'ممکن است این سفارش متعلق به حساب دیگری باشد.'}
        </p>
        <Button variant="outline" asChild>
          <Link href={ROUTES.ORDERS}>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            بازگشت به سفارش‌ها
          </Link>
        </Button>
      </div>
    );
  }

  const code = data.trackingCode ?? data.id;
  const canPay = data.paymentMethod === 'zarinpal' && data.paymentStatus !== 'paid' && data.status === 'pending';
  const canCancel = data.status === 'pending';
  const itemsTotal = data.subtotal ?? data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast.copySuccess(code);
    } catch {
      showToast.error('کپی انجام نشد');
    }
  };

  const payAgain = async () => {
    try {
      const r = await requestPayment.mutateAsync({ orderId: data.id, callbackUrl: '/checkout/callback' });
      savePendingPayment({ orderId: data.id, authority: r.authority, amount: r.amount });
      window.location.assign(r.paymentUrl);
    } catch (e) {
      showToast.error('شروع پرداخت ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  const doCancel = async () => {
    try {
      await cancel.mutateAsync(data.id);
      setConfirmOpen(false);
      showToast.success('سفارش لغو شد');
    } catch (e) {
      showToast.error('لغو سفارش ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {isNew && (
        <>
          <ConfettiBurst fire={fire} fixed />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
          >
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-bold">سفارش شما ثبت شد</p>
              <p className="text-sm text-muted-foreground">
                {data.paymentMethod === 'cod' ? 'مبلغ سفارش هنگام تحویل دریافت می‌شود.' : 'جزئیات پرداخت در ادامه آمده است.'}
              </p>
            </div>
          </motion.div>
        </>
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={ROUTES.ORDERS} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            سفارش‌های من
          </Link>
          <h1 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
            سفارش
            <span dir="ltr" className="font-mono tracking-wider text-secondary">
              {code}
            </span>
            <IconButton
              label="کپی کد پیگیری"
              icon={<Copy className="h-4 w-4" aria-hidden="true" />}
              variant="ghost"
              size="sm"
              onClick={copyCode}
            />
          </h1>
          <p className="text-sm text-muted-foreground">ثبت‌شده در {formatJalaliDateTime(data.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <OrderStatusBadge status={data.status} />
          <PaymentStatusBadge status={data.paymentStatus} />
        </div>
      </header>

      <section className="glass-effect-strong rounded-2xl p-4 sm:p-5">
        <OrderStatusStepper status={data.status} />
      </section>

      <Section icon={Package} title={`اقلام سفارش (${toPersianDigits(String(data.items.length))})`}>
        <ul className="divide-y divide-border/50">
          {data.items.map((item, i) => (
            <li key={item.id ?? `${item.productId}-${i}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Link
                href={`${ROUTES.PRODUCTS}/${item.productId}`}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                aria-label={item.product?.name ?? 'محصول'}
              >
                {item.product?.images?.[0] && (
                  <Image src={item.product.images[0]} alt="" fill sizes="64px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                {item.product?.brand && <p className="text-xs text-muted-foreground">{item.product.brand}</p>}
                <p className="line-clamp-2 text-sm font-semibold">{item.product?.name ?? item.productId}</p>
                <p className="text-xs text-muted-foreground">
                  {toPersianDigits(String(item.quantity))} × {formatToman(item.price)}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">{formatToman(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">جمع کالاها</dt>
            <dd className="tabular-nums">{formatToman(itemsTotal)}</dd>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">تخفیف{data.couponCode ? ` (${data.couponCode})` : ''}</dt>
              <dd className="tabular-nums text-success">− {formatToman(data.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">هزینهٔ ارسال</dt>
            <dd className="tabular-nums">{data.shippingCost === 0 ? <span className="text-success">رایگان</span> : formatToman(data.shippingCost)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-3">
            <dt className="font-bold">مبلغ کل</dt>
            <dd className="text-lg font-black text-secondary">{formatToman(data.totalPrice)}</dd>
          </div>
        </dl>
      </Section>

      <Section icon={MapPin} title="آدرس ارسال">
        <AddressCard address={data.shippingAddress} className="border-0 bg-transparent p-0" />
      </Section>

      <Section icon={CreditCard} title="پرداخت">
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">روش پرداخت</dt>
            <dd className="font-medium">{PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">وضعیت</dt>
            <dd>
              <PaymentStatusBadge status={data.paymentStatus} size="sm" />
            </dd>
          </div>
        </dl>
        {data.transactions && data.transactions.length > 0 && (
          <ul className="mt-3 space-y-2 border-t border-border/50 pt-3">
            {data.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">
                      {formatToman(tx.amount)}
                      <span className="ms-2 text-muted-foreground">{formatJalali(tx.createdAt)}</span>
                    </p>
                    {tx.refId && (
                      <p dir="ltr" className="text-start font-mono text-muted-foreground">
                        ref: {toPersianDigits(tx.refId)}
                      </p>
                    )}
                  </div>
                </div>
                <PaymentStatusBadge status={tx.status} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {data.notes && (
        <Section icon={FileText} title="توضیحات">
          <p className="whitespace-pre-line text-sm leading-7">{data.notes}</p>
        </Section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {canPay && (
          <Button size="lg" onClick={payAgain} loading={requestPayment.isPending} loadingText="انتقال به درگاه…" className="sm:col-span-2">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
            پرداخت مجدد
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={copyCode}>
          <Copy className="h-5 w-5" aria-hidden="true" />
          کپی کد پیگیری
        </Button>
        {canCancel && (
          <Button variant="outline" size="lg" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmOpen(true)}>
            <Ban className="h-5 w-5" aria-hidden="true" />
            لغو سفارش
          </Button>
        )}
      </div>

      <ResponsiveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="لغو سفارش"
        description="آیا از لغو این سفارش مطمئن هستید؟ این کار قابل بازگشت نیست."
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
          سفارش <span dir="ltr" className="font-mono">{code}</span> با مبلغ {formatToman(data.totalPrice)} لغو خواهد شد.
          {data.paymentStatus === 'paid' && ' مبلغ پرداخت‌شده طی ۷۲ ساعت به حساب شما بازمی‌گردد.'}
        </p>
      </ResponsiveDialog>
    </div>
  );
}
