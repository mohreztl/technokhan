import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminBookingsClient } from './client';

export const metadata: Metadata = {
  title: 'رزروها',
  description: 'مدیریت رزرو خدمات اتولانژ',
};

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminBookingsClient />
    </Suspense>
  );
}
