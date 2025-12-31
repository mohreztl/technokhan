/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://autolounge.ir',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/admin/*', '/_next/*', '/404', '/500'],
  
  // Additional paths for dynamic content
  additionalPaths: async (config) => {
    const result = [];
    
    // Add product pages (in production, fetch from API)
    const productIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    productIds.forEach((id) => {
      result.push({
        loc: `/products/${id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    });
    
    // Add service pages (in production, fetch from API)
    const serviceIds = ['1', '2', '3', '4', '5'];
    serviceIds.forEach((id) => {
      result.push({
        loc: `/services/${id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    });
    
    return result;
  },
  
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://autolounge.ir/sitemap.xml',
    ],
  },
  
  transform: async (config, path) => {
    // Custom transform for specific pages
    const customPriority = {
      '/': 1.0,
      '/products': 0.9,
      '/services': 0.9,
      '/about': 0.6,
      '/contact': 0.6,
      '/booking': 0.8,
    };
    
    const customChangefreq = {
      '/': 'daily',
      '/products': 'daily',
      '/services': 'weekly',
    };
    
    return {
      loc: path,
      changefreq: customChangefreq[path] || config.changefreq,
      priority: customPriority[path] || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
