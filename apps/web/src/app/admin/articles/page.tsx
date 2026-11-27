import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminArticlesClient } from './client';

export const metadata: Metadata = {
  title: 'مقالات',
  description: 'مدیریت مقالات مجله تکنو خان',
};

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminArticlesClient />
    </Suspense>
  );
}
