import { FastifyPluginAsync } from 'fastify';
import type { Article, ArticleCategory } from '@technokhan/shared';
import { findArticle, sortedArticles } from '@technokhan/shared';
import type { Article as DbArticle } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { apiResponse, parse } from '../lib/validation';

const articleQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const articleParamsSchema = z.object({ slug: z.string().trim().min(1).max(160) });

const FALLBACK_CATEGORY: ArticleCategory = 'دانش فنی';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Migrated WordPress posts render through the shared block-based Article type:
 * HTML becomes plain paragraphs (headings/lists flatten) so the existing
 * storefront components work unchanged. Rich block mapping can come later.
 */
function serializeArticle(row: DbArticle): Article {
  const text = stripHtml(row.content);
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? text.slice(0, 160),
    category: (row.category as ArticleCategory) ?? FALLBACK_CATEGORY,
    cover: row.coverImage ?? '',
    publishedAt: row.publishedAt.toISOString(),
    author: { name: row.author ?? 'تحریریه', role: '' },
    readingMinutes: Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 180)),
    tags: row.tags,
    body: text ? [{ kind: 'paragraph', text }] : [],
  };
}

/** Read-only magazine endpoints. DB articles (WordPress migration) first, bundled catalog as fallback. */
export const articleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const query = parse(articleQuerySchema, request.query);
    const search = query.search?.toLocaleLowerCase('fa');

    let migrated: Article[] = [];
    try {
      const rows = await prisma.article.findMany({
        where: {
          isActive: true,
          ...(query.category ? { category: query.category } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: 200,
      });
      migrated = rows.map(serializeArticle);
    } catch {
      // DB unavailable — the bundled catalog below still answers the request
    }

    const bundled = sortedArticles();
    const merged = [...migrated, ...bundled]
      .filter((article) => !query.category || article.category === query.category)
      .filter((article) => !search || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLocaleLowerCase('fa').includes(search));

    return apiResponse.paginated(reply, merged.slice(0, query.limit), merged.length, 1, query.limit);
  });

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = parse(articleParamsSchema, request.params);

    try {
      const row = await prisma.article.findUnique({ where: { slug } });
      if (row) return apiResponse.success(reply, serializeArticle(row));
    } catch {
      // fall through to the bundled catalog
    }

    const article = findArticle(slug);
    if (!article) throw notFound('مقاله یافت نشد');
    return apiResponse.success(reply, article);
  });
};
