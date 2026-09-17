import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, PRODUCT_CATEGORY_LABELS, ROUTES } from '@autolounge/shared';
import { getProduct, getRelatedProducts } from '@/lib/data/repository';
import { absoluteUrl } from '@/lib/site';
import { JsonLd, breadcrumbJsonLd, productJsonLd } from '@/lib/seo';
import { ProductDetailClient } from './client';

type Params = Promise<{ id: string }>;

export const dynamicParams = true;
export const revalidate = 300;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

const toAbsolute = (path: string) => (/^https?:\/\//i.test(path) ? path : absoluteUrl(path));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const result = await getProduct(id);
  if (!result) {
    return { title: 'محصول یافت نشد', robots: { index: false, follow: false } };
  }
  const product = result.data;
  const path = `${ROUTES.PRODUCTS}/${product.id}`;
  const description = product.shortDescription ?? product.description.slice(0, 160);
  const image = product.images[0] ? toAbsolute(product.images[0]) : undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: path,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: product.name, description },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getProduct(id);
  if (!result) notFound();

  const product = result.data;
  const related = await getRelatedProducts(product.id, 4);
  const path = `${ROUTES.PRODUCTS}/${product.id}`;

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, absoluteUrl(path)),
          breadcrumbJsonLd([
            { name: 'خانه', href: ROUTES.HOME },
            { name: 'فروشگاه', href: ROUTES.PRODUCTS },
            {
              name: PRODUCT_CATEGORY_LABELS[product.category] ?? product.category,
              href: `${ROUTES.PRODUCTS}?category=${product.category}`,
            },
            { name: product.name, href: path },
          ]),
        ]}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
