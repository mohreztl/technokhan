import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PRODUCTS } from '../data/products';
import * as productQuery from './product-query';

test('normalizes Persian and Arabic search text consistently', () => {
  assert.equal(typeof productQuery.normalizeSearchText, 'function');
  if (!productQuery.normalizeSearchText) return;
  assert.equal(productQuery.normalizeSearchText('  كبود  شارژر '), 'کبود شارژر');
});

test('applies minimum rating with the other catalog filters', () => {
  const result = productQuery.filterProducts(PRODUCTS, { minRating: 4.5, inStock: true });
  assert.ok(result.length > 0);
  assert.ok(result.every((product) => (product.rating ?? 0) >= 4.5 && product.stock > 0));
});
