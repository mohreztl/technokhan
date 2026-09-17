import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentCallbackClient, PaymentCallbackSkeleton } from './client';

export const metadata: Metadata = {
  title: 'نتیجهٔ پرداخت',
  description: 'بررسی و تأیید پرداخت شما',
  robots: { index: false, follow: false },
};

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackSkeleton />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}
