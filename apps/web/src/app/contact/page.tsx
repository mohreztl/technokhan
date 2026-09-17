import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ROUTES } from '@autolounge/shared';
import { JsonLd, breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo';
import { PageSkeleton } from '@/components/molecules/loading-skeletons';
import { ContactPageClient } from './client';

export const metadata: Metadata = {
  title: 'تماس با ما | راه‌های ارتباطی اتولانژ',
  description:
    'آدرس، شماره تماس، ساعات کاری و فرم ارتباط با اتولانژ؛ مشاورهٔ رایگان و پاسخ‌گویی سریع به سؤالات شما دربارهٔ خدمات و محصولات.',
  alternates: { canonical: ROUTES.CONTACT },
  openGraph: {
    title: 'تماس با اتولانژ | مشاورهٔ رایگان',
    description: 'با ما در تماس باشید؛ مشاورهٔ رایگان و پاسخ‌گویی سریع.',
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(),
          breadcrumbJsonLd([
            { name: 'خانه', href: ROUTES.HOME },
            { name: 'تماس با ما', href: ROUTES.CONTACT },
          ]),
        ]}
      />
      <Suspense fallback={<PageSkeleton rows={3} />}>
        <ContactPageClient />
      </Suspense>
    </>
  );
}
