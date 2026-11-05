import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, effectivePrice } from '@technokhan/shared';
import { ProductDetailsClient } from '@/components/storefront/product-details-client';
import { getProduct, getRelatedProducts } from '@/lib/data/repository';

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

/** ISR product page with related items and Product/Offer structured data. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [productResult, related] = await Promise.all([getProduct(slug), getRelatedProducts(slug, 4)]);
  if (!productResult) notFound();
  const product = productResult.data;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((image) => `https://technokhan.com${image}`),
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    aggregateRating: product.reviewCount ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
    offers: { '@type': 'Offer', url: `https://technokhan.com/product/${product.id}`, priceCurrency: 'IRR', price: effectivePrice(product) * 10, availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  };
  return (
    <>
      <ProductDetailsClient product={product} related={related} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    </>
  );
}
