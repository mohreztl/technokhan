'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Package } from 'lucide-react';
import type { Order } from '@autolounge/shared';
import { ROUTES, formatToman, toPersianDigits } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { formatJalali } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import { OrderStatusBadge, PaymentStatusBadge } from './status-badge';

export interface OrderCardProps {
  order: Order;
  className?: string;
}

/** Compact order summary used by `/orders` and the profile tabs. */
export function OrderCard({ order, className }: OrderCardProps) {
  const thumbs = order.items.slice(0, 3);
  const extra = order.items.length - thumbs.length;
  const count = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const names = order.items
    .map((i) => i.product?.name)
    .filter(Boolean)
    .join('، ');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn('glass-effect rounded-2xl p-4', className)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">کد پیگیری</p>
          <p dir="ltr" className="truncate text-start font-mono text-sm font-bold tracking-wider">
            {order.trackingCode ?? order.id}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <OrderStatusBadge status={order.status} size="sm" />
          <PaymentStatusBadge status={order.paymentStatus} size="sm" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex shrink-0 [&>*:not(:first-child)]:-ms-3">
          {thumbs.map((item, i) => (
            <div
              key={item.id ?? `${item.productId}-${i}`}
              className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-background bg-muted"
              style={{ zIndex: thumbs.length - i }}
            >
              {item.product?.images?.[0] ? (
                <Image src={item.product.images[0]} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Package className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </div>
          ))}
          {extra > 0 && (
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border-2 border-background bg-muted text-xs font-bold">
              +{toPersianDigits(String(extra))}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-medium">{names || 'سفارش محصولات'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatJalali(order.createdAt)}
            <span className="mx-1">·</span>
            {toPersianDigits(String(count))} کالا
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <span className="text-base font-black text-secondary">{formatToman(order.totalPrice)}</span>
        <Button variant="outline" size="sm" asChild>
          <Link href={`${ROUTES.ORDERS}/${order.id}`}>
            جزئیات
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
