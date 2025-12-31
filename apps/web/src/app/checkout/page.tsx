import { Metadata } from 'next';
import { CheckoutPageClient } from './client';

export const metadata: Metadata = {
  title: 'تکمیل خرید | ثبت سفارش در اتولانژ',
  description: 'ورود اطلاعات ارسال و پرداخت امن برای تکمیل سفارش',
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
