'use client';

import Link from 'next/link';
import { Banknote, CreditCard, ShieldCheck, Tag } from 'lucide-react';
import type { PaymentMethod } from '@autolounge/shared';
import { ROUTES, formatToman } from '@autolounge/shared';
import { Radio } from '@/components/ui/radio';
import { Textarea } from '@/components/ui/textarea';

/** Cash on delivery is only offered below this subtotal (Toman). */
export const COD_MAX_SUBTOTAL = 10_000_000;

export interface StepPaymentProps {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  subtotal: number;
  couponCode: string | null;
}

/** Checkout step ۲ — payment method, order notes and a coupon reminder. */
export function StepPayment({ method, onMethodChange, notes, onNotesChange, subtotal, couponCode }: StepPaymentProps) {
  const codAllowed = subtotal <= COD_MAX_SUBTOTAL;

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">روش پرداخت</legend>
        <Radio
          variant="card"
          name="payment-method"
          value="zarinpal"
          checked={method === 'zarinpal'}
          onChange={() => onMethodChange('zarinpal')}
          icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
          label="پرداخت آنلاین"
          description="امن و سریع از طریق درگاه زرین‌پال؛ همهٔ کارت‌های عضو شتاب"
          trailing={
            <span className="flex items-center gap-1 text-xs text-success">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              امن
            </span>
          }
        />
        <Radio
          variant="card"
          name="payment-method"
          value="cod"
          checked={method === 'cod'}
          disabled={!codAllowed}
          onChange={() => onMethodChange('cod')}
          icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
          label="پرداخت در محل"
          description={
            codAllowed
              ? 'پرداخت نقدی یا با کارت هنگام تحویل'
              : `برای سفارش‌های بالای ${formatToman(COD_MAX_SUBTOTAL)} فقط پرداخت آنلاین ممکن است`
          }
        />
      </fieldset>

      <Textarea
        id="order-notes"
        label="توضیحات سفارش (اختیاری)"
        rows={3}
        maxLength={500}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="مثلاً: لطفاً قبل از ارسال تماس بگیرید"
      />

      <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
        <Tag className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
        {couponCode ? (
          <p>
            کد تخفیف <span className="font-mono font-bold">{couponCode}</span> روی این سفارش اعمال شده است.
          </p>
        ) : (
          <p>
            کد تخفیف دارید؟{' '}
            <Link href={ROUTES.CART} className="font-medium text-secondary underline-offset-4 hover:underline">
              در سبد خرید وارد کنید
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
