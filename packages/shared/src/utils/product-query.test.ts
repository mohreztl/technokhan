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

test('returns only products at or above the requested discount percentage', () => {
  const result = productQuery.filterProducts(PRODUCTS, { minDiscount: 10 });
  assert.deepEqual(new Set(result.map((product) => product.id)), new Set(['earbuds', 'speaker', 'gan-charger', 'usb-hub', 'keyboard', 'phone-stand']));
});

test('returns only products with enough buyer reviews', () => {
  const result = productQuery.filterProducts(PRODUCTS, { minReviews: 200 });
  assert.deepEqual(new Set(result.map((product) => product.id)), new Set(['earbuds', 'speaker', 'braided-cable']));
});

test('returns only editorial selections when requested', () => {
  const result = productQuery.filterProducts(PRODUCTS, { editorChoice: true });
  assert.deepEqual(new Set(result.map((product) => product.id)), new Set(['anc-headphones', 'smartwatch', 'gan-charger', 'keyboard']));
});

test('sorts genuinely discounted products before full-price products', () => {
  const result = productQuery.filterProducts(PRODUCTS, { sortBy: 'discount', sortOrder: 'desc' });
  assert.equal(result[0]?.id, 'phone-stand');
  assert.equal(result.at(-1)?.discountPrice, undefined);
});
