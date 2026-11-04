import { FastifyPluginAsync } from 'fastify';
import { findArticle, sortedArticles } from '@autolounge/shared';
import { z } from 'zod';
import { notFound } from '../lib/errors';
import { apiResponse, parse } from '../lib/validation';

const articleQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const articleParamsSchema = z.object({ slug: z.string().trim().min(1).max(160) });

/** Read-only magazine endpoints backed by the shared Persian editorial catalog. */
export const articleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const query = parse(articleQuerySchema, request.query);
    const search = query.search?.toLocaleLowerCase('fa');
    const filtered = sortedArticles()
      .filter((article) => !query.category || article.category === query.category)
      .filter((article) => !search || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLocaleLowerCase('fa').includes(search));
    return apiResponse.paginated(reply, filtered.slice(0, query.limit), filtered.length, 1, query.limit);
  });

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = parse(articleParamsSchema, request.params);
    const article = findArticle(slug);
    if (!article) throw notFound('مقاله یافت نشد');
    return apiResponse.success(reply, article);
  });
};
