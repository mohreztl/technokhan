import type { Metadata } from 'next';
import { CompareClient } from '@/components/storefront/compare-client';

export const metadata: Metadata = { title: 'مقایسه گجت‌ها', description: 'مقایسه قیمت، امتیاز و مشخصات فنی تا چهار گجت دیجیتال.', robots: { index: false, follow: false } };

/** Product comparison route backed by the persistent four-item compare store. */
export default function ComparePage() {
  return <CompareClient />;
}
