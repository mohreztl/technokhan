import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProductCategory, type Product } from '@technokhan/shared';
import { getCatalogCounts, type CatalogProduct } from './catalog-counts';

const products: CatalogProduct[] = [
  { category: ProductCategory.CHARGERS, brand: 'Anker' },
  { category: ProductCategory.CHARGERS, brand: 'anker' },
  { category: ProductCategory.HEADPHONES },
];

test('counts categories and normalizes brand names case-insensitively', () => {
  assert.deepEqual(getCatalogCounts(products), {
    categories: { chargers: 2, headphones: 1 },
    brands: { anker: 2 },
  });
});

test('returns empty counts for an empty catalog', () => {
  assert.deepEqual(getCatalogCounts([]), { categories: {}, brands: {} });
});

test('accepts the shared product shape', () => {
  const product: Pick<Product, 'category' | 'brand'> = products[0]!;
  assert.equal(getCatalogCounts([product]).brands.anker, 1);
});
