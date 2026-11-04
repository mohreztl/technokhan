import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, findCategory } from '@autolounge/shared';
import { ShopClient } from '@/components/storefront/shop-client';
import { getBrands, getCategories, getProducts } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';

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
  if (!category) return { title: 'دسته‌بندی پیدا نشد' };
  return { title: category.name, description: category.description, alternates: { canonical: `/category/${category.id}` } };
}

/** Product category route using the same complete filter engine as the main shop. */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawQuery] = await Promise.all([params, searchParams]);
  const category = findCategory(slug);
  if (!category) notFound();
  const query = { ...parseShopQuery(rawQuery), category: category.id };
  const [products, categories, brands] = await Promise.all([getProducts(query), getCategories(), getBrands()]);
  return <ShopClient initialProducts={products.data} categories={categories} brands={brands} initialQuery={query} lockedCategory={category} />;
}
