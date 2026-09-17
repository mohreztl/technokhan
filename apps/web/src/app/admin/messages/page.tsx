import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminMessagesClient } from './client';

export const metadata: Metadata = {
  title: 'پیام‌ها',
  description: 'پیام‌های دریافتی از فرم تماس اتولانژ',
};

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminMessagesClient />
    </Suspense>
  );
}
