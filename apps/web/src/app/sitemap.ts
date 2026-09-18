import type { MetadataRoute } from 'next';
import { sortedArticles } from '@autolounge/shared';
import { getProducts, getServices } from '@/lib/data/repository';
import { siteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const [products, services] = await Promise.all([
    getProducts({ limit: 500 }),
    getServices({ limit: 100 }),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/booking`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/track`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.data.items.map((p) => ({
    url: `${base}/products/${p.id}`,
    lastModified: new Date(p.updatedAt as string),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = services.data.items.map((s) => ({
    url: `${base}/services/${s.id}`,
    lastModified: new Date(s.updatedAt as string),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = sortedArticles().map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  return [...statics, ...servicePages, ...productPages, ...articlePages];
}
