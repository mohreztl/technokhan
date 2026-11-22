import type { Metadata } from 'next';
import { ShopClient } from '@/components/storefront/shop-client';
import { getBrands, getCategories, getProducts } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';
import { JsonLd, breadcrumbJsonLd, getShopMetadata, productListJsonLd } from '@/lib/seo';

interface ShopPageProps {
  searchParams: Promise<ShopSearchParams>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  return getShopMetadata(await searchParams);
}

/** Filterable product index with URL-derived query and parallel metadata loading. */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = parseShopQuery(await searchParams);
  const [products, categories, brands] = await Promise.all([getProducts(query), getCategories(), getBrands()]);
  return (
    <>
      <ShopClient initialProducts={products.data} categories={categories} brands={brands} initialQuery={query} />
      <JsonLd data={[productListJsonLd(products.data.items, '/shop', 'محصولات فروشگاه تکنو خان'), breadcrumbJsonLd([{ name: 'خانه', href: '/' }, { name: 'فروشگاه', href: '/shop' }])]} />
    </>
  );
}
