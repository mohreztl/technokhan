import { MetadataRoute } from 'next';

const BASE_URL = process.env.SITE_URL || 'https://autolounge.ir';

// In production, these would come from your database/API
async function getProductIds(): Promise<string[]> {
  // Mock data - replace with actual API call
  return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
}

async function getServiceIds(): Promise<string[]> {
  // Mock data - replace with actual API call
  return ['1', '2', '3', '4', '5'];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productIds = await getProductIds();
  const serviceIds = await getServiceIds();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${BASE_URL}/products/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic service pages
  const servicePages: MetadataRoute.Sitemap = serviceIds.map((id) => ({
    url: `${BASE_URL}/services/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages, ...servicePages];
}
