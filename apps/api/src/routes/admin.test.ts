import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import Fastify, { type FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { prisma } from '../lib/prisma';
import { adminRoutes } from './admin';

const ARTICLE_ROW = {
  id: 'art-1',
  slug: 'gan-guide',
  title: 'راهنمای شارژرهای GaN',
  excerpt: 'خلاصه',
  content: 'متن کامل مقاله که به اندازه کافی طولانی است',
  category: 'دانش فنی',
  coverImage: null,
  tags: ['شارژر'],
  author: 'تحریریه',
  publishedAt: new Date('2026-01-01T00:00:00Z'),
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('adminRoutes uploads & articles', () => {
  let app: FastifyInstance;
  const original = {
    findMany: prisma.article.findMany,
    findUnique: prisma.article.findUnique,
    count: prisma.article.count,
    create: prisma.article.create,
    update: prisma.article.update,
  };

  before(async () => {
    app = Fastify();
    app.decorate('requireAdmin', async () => undefined);
    app.decorate('adminOnly', app.requireAdmin);
    app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
      const status = error.statusCode ?? 500;
      reply.status(status).send({ success: false, error: error.message });
    });
    await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
    await app.register(adminRoutes, { prefix: '/admin' });
    await app.ready();
  });

  after(async () => {
    prisma.article.findMany = original.findMany;
    prisma.article.findUnique = original.findUnique;
    prisma.article.count = original.count;
    prisma.article.create = original.create;
    prisma.article.update = original.update;
    await app.close();
  });

  function multipartBody(filename: string, contentType: string, data = 'x') {
    const boundary = '----technokhan-test';
    const payload = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${filename}"`,
      `Content-Type: ${contentType}`,
      '',
      data,
      `--${boundary}--`,
      '',
    ].join('\r\n');
    return { payload, headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } };
  }

  it('rejects an upload without a file', async () => {
    const res = await app.inject({ method: 'POST', url: '/admin/uploads' });
    assert.equal(res.statusCode, 400);
  });

  it('rejects a non-image upload', async () => {
    const res = await app.inject({ method: 'POST', url: '/admin/uploads', ...multipartBody('note.txt', 'text/plain') });
    assert.equal(res.statusCode, 400);
  });

  it('reports 503 when S3 is not configured', async () => {
    const res = await app.inject({ method: 'POST', url: '/admin/uploads', ...multipartBody('pic.png', 'image/png') });
    assert.equal(res.statusCode, 503);
  });

  it('lists articles with pagination metadata', async () => {
    prisma.article.findMany = (async (args: { select?: Record<string, boolean> }) => {
      // emulate prisma honouring the select clause
      if (args?.select && !args.select.content) {
        const { content: _content, ...summary } = ARTICLE_ROW;
        return [summary];
      }
      return [ARTICLE_ROW];
    }) as unknown as typeof prisma.article.findMany;
    prisma.article.count = (async () => 1) as typeof prisma.article.count;
    const res = await app.inject({ method: 'GET', url: '/admin/articles?search=gan' });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.data.length, 1);
    assert.equal(body.pagination.total, 1);
    assert.equal(body.data[0].slug, 'gan-guide');
    assert.equal(body.data[0].content, undefined);
  });

  it('creates an article with a generated slug for Persian titles', async () => {
    prisma.article.findUnique = (async () => null) as unknown as typeof prisma.article.findUnique;
    let createdData: Record<string, unknown> = {};
    prisma.article.create = (async (args: { data: Record<string, unknown> }) => {
      createdData = args.data;
      return { ...ARTICLE_ROW, ...args.data };
    }) as unknown as typeof prisma.article.create;

    const res = await app.inject({
      method: 'POST',
      url: '/admin/articles',
      payload: { title: 'مقاله جدید درباره شارژ', content: 'متن مقاله جدید که به اندازه کافی طولانی است' },
    });
    assert.equal(res.statusCode, 201);
    assert.match(String(createdData.slug), /^post-/);
  });

  it('creates an article with a latin slug from an English title', async () => {
    prisma.article.findUnique = (async () => null) as unknown as typeof prisma.article.findUnique;
    let createdData: Record<string, unknown> = {};
    prisma.article.create = (async (args: { data: Record<string, unknown> }) => {
      createdData = args.data;
      return { ...ARTICLE_ROW, ...args.data };
    }) as unknown as typeof prisma.article.create;

    const res = await app.inject({
      method: 'POST',
      url: '/admin/articles',
      payload: { title: 'GaN Charger Guide', content: 'A long enough english body for the article' },
    });
    assert.equal(res.statusCode, 201);
    assert.equal(createdData.slug, 'gan-charger-guide');
  });

  it('rejects a duplicate requested slug with 409', async () => {
    prisma.article.findUnique = (async () => ({ id: 'other' })) as unknown as typeof prisma.article.findUnique;
    const res = await app.inject({
      method: 'POST',
      url: '/admin/articles',
      payload: { slug: 'gan-guide', title: 'Title', content: 'A long enough english body for the article' },
    });
    assert.equal(res.statusCode, 409);
  });

  it('soft-deletes an article', async () => {
    let updatedData: Record<string, unknown> = {};
    prisma.article.update = (async (args: { data: Record<string, unknown> }) => {
      updatedData = args.data;
      return { ...ARTICLE_ROW, ...args.data };
    }) as unknown as typeof prisma.article.update;
    const res = await app.inject({ method: 'DELETE', url: '/admin/articles/art-1' });
    assert.equal(res.statusCode, 200);
    assert.equal(updatedData.isActive, false);
  });
});
