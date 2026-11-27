import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PRODUCTS, categoryForRawName, findCategory } from '@technokhan/shared';

test('builds product and breadcrumb graphs for a product page', async () => {
  const seo = await import('./seo').catch(() => ({ productPageJsonLd: undefined }));
  assert.equal(typeof seo.productPageJsonLd, 'function');
  if (!seo.productPageJsonLd) return;

  const product = PRODUCTS[0]!;
  const graphs = seo.productPageJsonLd(product);
  assert.equal(graphs[0]?.['@type'], 'Product');
  assert.equal(graphs[1]?.['@type'], 'BreadcrumbList');
  const items = graphs[1]?.itemListElement as { name: string }[];
  const expectedCategory = categoryForRawName(product.category)?.name ?? findCategory(product.category)?.name ?? product.category;
  assert.deepEqual(items.map((item) => item.name), ['خانه', 'فروشگاه', expectedCategory, product.name]);
});

test('builds a category collection and item list from visible products', async () => {
  const seo = await import('./seo');
  const category = findCategory(PRODUCTS[0]!.category)!;
  const products = PRODUCTS.filter((product) => product.category === category.id);
  const graphs = seo.categoryPageJsonLd(category, products);
  assert.equal(graphs[0]?.['@type'], 'CollectionPage');
  const list = graphs[0]?.mainEntity as { numberOfItems: number; itemListElement: unknown[] };
  assert.equal(list.numberOfItems, products.length);
  assert.equal(list.itemListElement.length, products.length);
  assert.equal(graphs[1]?.['@type'], 'BreadcrumbList');
});

test('keeps the canonical shop indexable and marks discovery URLs noindex', async () => {
  const seo = await import('./seo');
  assert.equal(typeof seo.getShopMetadata, 'function');
  if (!seo.getShopMetadata) return;

  const shop = seo.getShopMetadata({});
  const filtered = seo.getShopMetadata({ minDiscount: '10', sort: 'discount' });
  const shopRobots = shop.robots && typeof shop.robots === 'object' ? shop.robots : undefined;
  const filteredRobots = filtered.robots && typeof filtered.robots === 'object' ? filtered.robots : undefined;
  assert.equal(shop.alternates?.canonical, '/shop');
  assert.notEqual(shopRobots?.index, false);
  assert.equal(filteredRobots?.index, false);
  assert.equal(filteredRobots?.follow, true);
  assert.equal(filtered.alternates?.canonical, '/shop');
});

test('describes the gadget store rather than an automotive business', async () => {
  const seo = await import('./seo');
  const graph = seo.localBusinessJsonLd();
  assert.equal(graph['@type'], 'Store');
  assert.ok((graph.image as string[]).every((image) => !image.includes('workshop')));
});
