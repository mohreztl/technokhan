import type { MetadataRoute } from 'next';
import { STORE_BRANDS, STORE_CATEGORIES, sortedArticles } from '@technokhan/shared';
import { getProducts } from '@/lib/data/repository';
import { siteUrl } from '@/lib/site';

export const revalidate = 3600;

/** Canonical sitemap limited to the public TechnoKhan storefront and magazine. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const products = await getProducts({ limit: 500 });
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/track`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
  const categoryPages: MetadataRoute.Sitemap = STORE_CATEGORIES.map((category) => ({ url: `${base}/category/${category.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }));
  const brandPages: MetadataRoute.Sitemap = STORE_BRANDS.map((brand) => ({ url: `${base}/brand/${brand.id}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }));
  const productPages: MetadataRoute.Sitemap = products.data.items.map((product) => ({ url: `${base}/product/${product.id}`, lastModified: new Date(product.updatedAt as string), changeFrequency: 'weekly', priority: 0.8 }));
  const articlePages: MetadataRoute.Sitemap = sortedArticles().map((article) => ({ url: `${base}/blog/${article.slug}`, lastModified: new Date(article.updatedAt ?? article.publishedAt), changeFrequency: 'yearly', priority: 0.7 }));
  return [...staticPages, ...categoryPages, ...brandPages, ...productPages, ...articlePages];
}
