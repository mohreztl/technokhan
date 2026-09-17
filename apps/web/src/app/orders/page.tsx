import type { Metadata } from 'next';
import { OrdersList, OrdersListSkeleton } from '@/components/orders/orders-list';
import { AuthGate } from '@/components/profile/auth-gate';

export const metadata: Metadata = {
  title: 'سفارش‌های من',
  description: 'پیگیری وضعیت و جزئیات سفارش‌های شما',
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <div className="container-custom pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-black sm:text-3xl">سفارش‌های من</h1>
        <p className="mt-1 text-sm text-muted-foreground">پیگیری وضعیت ارسال و جزئیات هر سفارش</p>
      </header>
      <AuthGate title="برای مشاهدهٔ سفارش‌ها وارد شوید" skeleton={<OrdersListSkeleton />}>
        <OrdersList />
      </AuthGate>
    </div>
  );
}
