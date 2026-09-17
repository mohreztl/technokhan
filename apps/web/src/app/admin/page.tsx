import type { Metadata } from 'next';
import { AdminDashboardClient } from './client';

export const metadata: Metadata = {
  title: 'داشبورد',
  description: 'خلاصهٔ وضعیت سفارش‌ها، رزروها، کاربران و پیام‌های اتولانژ',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
