import { Metadata } from 'next';
import { ProfileClient } from './client';

export const metadata: Metadata = {
  title: 'پروفایل کاربری | اتولانژ',
  description: 'مدیریت حساب کاربری، مشاهده سفارشات و رزروها در اتولانژ',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
