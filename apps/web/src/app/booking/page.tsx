import { Metadata } from 'next';
import { BookingPageClient } from './client';

export const metadata: Metadata = {
  title: 'رزرو آنلاین | نوبت‌دهی خدمات اتولانژ',
  description: 'رزرو آنلاین خدمات دیتیلینگ، سرامیک کوتینگ، PPF و کاورینگ. انتخاب تاریخ و ساعت دلخواه',
  openGraph: {
    title: 'رزرو آنلاین خدمات اتولانژ',
    description: 'به سادگی نوبت خدمات مورد نظر خود را رزرو کنید',
  },
};

export default function BookingPage() {
  return <BookingPageClient />;
}
