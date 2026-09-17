import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminProductsClient } from './client';

export const metadata: Metadata = {
  title: 'محصولات',
  description: 'مدیریت محصولات فروشگاه اتولانژ',
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminProductsClient />
    </Suspense>
  );
}
