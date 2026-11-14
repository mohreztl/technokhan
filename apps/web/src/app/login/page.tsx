import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginClient } from './client';

export const metadata: Metadata = {
  title: 'ورود',
  description: 'ورود به حساب کاربری تکنو خان با شماره موبایل و کد تأیید پیامکی یا نام کاربری و رمز عبور',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60dvh]" />}>
      <LoginClient />
    </Suspense>
  );
}
