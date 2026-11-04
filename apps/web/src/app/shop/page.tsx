import type { Metadata } from 'next';
import { ShopClient } from '@/components/storefront/shop-client';
import { getBrands, getCategories, getProducts } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';

export const metadata: Metadata = {
  title: 'فروشگاه گجت و لوازم جانبی',
  description: 'خرید گجت هوشمند، شارژر، هدفون، پاوربانک و تجهیزات دیجیتال با فیلتر برند، قیمت و مشخصات.',
};

/** Filterable product index with URL-derived query and parallel metadata loading. */
export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const query = parseShopQuery(await searchParams);
  const [products, categories, brands] = await Promise.all([getProducts(query), getCategories(), getBrands()]);
  return <ShopClient initialProducts={products.data} categories={categories} brands={brands} initialQuery={query} />;
}
