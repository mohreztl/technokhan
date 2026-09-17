import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DemoGatewayClient } from './client';

export const metadata: Metadata = {
  title: 'درگاه پرداخت نمایشی',
  robots: { index: false, follow: false },
};

export default function DemoGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-[50dvh]" />}>
      <DemoGatewayClient />
    </Suspense>
  );
}
