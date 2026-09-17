import type { Metadata } from 'next';
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '@autolounge/shared';
import { getFeatured, getGallery } from '@/lib/data/repository';
import { JsonLd, localBusinessJsonLd, organizationJsonLd } from '@/lib/seo';
import { LandingPage } from '@/components/pages/landing-page';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `${APP_NAME} | ${APP_DESCRIPTION}` },
  description: `${APP_TAGLINE}. سرامیک بدنه، احیای رنگ، دیتیلینگ، رپ و PPF با گارانتی کتبی؛ رزرو آنلاین و فروشگاه محصولات مراقبت از خودرو.`,
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [featured, gallery] = await Promise.all([getFeatured(), getGallery()]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), localBusinessJsonLd()]} />
      <LandingPage
        products={featured.data.products}
        services={featured.data.services}
        gallery={gallery}
      />
    </>
  );
}
