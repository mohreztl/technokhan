import type { Metadata } from 'next';
import { AdminReviewsClient } from './client';

export const metadata: Metadata = {
  title: 'نظرات',
  description: 'بررسی و تأیید نظرات کاربران اتولانژ',
};

export default function AdminReviewsPage() {
  return <AdminReviewsClient />;
}
