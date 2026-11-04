import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { articleRoutes } from './articles';

describe('articleRoutes', () => {
  let app: FastifyInstance;
  before(async () => {
    app = Fastify();
    await app.register(articleRoutes, { prefix: '/articles' });
    await app.ready();
  });
  after(async () => app.close());

  it('serves filtered articles and one canonical article', async () => {
    const list = await app.inject({ method: 'GET', url: '/articles?category=دانش فنی&limit=2' });
    assert.equal(list.statusCode, 200);
    const listBody = list.json();
    assert.equal(listBody.data.length, 2);
    assert.equal(listBody.pagination.total, 2);
    const detail = await app.inject({ method: 'GET', url: '/articles/gan-guide' });
    assert.equal(detail.statusCode, 200);
    assert.equal(detail.json().data.slug, 'gan-guide');
  });

  it('returns 404 for an unknown article', async () => {
    const response = await app.inject({ method: 'GET', url: '/articles/not-a-real-article' });
    assert.equal(response.statusCode, 404);
  });
});
