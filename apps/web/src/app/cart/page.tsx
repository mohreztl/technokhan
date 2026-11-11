import { Metadata } from 'next';
import { CartPageClient } from './client';

export const metadata: Metadata = {
  title: 'سبد خرید | مشاهده و مدیریت سفارش',
  description: 'مشاهده گجت‌های انتخاب‌شده، تغییر تعداد، کد تخفیف و تکمیل خرید در تکنو خان',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
