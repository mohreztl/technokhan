import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/molecules/loading-skeletons';
import { SharePageClient } from './client';

export const metadata: Metadata = {
  title: 'اشتراک‌گذاری با اتولانژ',
  description: 'محتوای اشتراک‌گذاری‌شده را در اتولانژ جستجو کنید.',
  robots: { index: false, follow: false },
};

export default function SharePage() {
  return (
    <Suspense fallback={<PageSkeleton rows={1} />}>
      <SharePageClient />
    </Suspense>
  );
}
