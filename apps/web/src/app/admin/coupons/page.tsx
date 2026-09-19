import type { Metadata } from 'next';
import { AdminCouponsClient } from './client';

export const metadata: Metadata = {
  title: 'کدهای تخفیف',
  description: 'ساخت و مدیریت کدهای تخفیف اتولانژ',
};

export default function AdminCouponsPage() {
  return <AdminCouponsClient />;
}
