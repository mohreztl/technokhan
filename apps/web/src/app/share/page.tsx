import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SharePageClient } from './client';

export const metadata: Metadata = {
  title: 'اشتراک‌گذاری با تکنو خان',
  description: 'محتوای اشتراک‌گذاری‌شده را در تکنو خان جستجو کنید.',
  robots: { index: false, follow: false },
};

/** PWA share-target landing page. */
export default function SharePage() {
  return <Suspense fallback={null}><SharePageClient /></Suspense>;
}
