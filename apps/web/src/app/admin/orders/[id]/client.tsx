'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, MapPin, Package, Phone, Receipt, Save, ShoppingBag } from 'lucide-react';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, findProduct, formatToman, toPersianDigits } from '@autolounge/shared';
import type { OrderItem, OrderStatus } from '@autolounge/shared';
import { useAdminMutations, useAdminOrder } from '@/lib/hooks/use-admin';
import { formatJalaliDateTime } from '@/lib/jalali';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DetailCard, DetailList, DetailRow } from '@/components/admin/detail-card';
import { ErrorBanner } from '@/components/admin/error-banner';
import { EmptyState } from '@/components/admin/data-table';
import { StatusBadge, nextOrderStatus, statusLabel } from '@/components/admin/status-badge';
import { StatusSelect } from '@/components/admin/status-select';
import { orderCode, phoneFa } from '@/components/admin/format';

const PLACEHOLDER = '/images/placeholder-product.webp';

function itemName(item: OrderItem): string {
  return item.product?.name ?? findProduct(item.productId)?.name ?? item.productId;
}

function itemImage(item: OrderItem): string {
  return item.product?.images?.[0] ?? findProduct(item.productId)?.images?.[0] ?? PLACEHOLDER;
}

export function AdminOrderDetailClient({ id }: { id: string }) {
  const { data: order, isLoading, isError, error, refetch } = useAdminOrder(id);
  const { updateOrderStatus } = useAdminMutations();
  const [status, setStatus] = React.useState('');
  const [tracking, setTracking] = React.useState('');

  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTracking(order.trackingCode ?? '');
    }
  }, [order]);

  const save = (nextStatus: string) => {
    const trackingCode = tracking.trim();
    updateOrderStatus.mutate(
      { id, status: nextStatus as OrderStatus, trackingCode: trackingCode || undefined },
      {
        onSuccess: () => toast.success('وضعیت سفارش به‌روزرسانی شد', { description: statusLabel('order', nextStatus) }),
        onError: (e) => toast.error('به‌روزرسانی ناموفق بود', { description: e.message }),
      }
    );
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !order) {
    const notFound = (error as { status?: number } | null)?.status === 404;
    return (
      <>
        <AdminPageHeader title="جزئیات سفارش" backHref="/admin/orders" backLabel="سفارش‌ها" />
        {notFound ? (
          <div className="rounded-2xl border border-dashed border-border/70 py-12">
            <EmptyState
              icon={<ShoppingBag />}
              title="سفارش یافت نشد"
              description="ممکن است این سفارش حذف شده باشد یا شناسهٔ آن اشتباه باشد."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/orders">بازگشت به فهرست سفارش‌ها</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ErrorBanner message={error?.message} onRetry={() => refetch()} />
        )}
      </>
    );
  }

  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const dirty = status !== order.status || tracking.trim() !== (order.trackingCode ?? '');
  const next = nextOrderStatus(order.status);
  const busy = updateOrderStatus.isPending;

  return (
    <>
      <AdminPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span dir="ltr">{orderCode(order)}</span>
            <StatusBadge kind="order" status={order.status} />
          </span>
        }
        subtitle={`ثبت‌شده در ${formatJalaliDateTime(order.createdAt)}`}
        backHref="/admin/orders"
        backLabel="سفارش‌ها"
        actions={
          next && (
            <Button type="button" size="sm" className="gap-2" loading={busy} loadingText="در حال ثبت…" onClick={() => save(next)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              مرحلهٔ بعد: {statusLabel('order', next)}
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <DetailCard title="خلاصهٔ سفارش" icon={<Receipt />}>
            <DetailList>
              <DetailRow label="کد سفارش" value={orderCode(order)} dir="ltr" />
              <DetailRow label="وضعیت پرداخت" value={<StatusBadge kind="payment" status={order.paymentStatus} size="sm" />} />
              <DetailRow label="روش پرداخت" value={PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod} />
              {order.couponCode && <DetailRow label="کد تخفیف" value={order.couponCode} dir="ltr" />}
              <DetailRow label="جمع اقلام" value={formatToman(subtotal)} />
              {order.discount > 0 && <DetailRow label="تخفیف" value={`− ${formatToman(order.discount)}`} className="text-success" />}
              <DetailRow label="هزینهٔ ارسال" value={order.shippingCost > 0 ? formatToman(order.shippingCost) : 'رایگان'} />
              <DetailRow label="مبلغ نهایی" value={<span className="text-base font-black">{formatToman(order.totalPrice)}</span>} />
              <DetailRow label="آخرین تغییر" value={formatJalaliDateTime(order.updatedAt)} />
            </DetailList>
            {order.notes && (
              <p className="mt-3 rounded-xl bg-background-secondary/70 p-3 text-sm leading-6 text-muted-foreground">
                <span className="font-semibold text-foreground">یادداشت مشتری: </span>
                {order.notes}
              </p>
            )}
          </DetailCard>

          <DetailCard title="تغییر وضعیت" icon={<Save />}>
            <div className="space-y-4">
              <StatusSelect kind="order" value={status} onChange={setStatus} disabled={busy} />
              <Input
                label="کد رهگیری پستی (اختیاری)"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
                dir="ltr"
                className="text-start"
                disabled={busy}
              />
              <Button
                type="button"
                className="w-full gap-2"
                disabled={!dirty}
                loading={busy}
                loadingText="در حال ذخیره…"
                onClick={() => save(status)}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                ذخیرهٔ وضعیت
              </Button>
            </div>
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title={`اقلام سفارش (${toPersianDigits(order.items.length)})`} icon={<Package />} contentClassName="p-0">
            <ul className="divide-y divide-border/50">
              {order.items.map((item, idx) => {
                const src = itemImage(item);
                return (
                  <li key={item.id ?? `${item.productId}-${idx}`} className="flex items-center gap-3 px-4 py-3">
                    <Image
                      src={src}
                      alt=""
                      width={56}
                      height={56}
                      sizes="56px"
                      unoptimized={src.startsWith('http')}
                      className="h-14 w-14 shrink-0 rounded-xl border border-border/60 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="block truncate text-sm font-semibold text-foreground hover:underline"
                      >
                        {itemName(item)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {toPersianDigits(item.quantity)} × {formatToman(item.price)}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-foreground">{formatToman(item.price * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>
          </DetailCard>

          <DetailCard
            title="آدرس ارسال"
            icon={<MapPin />}
            action={
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <a href={`tel:${order.shippingAddress.phoneNumber}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  تماس
                </a>
              </Button>
            }
          >
            <DetailList>
              <DetailRow label="گیرنده" value={order.shippingAddress.fullName} />
              <DetailRow label="موبایل" value={phoneFa(order.shippingAddress.phoneNumber)} dir="ltr" />
              <DetailRow label="استان / شهر" value={`${order.shippingAddress.province}، ${order.shippingAddress.city}`} />
              <DetailRow label="کد پستی" value={toPersianDigits(order.shippingAddress.postalCode)} dir="ltr" />
            </DetailList>
            <p className="mt-2 text-sm leading-7 text-foreground">{order.shippingAddress.address}</p>
          </DetailCard>

          <DetailCard title="تراکنش‌ها" icon={<CreditCard />} contentClassName="p-0">
            {!order.transactions || order.transactions.length === 0 ? (
              <div className="py-8">
                <EmptyState icon={<CreditCard />} title="تراکنشی ثبت نشده" />
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {order.transactions.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">
                        {t.gateway} · {PAYMENT_STATUS_LABELS[t.status] ?? t.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatJalaliDateTime(t.createdAt)}
                        {t.refId && (
                          <>
                            {' '}
                            · کد پیگیری <span dir="ltr">{toPersianDigits(t.refId)}</span>
                          </>
                        )}
                        {t.cardNumber && (
                          <>
                            {' '}
                            · کارت <span dir="ltr">{toPersianDigits(t.cardNumber)}</span>
                          </>
                        )}
                      </p>
                      {t.errorMessage && <p className="text-xs text-destructive">{t.errorMessage}</p>}
                    </div>
                    <p className="whitespace-nowrap font-bold">{formatToman(t.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
