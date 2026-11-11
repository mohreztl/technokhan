import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PRODUCTS, findCategory } from '@technokhan/shared';

test('builds product and breadcrumb graphs for a product page', async () => {
  const seo = await import('./seo').catch(() => ({ productPageJsonLd: undefined }));
  assert.equal(typeof seo.productPageJsonLd, 'function');
  if (!seo.productPageJsonLd) return;

  const product = PRODUCTS[0]!;
  const graphs = seo.productPageJsonLd(product);
  assert.equal(graphs[0]?.['@type'], 'Product');
  assert.equal(graphs[1]?.['@type'], 'BreadcrumbList');
  const items = graphs[1]?.itemListElement as { name: string }[];
  assert.deepEqual(items.map((item) => item.name), ['خانه', 'فروشگاه', findCategory(product.category)?.name ?? product.category, product.name]);
});
