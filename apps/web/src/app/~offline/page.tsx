import type { Metadata } from 'next';
import { OfflineClient } from './client';

export const metadata: Metadata = {
  title: 'آفلاین هستید',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineClient />;
}
