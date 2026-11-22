import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as shopQuery from './shop-query';

test('serializes only non-default shop filters into a shareable URL', () => {
  assert.equal(typeof shopQuery.shopQueryToSearchParams, 'function');
  if (!shopQuery.shopQueryToSearchParams) return;

  const search = shopQuery.shopQueryToSearchParams({
    search: 'شارژر',
    brands: ['Anker', 'Baseus'],
    deals: true,
    featured: true,
    minPrice: 1_000_000,
    maxPrice: 5_000_000,
    minRating: 4.5,
    inStock: true,
    sortBy: 'price',
    sortOrder: 'asc',
    page: 2,
    limit: 12,
  });
  assert.equal(search, '?search=%D8%B4%D8%A7%D8%B1%DA%98%D8%B1&brands=Anker%2CBaseus&minPrice=1000000&maxPrice=5000000&minRating=4.5&inStock=true&deals=true&featured=true&sort=priceAsc&page=2');
});

test('round-trips discount, review and editorial discovery filters', () => {
  const search = shopQuery.shopQueryToSearchParams({ minDiscount: 10, minReviews: 150, editorChoice: true, sortBy: 'discount', sortOrder: 'desc' });
  assert.equal(search, '?minDiscount=10&minReviews=150&editorChoice=true&sort=discount');
  assert.deepEqual(shopQuery.parseShopQuery({ minDiscount: '10', minReviews: '150', editorChoice: 'true', sort: 'discount' }), {
    minDiscount: 10,
    minReviews: 150,
    editorChoice: true,
    sortBy: 'discount',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
    brands: undefined,
    category: undefined,
    search: undefined,
    features: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    inStock: undefined,
    deals: undefined,
    featured: undefined,
  });
});
