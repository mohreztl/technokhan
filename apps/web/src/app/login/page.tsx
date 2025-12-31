import { Metadata } from 'next';
import { LoginClient } from './client';

export const metadata: Metadata = {
  title: 'ورود | اتولانژ',
  description: 'ورود به حساب کاربری اتولانژ برای دسترسی به خدمات و محصولات ویژه',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
