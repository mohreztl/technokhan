import type { Metadata } from 'next';
import { ROUTES } from '@autolounge/shared';
import { getGallery } from '@/lib/data/repository';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { GalleryPage } from '@/components/pages/gallery-page';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'نمونه کارها | قبل و بعد پروژه‌های اتولانژ',
  description:
    'گالری قبل و بعد پروژه‌های واقعی اتولانژ؛ احیای رنگ، سرامیک بدنه، PPF، رپ و دیتیلینگ روی خودروهای مشتریان با جزئیات هر پروژه.',
  alternates: { canonical: ROUTES.GALLERY },
  openGraph: {
    title: 'نمونه کارهای اتولانژ',
    description: 'مقایسهٔ قبل و بعد پروژه‌های واقعی؛ نتیجهٔ کار تیم اتولانژ را با چشم خود ببینید.',
  },
};

export default async function Page() {
  const items = await getGallery();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'خانه', href: ROUTES.HOME },
          { name: 'نمونه کارها', href: ROUTES.GALLERY },
        ])}
      />
      <GalleryPage items={items} />
    </>
  );
}
