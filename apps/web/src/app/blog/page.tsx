import type { Metadata } from 'next';
import { ARTICLE_CATEGORIES, ROUTES, sortedArticles } from '@autolounge/shared';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { BlogIndexClient } from './client';

export const metadata: Metadata = {
  title: 'مجلهٔ اتولانژ | راهنما و دانش مراقبت از خودرو',
  description:
    'مقاله‌های کاربردی دربارهٔ سرامیک، اصلاح رنگ، PPF و نگهداری روزمرهٔ خودرو — نوشتهٔ تکنسین‌های اتولانژ.',
  alternates: { canonical: ROUTES.BLOG },
  openGraph: {
    title: 'مجلهٔ اتولانژ',
    description: 'راهنماها و دانش فنی مراقبت از خودرو، از تجربهٔ کارگاه.',
  },
};

export default function BlogPage() {
  const articles = sortedArticles();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'خانه', href: ROUTES.HOME },
          { name: 'مجله', href: ROUTES.BLOG },
        ])}
      />
      <BlogIndexClient articles={articles} categories={ARTICLE_CATEGORIES} />
    </>
  );
}
