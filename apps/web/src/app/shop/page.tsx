import type { Metadata } from 'next';
import { ShopClient } from '@/components/storefront/shop-client';
import { getBrands, getCategories, getProducts } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';
import { JsonLd, breadcrumbJsonLd, productListJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'فروشگاه گجت و لوازم جانبی',
  description: 'خرید گجت هوشمند، شارژر، هدفون، پاوربانک و تجهیزات دیجیتال اورجینال با فیلتر برند، قیمت، امتیاز و مشخصات فنی.',
  keywords: ['فروشگاه گجت', 'خرید لوازم جانبی', 'شارژر', 'هدفون', 'پاوربانک', 'تکنو خان'],
  alternates: { canonical: '/shop' },
  openGraph: { title: 'فروشگاه گجت و لوازم جانبی | تکنو خان', description: 'جستجو، فیلتر و مقایسه گجت‌های اورجینال با گارانتی و ارسال قابل رهگیری.', url: '/shop' },
  twitter: { card: 'summary_large_image', title: 'فروشگاه تکنو خان', description: 'گجت درست را با فیلترهای دقیق پیدا کنید.' },
};

/** Filterable product index with URL-derived query and parallel metadata loading. */
export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const query = parseShopQuery(await searchParams);
  const [products, categories, brands] = await Promise.all([getProducts(query), getCategories(), getBrands()]);
  return (
    <>
      <ShopClient initialProducts={products.data} categories={categories} brands={brands} initialQuery={query} />
      <JsonLd data={[productListJsonLd(products.data.items, '/shop', 'محصولات فروشگاه تکنو خان'), breadcrumbJsonLd([{ name: 'خانه', href: '/' }, { name: 'فروشگاه', href: '/shop' }])]} />
    </>
  );
}
