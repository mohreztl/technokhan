import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/checkout', '/profile', '/orders', '/cart', '/wishlist', '/login', '/~offline', '/payment/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
