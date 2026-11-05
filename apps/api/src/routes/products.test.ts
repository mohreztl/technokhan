import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { productRoutes } from './products';

describe('productRoutes offline catalog', () => {
  let app: FastifyInstance;
  const originalFindMany = prisma.product.findMany;
  const originalFindFirst = prisma.product.findFirst;
  const originalCount = prisma.product.count;

  before(async () => {
    app = Fastify();
    app.decorate('authenticate', async () => undefined);
    await app.register(productRoutes, { prefix: '/products' });
    await app.ready();
  });

  beforeEach(() => {
    const unavailable = () => Promise.reject(new Error('database unavailable'));
    prisma.product.findMany = unavailable as typeof prisma.product.findMany;
    prisma.product.findFirst = unavailable as unknown as typeof prisma.product.findFirst;
    prisma.product.count = unavailable as typeof prisma.product.count;
  });

  afterEach(() => {
    prisma.product.findMany = originalFindMany;
    prisma.product.findFirst = originalFindFirst;
    prisma.product.count = originalCount;
  });

  after(async () => app.close());

  it('serves filtered and paginated bundled products when the database is unavailable', async () => {
    const response = await app.inject({ method: 'GET', url: '/products?brands=Anker&limit=2' });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.data.length, 2);
    assert.equal(body.pagination.total, 3);
    assert.ok(body.data.every((product: { brand: string }) => product.brand === 'Anker'));
  });

  it('serves one bundled product and its related items offline', async () => {
    const product = await app.inject({ method: 'GET', url: '/products/gan-charger' });
    assert.equal(product.statusCode, 200);
    assert.equal(product.json().data.id, 'gan-charger');

    const related = await app.inject({ method: 'GET', url: '/products/gan-charger/related?limit=2' });
    assert.equal(related.statusCode, 200);
    assert.equal(related.json().data.length, 2);
    assert.ok(related.json().data.every((item: { id: string }) => item.id !== 'gan-charger'));
  });

  it('serves featured products and category ids offline', async () => {
    const featured = await app.inject({ method: 'GET', url: '/products/featured/list?limit=2' });
    assert.equal(featured.statusCode, 200);
    assert.equal(featured.json().data.length, 2);

    const categories = await app.inject({ method: 'GET', url: '/products/categories/list' });
    assert.equal(categories.statusCode, 200);
    assert.equal(categories.json().data.length, 6);
  });
});
