import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { productQuerySchema } from './index';

describe('productQuerySchema', () => {
  it('parses comma-separated brands/features and merchandising sorts', () => {
    const query = productQuerySchema.parse({ brands: 'Anker,Baseus', features: 'GaN,۱۰۰ وات', sortBy: 'popular', inStock: 'true' });
    assert.deepEqual(query.brands, ['Anker', 'Baseus']);
    assert.deepEqual(query.features, ['GaN', '۱۰۰ وات']);
    assert.equal(query.sortBy, 'popular');
    assert.equal(query.inStock, true);
  });
});
