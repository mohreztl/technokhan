import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata: Metadata = {
  title: 'تکمیل خرید | ثبت سفارش در اتولانژ',
  description: 'ورود اطلاعات ارسال و پرداخت امن برای تکمیل سفارش',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFlow />
    </Suspense>
  );
}
