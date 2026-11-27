import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STORE_BRANDS, findStoreBrand } from '@technokhan/shared';
import { ShopClient } from '@/components/storefront/shop-client';
import { getProducts, getStoreBrands, getStoreCategories } from '@/lib/data/repository';
import { parseShopQuery, type ShopSearchParams } from '@/lib/shop-query';
import { JsonLd, breadcrumbJsonLd, productListJsonLd } from '@/lib/seo';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopSearchParams>;
}

export function generateStaticParams() {
  return STORE_BRANDS.map((brand) => ({ slug: brand.id }));
}

/** Brand-specific metadata; unknown brands stay indexable only when they have products. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = findStoreBrand(slug);
  if (!brand) {
    const name = decodeURIComponent(slug);
    const { data } = await getProducts({ brands: [name], limit: 1 });
    if (!data.pagination?.total) return { title: 'برند پیدا نشد', robots: { index: false, follow: false } };
    const description = `خرید محصولات ${name} اورجینال از تکنو خان با ضمانت اصالت کالا و ارسال سریع.`;
    return {
      title: `خرید محصولات ${name}`,
      description,
      alternates: { canonical: `/brand/${encodeURIComponent(name)}` },
      openGraph: { title: `خرید محصولات ${name} | تکنو خان`, description, url: `/brand/${encodeURIComponent(name)}` },
    };
  }
  const description = `خرید محصولات ${brand.nameFa} (${brand.name}) اورجینال از تکنو خان؛ جدیدترین کالاهای ${brand.nameFa} با ضمانت اصالت، گارانتی معتبر و فیلتر قیمت و دسته‌بندی.`;
  return {
    title: `خرید محصولات ${brand.nameFa}`,
    description,
    keywords: [`خرید ${brand.nameFa}`, `محصولات ${brand.name}`, `${brand.name} ایران`, 'تکنو خان'],
    alternates: { canonical: `/brand/${brand.id}` },
    openGraph: { title: `خرید محصولات ${brand.nameFa} | تکنو خان`, description, url: `/brand/${brand.id}` },
    twitter: { card: 'summary', title: `خرید محصولات ${brand.nameFa}`, description },
  };
}

/** Dedicated brand page: the full shop engine locked onto one brand. */
export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const [{ slug }, rawQuery] = await Promise.all([params, searchParams]);
  const decoded = decodeURIComponent(slug);
  const brand = findStoreBrand(decoded);
  const brandName = brand?.name ?? decoded;

  const query = { ...parseShopQuery(rawQuery), brands: [brandName] };
  const [products, categories, brands] = await Promise.all([getProducts(query), getStoreCategories(), getStoreBrands()]);

  if (!brand && !products.data.pagination?.total) notFound();

  const displayName = brand?.nameFa ?? brandName;
  return (
    <>
      <ShopClient
        initialProducts={products.data}
        categories={categories.map((c) => ({ id: c.slug, name: c.name }))}
        brands={brands}
        initialQuery={query}
        lockedBrand={{
          id: brand?.id ?? decoded,
          name: `محصولات ${displayName}`,
          nameFa: displayName,
          description: brand ? `همه‌ی محصولات اورجینال ${brand.nameFa} (${brand.name}) با ضمانت اصالت کالا و گارانتی معتبر.` : undefined,
        }}
      />
      <JsonLd
        data={[
          productListJsonLd(products.data.items, `/brand/${brand?.id ?? encodeURIComponent(decoded)}`, `محصولات ${displayName}`),
          breadcrumbJsonLd([
            { name: 'خانه', href: '/' },
            { name: 'برندها', href: '/brands' },
            { name: displayName, href: `/brand/${brand?.id ?? encodeURIComponent(decoded)}` },
          ]),
        ]}
      />
    </>
  );
}
