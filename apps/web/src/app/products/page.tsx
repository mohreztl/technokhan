import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PRODUCT_BRANDS, PRODUCT_CATEGORY_LABELS, ROUTES } from '@autolounge/shared';
import { getProducts } from '@/lib/data/repository';
import { localPriceBounds } from '@/lib/data/local-query';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { parseProductQuery, productQueryHref } from '@/components/catalog/product-query';
import { ProductList } from '@/components/catalog/product-list';
import { ProductListSkeleton } from '@/components/molecules/loading-skeletons';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pageTitle(category?: string, search?: string): string {
  if (search) return `جستجوی «${search}» در فروشگاه`;
  if (category) return `محصولات ${PRODUCT_CATEGORY_LABELS[category] ?? category}`;
  return 'فروشگاه محصولات مراقبت از خودرو';
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const q = parseProductQuery(await searchParams);
  const title = pageTitle(q.category, q.search);
  const categoryLabel = q.category ? PRODUCT_CATEGORY_LABELS[q.category] : undefined;
  const description = categoryLabel
    ? `خرید محصولات ${categoryLabel} با ضمانت اصالت و ارسال سریع از فروشگاه اتولانژ؛ همان محصولاتی که در سالن دیتیلینگ ما استفاده می‌شود.`
    : 'خرید آنلاین محصولات دیتیلینگ، واکس و پولیش، شامپو، سرامیک و لوازم جانبی خودرو با ضمانت اصالت و ارسال سریع از فروشگاه اتولانژ.';
  const canonical = q.category ? `${ROUTES.PRODUCTS}?category=${q.category}` : ROUTES.PRODUCTS;

  return {
    title,
    description,
    alternates: { canonical },
    robots: q.search || q.page ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: canonical },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = parseProductQuery(await searchParams);
  const { data } = await getProducts(q);
  const priceBounds = localPriceBounds();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'خانه', href: ROUTES.HOME },
          { name: 'فروشگاه', href: ROUTES.PRODUCTS },
          ...(q.category
            ? [
                {
                  name: PRODUCT_CATEGORY_LABELS[q.category] ?? q.category,
                  href: productQueryHref(ROUTES.PRODUCTS, { category: q.category }),
                },
              ]
            : []),
        ])}
      />
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList
          initialQuery={q}
          initialData={data}
          categories={PRODUCT_CATEGORY_LABELS}
          brands={PRODUCT_BRANDS}
          priceBounds={priceBounds}
          title={pageTitle(q.category, q.search)}
        />
      </Suspense>
    </>
  );
}
