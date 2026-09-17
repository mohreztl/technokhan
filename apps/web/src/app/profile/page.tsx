import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileClient } from './client';

export const metadata: Metadata = {
  title: 'پروفایل کاربری',
  description: 'مدیریت حساب کاربری، مشاهده سفارشات و رزروها در اتولانژ',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileClient />
    </Suspense>
  );
}
