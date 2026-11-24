import type { Metadata } from 'next';
import { AdminSettingsClient } from './client';

export const metadata: Metadata = {
  title: 'تنظیمات',
  description: 'ساعات کاری و اطلاعات تماس تکنو خان',
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
