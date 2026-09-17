import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ROUTES, SERVICES, SERVICE_TYPE_LABELS, findGalleryByService } from '@autolounge/shared';
import { getRelatedServices, getService } from '@/lib/data/repository';
import { absoluteUrl } from '@/lib/site';
import { JsonLd, breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { ServiceDetailClient } from './client';

type Params = Promise<{ id: string }>;

export const dynamicParams = true;
export const revalidate = 300;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ id: service.id }));
}

const toAbsolute = (path: string) => (/^https?:\/\//i.test(path) ? path : absoluteUrl(path));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const result = await getService(id);
  if (!result) {
    return { title: 'خدمت یافت نشد', robots: { index: false, follow: false } };
  }
  const service = result.data;
  const path = `${ROUTES.SERVICES}/${service.id}`;
  const description = service.description.slice(0, 160);
  const image = service.images[0] ? toAbsolute(service.images[0]) : undefined;

  return {
    title: `${service.name} | ${SERVICE_TYPE_LABELS[service.type] ?? ''}`.replace(/ \| $/, ''),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: service.name,
      description,
      url: path,
      images: image ? [{ url: image, alt: service.name }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: service.name, description },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getService(id);
  if (!result) notFound();

  const service = result.data;
  const related = await getRelatedServices(service.id, 3);
  const gallery = findGalleryByService(service.id);
  const path = `${ROUTES.SERVICES}/${service.id}`;

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(service, absoluteUrl(path)),
          breadcrumbJsonLd([
            { name: 'خانه', href: ROUTES.HOME },
            { name: 'خدمات', href: ROUTES.SERVICES },
            {
              name: SERVICE_TYPE_LABELS[service.type] ?? service.type,
              href: `${ROUTES.SERVICES}?type=${service.type}`,
            },
            { name: service.name, href: path },
          ]),
        ]}
      />
      <ServiceDetailClient service={service} related={related} gallery={gallery} />
    </>
  );
}
