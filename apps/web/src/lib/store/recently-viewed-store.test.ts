import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { recentIds } from './recently-viewed-store';

describe('recently viewed history', () => {
  it('keeps unique newest-first ids and caps history at eight', () => {
    assert.deepEqual(recentIds(['a', 'b'], 'a'), ['a', 'b']);
    assert.deepEqual(recentIds(['a', 'b', 'c'], 'b'), ['b', 'a', 'c']);
    assert.deepEqual(recentIds(Array.from({ length: 8 }, (_, index) => `p${index}`), 'new'), ['new', 'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
  });
});
