import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminServicesClient } from './client';

export const metadata: Metadata = {
  title: 'خدمات',
  description: 'مدیریت خدمات اتولانژ',
};

export default function AdminServicesPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminServicesClient />
    </Suspense>
  );
}
