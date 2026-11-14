// Export everything needed for the migration from the old WordPress site:
//   posts.xml data (as JSON), WooCommerce products, categories, and the URL list for SEO.
//
//   pnpm --filter api migrate:export-wp
//
// User passwords are NOT available through the REST API; the users export
// (with user_pass hashes) comes from WP-CLI or an export plugin as users.json:
//   wp user list --format=json --fields=ID,user_login,user_email,display_name,user_pass > users.json
import fs from 'node:fs';
import path from 'node:path';
import { fetchAllPages, requireWp, saveExport, wpClient, wcClient, EXPORT_DIR } from './migration-utils';

async function run() {
  requireWp();
  const wp = wpClient();

  console.log('exporting posts…');
  const posts = await fetchAllPages(wp, '/wp/v2/posts', { _embed: '1', status: 'any' });
  saveExport('posts.json', posts);

  console.log('exporting post categories…');
  const postCategories = await fetchAllPages(wp, '/wp/v2/categories');
  saveExport('post-categories.json', postCategories);

  console.log('exporting pages…');
  const pages = await fetchAllPages(wp, '/wp/v2/pages', { status: 'any' });
  saveExport('pages.json', pages);

  const wc = wcClient();

  console.log('exporting products…');
  const products = await fetchAllPages(wc, '/products');
  saveExport('products.json', products);

  console.log('exporting product categories…');
  const productCategories = await fetchAllPages(wc, '/products/categories');
  saveExport('product-categories.json', productCategories);

  // Full URL list for the redirect map (SEO). WP-CLI variant is faster on big sites:
  //   wp post list --post_type=post,page,product --field=url --posts_per_page=-1
  console.log('exporting URL list…');
  const urls: string[] = [];
  for (const collection of [posts, pages]) {
    for (const item of collection as Array<{ link?: string }>) {
      if (item.link) urls.push(item.link);
    }
  }
  try {
    const wcProducts = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'products.json'), 'utf-8')) as Array<{ permalink?: string }>;
    for (const product of wcProducts) if (product.permalink) urls.push(product.permalink);
  } catch {
    // products.json was just written; never missing
  }
  saveExport('all-urls.txt', urls as unknown as never[]);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
