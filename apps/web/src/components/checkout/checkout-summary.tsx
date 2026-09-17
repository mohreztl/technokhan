'use client';

import Image from 'next/image';
import { ShieldCheck, Truck } from 'lucide-react';
import type { OrderTotals } from '@autolounge/shared';
import { SHIPPING, formatToman, toPersianDigits } from '@autolounge/shared';
import { RollingNumber } from '@/components/creative';
import type { CartItem } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils';

export interface CheckoutSummaryProps {
  items: CartItem[];
  totals: OrderTotals;
  className?: string;
}

/** Sticky desktop order summary for the checkout flow. */
export function CheckoutSummary({ items, totals, className }: CheckoutSummaryProps) {
  const visible = items.slice(0, 4);
  const extra = items.length - visible.length;

  return (
    <div className={cn('glass-effect-strong space-y-4 rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold">خلاصهٔ سفارش</h3>
        <span className="text-xs text-muted-foreground">{toPersianDigits(String(totals.count))} کالا</span>
      </div>

      <div className="flex items-center gap-2">
        {visible.map(({ product }) => (
          <div key={product.id} className="relative h-12 w-12 overflow-hidden rounded-lg border border-border/60 bg-muted">
            {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />}
          </div>
        ))}
        {extra > 0 && (
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-xs font-bold">
            +{toPersianDigits(String(extra))}
          </span>
        )}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">قیمت کالاها</dt>
          <dd className="tabular-nums">{formatToman(totals.listTotal)}</dd>
        </div>
        {totals.productDiscount + totals.couponDiscount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">مجموع تخفیف</dt>
            <dd className="tabular-nums text-success">− {formatToman(totals.productDiscount + totals.couponDiscount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">هزینهٔ ارسال</dt>
          <dd className="tabular-nums">
            {totals.shipping === 0 ? <span className="text-success">رایگان</span> : formatToman(totals.shipping)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-3">
          <dt className="font-bold">مبلغ قابل پرداخت</dt>
          <dd className="text-xl font-black text-secondary">
            <RollingNumber value={totals.total} />
            <span className="ms-1 text-sm font-medium text-foreground">تومان</span>
          </dd>
        </div>
      </dl>

      <ul className="space-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-secondary" aria-hidden="true" />
          تحویل {SHIPPING.estimate}
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
          پرداخت امن و ضمانت اصالت کالا
        </li>
      </ul>
    </div>
  );
}
