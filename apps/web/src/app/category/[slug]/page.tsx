import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, findCategory } from '@technokhan/shared';
import { ShopClient } from '@/components/storefront/shop-client';
import { getBrands, getCategories, getProducts } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';
import { JsonLd, categoryPageJsonLd } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopSearchParams>;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.id }));
}

/** Category-specific metadata resolved from the shared catalog. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const category = findCategory((await params).slug);
  if (!category) return { title: 'دسته‌بندی پیدا نشد', robots: { index: false, follow: false } };
  const description = `خرید ${category.name} اورجینال از تکنو خان؛ ${category.description} با امکان فیلتر برند، قیمت، امتیاز و ویژگی فنی.`;
  return {
    title: `خرید ${category.name}`,
    description,
    keywords: [category.name, `خرید ${category.name}`, 'گجت اورجینال', 'تکنو خان'],
    alternates: { canonical: `/category/${category.id}` },
    openGraph: { title: `خرید ${category.name} | تکنو خان`, description, url: `/category/${category.id}`, images: [{ url: category.image, alt: category.name }] },
    twitter: { card: 'summary_large_image', title: `خرید ${category.name}`, description, images: [category.image] },
  };
}

/** Product category route using the same complete filter engine as the main shop. */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawQuery] = await Promise.all([params, searchParams]);
  const category = findCategory(slug);
  if (!category) notFound();
  const query = { ...parseShopQuery(rawQuery), category: category.id };
  const [products, categories, brands] = await Promise.all([getProducts(query), getCategories(), getBrands()]);
  return (
    <>
      <ShopClient initialProducts={products.data} categories={categories} brands={brands} initialQuery={query} lockedCategory={category} />
      <JsonLd data={categoryPageJsonLd(category, products.data.items)} />
    </>
  );
}
