import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PRODUCTS, ProductCategory } from '@technokhan/shared';
import { queryLocalProducts } from './local-query';

describe('queryLocalProducts', () => {
  it('combines category, brands, price interval and stock', () => {
    const result = queryLocalProducts({ category: ProductCategory.CHARGERS, brands: ['Anker', 'Baseus'], minPrice: 1_000_000, maxPrice: 8_000_000, inStock: true, limit: 50 });
    assert.ok(result.items.length > 0);
    assert.ok(result.items.every((product) => product.category === ProductCategory.CHARGERS && ['Anker', 'Baseus'].includes(product.brand ?? '') && product.stock > 0));
  });

  it('sorts by effective price and supports best-selling and newest orders', () => {
    const prices = queryLocalProducts({ sortBy: 'price', sortOrder: 'asc', limit: 50 }).items.map((product) => product.discountPrice ?? product.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
    const popular = queryLocalProducts({ sortBy: 'popular', sortOrder: 'desc', limit: 50 }).items;
    assert.ok((popular[0]?.salesCount ?? 0) >= (popular.at(-1)?.salesCount ?? 0));
    const newest = queryLocalProducts({ sortBy: 'newest', sortOrder: 'desc', limit: 50 }).items;
    assert.ok(Date.parse(newest[0]!.createdAt as string) >= Date.parse(newest.at(-1)!.createdAt as string));
  });

  it('searches normalized Persian and returns an empty page without breaking', () => {
    assert.ok(queryLocalProducts({ search: 'شارژر گن', limit: 50 }).items.some((product) => product.id === 'gan-charger'));
    const empty = queryLocalProducts({ search: 'چیزی که قطعا وجود ندارد', page: 9, limit: 6 });
    assert.equal(empty.items.length, 0);
    assert.equal(empty.pagination.total, 0);
    assert.equal(empty.pagination.page, 1);
  });

  it('returns only genuinely discounted products for deal links', () => {
    const result = queryLocalProducts({ deals: true, limit: 50 });
    assert.ok(result.items.length > 0);
    assert.ok(result.items.every((product) => product.discountPrice !== undefined && product.discountPrice < product.price));
  });
});
