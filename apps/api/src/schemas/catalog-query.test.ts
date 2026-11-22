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

  it('parses the public deals flag', () => {
    assert.equal(productQuerySchema.parse({ deals: 'true' }).deals, true);
    assert.equal(productQuerySchema.parse({}).deals, undefined);
  });

  it('parses discount, review and editorial filters', () => {
    const query = productQuerySchema.parse({ minDiscount: '10', minReviews: '150', editorChoice: 'true', sortBy: 'discount' });
    assert.equal(query.minDiscount, 10);
    assert.equal(query.minReviews, 150);
    assert.equal(query.editorChoice, true);
    assert.equal(query.sortBy, 'discount');
  });
});
