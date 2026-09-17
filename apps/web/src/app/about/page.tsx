import type { Metadata } from 'next';
import { ROUTES } from '@autolounge/shared';
import { JsonLd, breadcrumbJsonLd, organizationJsonLd } from '@/lib/seo';
import { AboutPageClient } from './client';

export const metadata: Metadata = {
  title: 'درباره ما | داستان و تیم اتولانژ',
  description:
    'آشنایی با اتولانژ، مرکز تخصصی مراقبت و زیبایی خودرو در تهران؛ تیم متخصص دارای مدرک، گواهی‌نامه‌های بین‌المللی و بیش از ۱۵ سال تجربه.',
  alternates: { canonical: ROUTES.ABOUT },
  openGraph: {
    title: 'درباره اتولانژ | مرکز تخصصی مراقبت از خودرو',
    description: 'داستان اتولانژ، ارزش‌های ما، تیم متخصص و گواهی‌نامه‌های بین‌المللی.',
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: 'خانه', href: ROUTES.HOME },
            { name: 'درباره ما', href: ROUTES.ABOUT },
          ]),
        ]}
      />
      <AboutPageClient />
    </>
  );
}
