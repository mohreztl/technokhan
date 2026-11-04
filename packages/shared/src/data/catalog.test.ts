import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ARTICLES, BRANDS, CATEGORIES, PRODUCTS } from './index';
import { ProductCategory } from '../types';

describe('TechnoKhan catalog', () => {
  it('contains 12 unique, complete digital products', () => {
    assert.equal(PRODUCTS.length, 12);
    assert.equal(new Set(PRODUCTS.map((product) => product.id)).size, 12);
    for (const product of PRODUCTS) {
      assert.ok(product.name.length > 10);
      assert.ok(product.description.length > 80);
      assert.ok(product.images.every((src) => src.startsWith('/images/products/')));
      assert.ok(product.specifications && product.specifications.length >= 4);
      assert.ok(product.warranties && product.warranties.length >= 2);
      assert.ok(product.reviews && product.reviews.length >= 2);
    }
  });

  it('covers six categories, seven original brands and four editorial articles', () => {
    assert.equal(CATEGORIES.length, 6);
    assert.deepEqual(CATEGORIES.map((category) => category.id).sort(), Object.values(ProductCategory).sort());
    assert.equal(BRANDS.length, 7);
    assert.equal(ARTICLES.length, 4);
    for (const article of ARTICLES) {
      assert.ok(article.body.length >= 7);
      assert.match(article.cover, /^\/images\/blog\/.+\.webp$/);
    }
  });
});
