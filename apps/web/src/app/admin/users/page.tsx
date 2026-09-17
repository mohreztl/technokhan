import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminLoading from '../loading';
import { AdminUsersClient } from './client';

export const metadata: Metadata = {
  title: 'کاربران',
  description: 'مدیریت کاربران اتولانژ',
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminUsersClient />
    </Suspense>
  );
}
