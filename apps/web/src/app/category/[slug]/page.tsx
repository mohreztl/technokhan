import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { STORE_CATEGORIES, findStoreCategory } from '@technokhan/shared';
import { ShopClient } from '@/components/storefront/shop-client';
import { getProducts, getStoreBrands, getStoreCategories } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';
import { JsonLd, categoryPageJsonLd } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopSearchParams>;
}

export function generateStaticParams() {
  return STORE_CATEGORIES.map((category) => ({ slug: category.slug }));
}

/** Category-specific metadata resolved from the store taxonomy. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = findStoreCategory(slug);
  if (!category) {
    // raw (non-taxonomy) category names still get an indexable page
    const name = decodeURIComponent(slug);
    const { data } = await getProducts({ category: name, limit: 1 });
    if (!data.pagination?.total) return { title: 'دسته‌بندی پیدا نشد', robots: { index: false, follow: false } };
    const description = `خرید ${name} اورجینال از تکنو خان با ضمانت اصالت کالا، فیلتر برند و قیمت و ارسال سریع.`;
    return {
      title: `خرید ${name}`,
      description,
      alternates: { canonical: `/category/${encodeURIComponent(name)}` },
      openGraph: { title: `خرید ${name} | تکنو خان`, description, url: `/category/${encodeURIComponent(name)}` },
    };
  }
  const description = `خرید ${category.name} اورجینال از تکنو خان؛ ${category.description} با امکان فیلتر برند، قیمت، امتیاز و ویژگی فنی.`;
  return {
    title: `خرید ${category.name}`,
    description,
    keywords: [...category.keywords, 'گجت اورجینال', 'تکنو خان'],
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `خرید ${category.name} | تکنو خان`,
      description,
      url: `/category/${category.slug}`,
      ...(category.image ? { images: [{ url: category.image, alt: category.name }] } : {}),
    },
    twitter: { card: 'summary_large_image', title: `خرید ${category.name}`, description, ...(category.image ? { images: [category.image] } : {}) },
  };
}

/** Product category route backed by the store taxonomy and the full shop filter engine. */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawQuery] = await Promise.all([params, searchParams]);
  const decoded = decodeURIComponent(slug);
  const category = findStoreCategory(decoded);

  // legacy bundled ids (e.g. /category/chargers) consolidate onto the canonical page
  if (category && category.slug !== decoded && !STORE_CATEGORIES.some((c) => c.slug === decoded)) {
    permanentRedirect(`/category/${category.slug}`);
  }

  const name = category?.name ?? decoded;
  const query = { ...parseShopQuery(rawQuery), category: category?.slug ?? decoded };
  const [products, categories, brands] = await Promise.all([getProducts(query), getStoreCategories(), getStoreBrands()]);

  if (!category && !products.data.pagination?.total) notFound();

  const lockedCategory = { id: category?.slug ?? decoded, name, description: category?.description };
  return (
    <>
      <ShopClient initialProducts={products.data} categories={categories.map((c) => ({ id: c.slug, name: c.name }))} brands={brands} initialQuery={query} lockedCategory={lockedCategory} />
      <JsonLd data={categoryPageJsonLd(lockedCategory, products.data.items)} />
    </>
  );
}
