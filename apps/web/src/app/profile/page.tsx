import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileClient } from './client';

export const metadata: Metadata = {
  title: 'پروفایل کاربری',
  description: 'مدیریت حساب تکنو خان، سفارش‌ها، اعلان‌ها، علاقه‌مندی‌ها، بازدیدهای اخیر و آدرس‌ها.',
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
