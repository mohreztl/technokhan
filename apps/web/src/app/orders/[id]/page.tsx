import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderDetail, OrderDetailSkeleton } from '@/components/orders/order-detail';
import { AuthGate } from '@/components/profile/auth-gate';

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: 'جزئیات سفارش',
  description: 'وضعیت، اقلام و اطلاعات پرداخت سفارش شما',
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return (
    <div className="container-custom pb-16">
      <Suspense fallback={<OrderDetailSkeleton />}>
        <AuthGate title="برای مشاهدهٔ سفارش وارد شوید" skeleton={<OrderDetailSkeleton />}>
          <OrderDetail id={id} />
        </AuthGate>
      </Suspense>
    </div>
  );
}
