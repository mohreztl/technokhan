'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { CreditCard, MapPin, Package, Pencil } from 'lucide-react';
import type { Address, OrderTotals, PaymentMethod } from '@autolounge/shared';
import { PAYMENT_METHOD_LABELS, ROUTES, SHIPPING, effectivePrice, formatToman, toPersianDigits } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { CartItem } from '@/lib/store/cart-store';
import { AddressCard } from './address-card';

function Section({
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
      {children}
    </section>
  );
}

export interface StepReviewProps {
  items: CartItem[];
  address: Address | null;
  method: PaymentMethod;
  totals: OrderTotals;
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  error?: string | null;
  onEdit: (step: 0 | 1) => void;
}

/** Checkout step ۳ — everything in one place plus the terms checkbox. */
export function StepReview({ items, address, method, totals, accepted, onAcceptedChange, error, onEdit }: StepReviewProps) {
  return (
    <div className="space-y-4">
      <Section icon={Package} title={`اقلام سفارش (${toPersianDigits(String(totals.count))})`}>
        <ul className="divide-y divide-border/50">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.images[0] && (
                  <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {toPersianDigits(String(quantity))} × {formatToman(effectivePrice(product))}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">{formatToman(effectivePrice(product) * quantity)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={MapPin} title="آدرس ارسال" onEdit={() => onEdit(0)}>
        {address ? (
          <AddressCard address={address} compact className="border-0 bg-transparent p-0" />
        ) : (
          <p className="text-sm text-destructive">آدرسی انتخاب نشده است.</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">زمان تحویل تقریبی: {SHIPPING.estimate}</p>
      </Section>

      <Section icon={CreditCard} title="روش پرداخت" onEdit={() => onEdit(1)}>
        <p className="text-sm font-medium">{PAYMENT_METHOD_LABELS[method] ?? method}</p>
      </Section>

      <section className="glass-effect-strong rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 font-bold">خلاصهٔ پرداخت</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">قیمت کالاها</dt>
            <dd className="tabular-nums">{formatToman(totals.listTotal)}</dd>
          </div>
          {totals.productDiscount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">تخفیف محصولات</dt>
              <dd className="tabular-nums text-success">− {formatToman(totals.productDiscount)}</dd>
            </div>
          )}
          {totals.couponDiscount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">کد تخفیف</dt>
              <dd className="tabular-nums text-success">− {formatToman(totals.couponDiscount)}</dd>
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
            <dd className="text-xl font-black text-secondary">{formatToman(totals.total)}</dd>
          </div>
        </dl>
      </section>

      <Checkbox
        id="accept-terms"
        variant="row"
        checked={accepted}
        onChange={(e) => onAcceptedChange(e.target.checked)}
        label={
          <>
            <Link href={ROUTES.TERMS} target="_blank" className="text-secondary underline-offset-4 hover:underline">
              قوانین و شرایط
            </Link>{' '}
            تکنو خان را خوانده‌ام و می‌پذیرم
          </>
        }
        error={!accepted && error ? error : undefined}
      />

      {error && accepted && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
