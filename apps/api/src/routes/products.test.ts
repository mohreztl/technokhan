import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { PRODUCTS } from '@technokhan/shared';
import { prisma } from '../lib/prisma';
import { productRoutes } from './products';

describe('productRoutes offline catalog', () => {
  let app: FastifyInstance;
  const originalFindMany = prisma.product.findMany;
  const originalFindFirst = prisma.product.findFirst;
  const originalCount = prisma.product.count;
  const originalGroupBy = prisma.product.groupBy;

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
    prisma.product.groupBy = originalGroupBy;
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

  it('combines discount, review and editorial filters in the offline catalog', async () => {
    const response = await app.inject({ method: 'GET', url: '/products?minDiscount=10&minReviews=150&editorChoice=true&sortBy=discount' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().data.map((product: { id: string }) => product.id), ['gan-charger']);
    assert.equal(response.json().pagination.total, 1);
  });

  it('filters and sorts live database products by their effective discounted price', async () => {
    const cheap = { ...PRODUCTS[0]!, id: 'cheap', price: 1_000, discountPrice: null };
    const discounted = { ...PRODUCTS[0]!, id: 'discounted', price: 1_500, discountPrice: 500 };
    prisma.product.findMany = (async () => [cheap, discounted]) as unknown as typeof prisma.product.findMany;
    prisma.product.count = (async () => 2) as typeof prisma.product.count;

    const response = await app.inject({ method: 'GET', url: '/products?maxPrice=1000&sortBy=price&sortOrder=asc' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().data.map((product: { id: string }) => product.id), ['discounted', 'cheap']);
    assert.equal(response.json().pagination.total, 2);
  });

  it('expands a taxonomy slug into live raw category spellings', async () => {
    let capturedWhere: { category?: { in?: string[] } } = {};
    prisma.product.findMany = (async (args: { where?: typeof capturedWhere; distinct?: string[] }) => {
      if (args?.distinct) return [{ category: 'هدفون و هندزفري بلوتوث' }, { category: 'کابل و شارژر' }];
      capturedWhere = args?.where ?? {};
      return [];
    }) as unknown as typeof prisma.product.findMany;

    const response = await app.inject({ method: 'GET', url: '/products?category=headphones' });
    assert.equal(response.statusCode, 200);
    const values = capturedWhere.category?.in ?? [];
    assert.ok(values.includes('هدفون و هندزفری'), 'curated match present');
    assert.ok(values.includes('هدفون و هندزفري بلوتوث'), 'live Arabic-spelling variant discovered');
    assert.ok(!values.includes('کابل و شارژر'), 'unrelated categories excluded');
  });

  it('groups raw categories into taxonomy pages with counts', async () => {
    prisma.product.groupBy = (async () => [
      { category: 'کابل و شارژر', _count: { _all: 128 } },
      { category: 'ايرپاد', _count: { _all: 52 } },
      { category: 'ایرپاد', _count: { _all: 4 } },
      { category: 'دسته ناشناخته', _count: { _all: 2 } },
    ]) as unknown as typeof prisma.product.groupBy;

    const response = await app.inject({ method: 'GET', url: '/products/categories/details' });
    assert.equal(response.statusCode, 200);
    const data = response.json().data as Array<{ slug: string; name: string; productCount: number }>;
    const cables = data.find((c) => c.slug === 'cables-chargers');
    assert.equal(cables?.productCount, 128);
    const airpods = data.find((c) => c.slug === 'airpods');
    assert.equal(airpods?.productCount, 56, 'spelling variants merge into one page');
    const unknown = data.find((c) => c.slug === 'دسته ناشناخته');
    assert.equal(unknown?.productCount, 2);
    assert.equal(data[0]!.slug, 'cables-chargers', 'sorted by count desc');
  });

  it('lists brands present in the catalog enriched with dictionary metadata', async () => {
    prisma.product.groupBy = (async () => [
      { brand: 'ldnio', _count: { _all: 38 } },
      { brand: 'samsung', _count: { _all: 27 } },
      { brand: 'no-name', _count: { _all: 1 } },
    ]) as unknown as typeof prisma.product.groupBy;

    const response = await app.inject({ method: 'GET', url: '/products/brands/list' });
    assert.equal(response.statusCode, 200);
    const data = response.json().data as Array<{ id: string; nameFa: string; productCount: number }>;
    assert.equal(data[0]!.id, 'ldnio');
    assert.equal(data[0]!.nameFa, 'الدی‌انو');
    assert.equal(data[0]!.productCount, 38);
    assert.equal(data.find((b) => b.id === 'no-name')?.nameFa, 'no-name');
  });
});
