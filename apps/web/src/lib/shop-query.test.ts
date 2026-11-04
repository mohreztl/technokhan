import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseShopQuery } from './shop-query';

describe('parseShopQuery', () => {
  it('parses filters, multiple brands and sort aliases from the URL', () => {
    const query = parseShopQuery({ search: 'شارژر', brands: 'Anker,Baseus', minPrice: '1000000', maxPrice: '5000000', inStock: 'true', sort: 'priceAsc', page: '2' });
    assert.equal(query.search, 'شارژر');
    assert.deepEqual(query.brands, ['Anker', 'Baseus']);
    assert.equal(query.minPrice, 1_000_000);
    assert.equal(query.maxPrice, 5_000_000);
    assert.equal(query.inStock, true);
    assert.equal(query.sortBy, 'price');
    assert.equal(query.sortOrder, 'asc');
    assert.equal(query.page, 2);
  });

  it('ignores invalid numbers and normalizes empty values', () => {
    const query = parseShopQuery({ minPrice: 'bad', page: '-3', brands: '' });
    assert.equal(query.minPrice, undefined);
    assert.equal(query.page, 1);
    assert.equal(query.brands, undefined);
  });
});
