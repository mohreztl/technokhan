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
    minPrice: 1_000_000,
    maxPrice: 5_000_000,
    inStock: true,
    sortBy: 'price',
    sortOrder: 'asc',
    page: 2,
    limit: 12,
  });
  assert.equal(search, '?search=%D8%B4%D8%A7%D8%B1%DA%98%D8%B1&brands=Anker%2CBaseus&minPrice=1000000&maxPrice=5000000&inStock=true&deals=true&sort=priceAsc&page=2');
});
