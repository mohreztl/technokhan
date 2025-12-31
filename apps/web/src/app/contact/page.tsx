import { Metadata } from 'next';
import { ContactPageClient } from './client';

export const metadata: Metadata = {
  title: 'تماس با ما | راه‌های ارتباطی اتولانژ',
  description: 'با ما در تماس باشید. آدرس، شماره تماس و فرم ارتباط با اتولانژ. مشاوره رایگان و پاسخگویی سریع',
  openGraph: {
    title: 'تماس با اتولانژ | مشاوره رایگان',
    description: 'با ما در تماس باشید. مشاوره رایگان و پاسخگویی سریع به سوالات شما',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
