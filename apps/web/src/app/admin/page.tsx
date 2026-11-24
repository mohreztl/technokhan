import type { Metadata } from 'next';
import { AdminDashboardClient } from './client';

export const metadata: Metadata = {
  title: 'داشبورد',
  description: 'خلاصهٔ وضعیت سفارش‌ها، کاربران و پیام‌های تکنو خان',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
