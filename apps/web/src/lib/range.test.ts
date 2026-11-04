import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeRange } from './range';

describe('normalizeRange', () => {
  it('keeps both thumbs ordered and within the domain', () => {
    assert.deepEqual(normalizeRange([90, 10], 0, 100), [10, 90]);
    assert.deepEqual(normalizeRange([-20, 140], 0, 100), [0, 100]);
  });

  it('enforces the minimum gap between prices', () => {
    assert.deepEqual(normalizeRange([50, 50], 0, 100, 10), [45, 55]);
    assert.deepEqual(normalizeRange([0, 0], 0, 100, 10), [0, 10]);
    assert.deepEqual(normalizeRange([100, 100], 0, 100, 10), [90, 100]);
  });
});
