import type { Metadata } from 'next';
import { AdminSettingsClient } from './client';

export const metadata: Metadata = {
  title: 'تنظیمات',
  description: 'ساعات کاری، روزهای تعطیل و اطلاعات تماس اتولانژ',
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
