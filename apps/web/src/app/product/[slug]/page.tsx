import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@technokhan/shared';
import { ProductDetailsClient } from '@/components/storefront/product-details-client';
import { getProduct, getRelatedProducts } from '@/lib/data/repository';
import { JsonLd, productPageJsonLd } from '@/lib/seo';

interface ProductPageProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.id }));
}

/** Product-specific social, search and canonical metadata. */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const result = await getProduct((await params).slug);
  if (!result) return { title: 'محصول پیدا نشد' };
  const product = result.data;
  return {
    title: product.name,
    description: product.shortDescription ?? product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.id}` },
    openGraph: { title: product.name, description: product.shortDescription, images: [{ url: product.images[0]!, width: 1200, height: 1200, alt: product.name }] },
  };
}

/** ISR product page with related items, Product/Offer data and breadcrumbs. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [productResult, related] = await Promise.all([getProduct(slug), getRelatedProducts(slug, 4)]);
  if (!productResult) notFound();
  const product = productResult.data;
  return (
    <>
      <ProductDetailsClient product={product} related={related} />
      <JsonLd data={productPageJsonLd(product)} />
    </>
  );
}
