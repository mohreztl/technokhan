import type { Metadata } from 'next';
import { ROUTES, SERVICES } from '@autolounge/shared';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { CompareClient } from './client';

export const metadata: Metadata = {
  title: 'مقایسهٔ خدمات | کدام خدمت مناسب خودروی شماست؟',
  description:
    'قیمت، مدت اجرا، گارانتی و ویژگی‌های خدمات اتولانژ را کنار هم ببینید و آگاهانه انتخاب کنید.',
  alternates: { canonical: ROUTES.COMPARE },
  openGraph: {
    title: 'مقایسهٔ خدمات اتولانژ',
    description: 'قیمت، مدت و گارانتی خدمات را کنار هم ببینید.',
  },
};

export default function ComparePage() {
  const services = SERVICES.filter((s) => s.isActive !== false);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'خانه', href: ROUTES.HOME },
          { name: 'خدمات', href: ROUTES.SERVICES },
          { name: 'مقایسه', href: ROUTES.COMPARE },
        ])}
      />
      <CompareClient services={services} />
    </>
  );
}
