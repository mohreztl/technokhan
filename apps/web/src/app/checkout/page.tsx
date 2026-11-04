import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata: Metadata = {
  title: 'تکمیل خرید | ثبت سفارش در تکنو خان',
  description: 'ورود اطلاعات گیرنده، بررسی هزینه ارسال و ثبت سفارش در حالت امن',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFlow />
    </Suspense>
  );
}
