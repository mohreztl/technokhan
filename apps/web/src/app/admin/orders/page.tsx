import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminOrdersClient } from './client';

export const metadata: Metadata = {
  title: 'سفارش‌ها',
  description: 'مدیریت سفارش‌های فروشگاه اتولانژ',
};

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminOrdersClient />
    </Suspense>
  );
}
