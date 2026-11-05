import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PRODUCTS } from '@technokhan/shared';
import * as recentlyViewed from './recently-viewed-store';
import { recentIds } from './recently-viewed-store';

describe('recently viewed history', () => {
  it('keeps unique newest-first ids and caps history at eight', () => {
    assert.deepEqual(recentIds(['a', 'b'], 'a'), ['a', 'b']);
    assert.deepEqual(recentIds(['a', 'b', 'c'], 'b'), ['b', 'a', 'c']);
    assert.deepEqual(recentIds(Array.from({ length: 8 }, (_, index) => `p${index}`), 'new'), ['new', 'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
  });

  it('resolves display products in history order and excludes the current product', () => {
    assert.equal(typeof recentlyViewed.recentProducts, 'function');
    if (!recentlyViewed.recentProducts) return;
    const result = recentlyViewed.recentProducts([PRODUCTS[1]!.id, PRODUCTS[0]!.id], PRODUCTS[1]!.id, PRODUCTS);
    assert.deepEqual(result, [PRODUCTS[0]!]);
  });
});
