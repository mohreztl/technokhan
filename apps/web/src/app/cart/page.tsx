import { Metadata } from 'next';
import { CartPageClient } from './client';

export const metadata: Metadata = {
  title: 'سبد خرید | مشاهده و مدیریت سفارش',
  description: 'مشاهده محصولات انتخاب شده، تغییر تعداد و تکمیل خرید در اتولانژ',
};

export default function CartPage() {
  return <CartPageClient />;
}
