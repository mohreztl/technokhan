import { type FastifyPluginAsync, type FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import {
  BRANDS,
  CATEGORIES,
  PRODUCTS,
  categoryForRawName,
  categoryQueryValues,
  filterProducts,
  findProduct,
  findStoreBrand,
  findStoreCategory,
  getFeaturedProducts,
  getRelatedProducts,
  normalizeTaxonomyText,
  type Product,
  type StoreBrandInfo,
  type StoreCategoryInfo,
} from '@technokhan/shared';
import { prisma } from '../lib/prisma';
import { productQuerySchema, limitQuerySchema, idParamSchema, reviewSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { conflict, notFound } from '../lib/errors';
import { approvedReviews, displayName, reviewSelect, searchFilter } from '../lib/catalog';

/** Records why a public read switched to the bundled catalog. */
function logCatalogFallback(request: FastifyRequest, error: unknown): void {
  request.log.warn({ err: error }, 'Database product read failed; serving bundled catalog');
}

// Live distinct categories, cached briefly: the Sepidar sync owns raw spellings,
// so taxonomy expansion must cover whatever spellings currently exist.
const CATEGORY_CACHE_TTL_MS = 60_000;
let categoryCache: { at: number; values: string[] } | null = null;

async function liveCategories(): Promise<string[]> {
  if (categoryCache && Date.now() - categoryCache.at < CATEGORY_CACHE_TTL_MS) return categoryCache.values;
  try {
    const rows = await prisma.product.findMany({ where: { isActive: true }, select: { category: true }, distinct: ['category'] });
    categoryCache = { at: Date.now(), values: rows.map((row) => row.category).filter(Boolean) };
  } catch {
    categoryCache = { at: Date.now(), values: categoryCache?.values ?? [] };
  }
  return categoryCache.values;
}

/** A category query value covers its taxonomy match list plus live spellings of it. */
function expandCategoryValues(input: string, live: string[]): string[] {
  const tax = findStoreCategory(input);
  if (!tax) return [input];
  const wanted = new Set(tax.match.map((raw) => normalizeTaxonomyText(raw)));
  const liveMatches = live.filter((raw) => wanted.has(normalizeTaxonomyText(raw)));
  return [...new Set([...categoryQueryValues(tax), ...liveMatches])];
}

/** Public product catalog, filtering, related items and authenticated reviews. */
export const productRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /products
  fastify.get('/', async (request, reply) => {
    const q = parse(productQuerySchema, request.query);

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (q.categories?.length || q.category) {
      const live = await liveCategories();
      where.category = {
        in: (q.categories?.length ? q.categories : [q.category!]).flatMap((c) => expandCategoryValues(c, live)),
      };
    }
    if (q.brands?.length) where.brand = { in: q.brands, mode: 'insensitive' };
    else if (q.brand) where.brand = { equals: q.brand, mode: 'insensitive' };
    if (q.features?.length) where.tags = { hasEvery: q.features };
    if (q.featured !== undefined) where.featured = q.featured;
    if (q.editorChoice !== undefined) where.editorChoice = q.editorChoice;
    if (q.minReviews !== undefined) where.reviewCount = { gte: q.minReviews };
    if (q.inStock === true) where.stock = { gt: 0 };
    if (q.search) {
      where.OR = [
        ...(searchFilter(q.search, ['name', 'nameEn', 'shortDescription', 'description', 'brand']) as Prisma.ProductWhereInput[]),
        { tags: { has: q.search } },
      ];
    }

    try {
      const rows = await prisma.product.findMany({ where });
      // Prisma JSON fields match the shared catalog at runtime; filtering here
      // keeps discounted-price semantics identical to demo and offline reads.
      const products = filterProducts(rows as unknown as Product[], q);
      const start = (q.page - 1) * q.limit;
      return apiResponse.paginated(reply, products.slice(start, start + q.limit), products.length, q.page, q.limit);
    } catch (error) {
      logCatalogFallback(request, error);
      const products = filterProducts(PRODUCTS, q);
      const start = (q.page - 1) * q.limit;
      return apiResponse.paginated(reply, products.slice(start, start + q.limit), products.length, q.page, q.limit);
    }
  });

  // GET /products/featured/list
  fastify.get('/featured/list', async (request, reply) => {
    const { limit } = parse(limitQuerySchema(8), request.query);
    try {
      const products = await prisma.product.findMany({
        where: { featured: true, isActive: true },
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });
      return apiResponse.success(reply, products);
    } catch (error) {
      logCatalogFallback(request, error);
      return apiResponse.success(reply, getFeaturedProducts(limit));
    }
  });

  // GET /products/categories/list
  fastify.get('/categories/list', async (request, reply) => {
    try {
      const rows = await prisma.product.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });
      return apiResponse.success(reply, rows.map((row) => row.category).filter(Boolean));
    } catch (error) {
      logCatalogFallback(request, error);
      const categories = Array.from(new Set(PRODUCTS.filter((product) => product.isActive !== false).map((product) => product.category))).sort((a, b) => a.localeCompare(b, 'fa'));
      return apiResponse.success(reply, categories);
    }
  });

  // GET /products/categories/details — taxonomy pages with live product counts
  fastify.get('/categories/details', async (request, reply) => {
    const fallback = CATEGORIES.map((category) => ({
      slug: category.id as string,
      name: category.name,
      description: category.description,
      image: category.image as string | undefined,
      productCount: 0,
    }));
    try {
      const grouped = await prisma.product.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { _all: true },
      });
      const infos = new Map<string, StoreCategoryInfo>();
      for (const row of grouped) {
        if (!row.category) continue;
        const tax = categoryForRawName(row.category);
        const slug = tax?.slug ?? row.category;
        const prev = infos.get(slug);
        infos.set(slug, {
          slug,
          name: tax?.name ?? row.category,
          description: tax?.description ?? `خرید ${row.category} اورجینال با ضمانت اصالت کالا.`,
          image: tax?.image,
          productCount: (prev?.productCount ?? 0) + row._count._all,
        });
      }
      const list = [...infos.values()].sort((a, b) => b.productCount - a.productCount);
      return apiResponse.success(reply, list.length ? list : fallback);
    } catch (error) {
      logCatalogFallback(request, error);
      return apiResponse.success(reply, fallback);
    }
  });

  // GET /products/brands/list — brands present in the catalog, dictionary-enriched
  fastify.get('/brands/list', async (request, reply) => {
    try {
      const grouped = await prisma.product.groupBy({
        by: ['brand'],
        where: { isActive: true, AND: [{ brand: { not: null } }, { brand: { not: '' } }] },
        _count: { _all: true },
      });
      const infos: StoreBrandInfo[] = grouped
        .filter((row) => row.brand)
        .map((row) => {
          const known = findStoreBrand(row.brand!);
          return {
            id: row.brand!.toLowerCase(),
            name: known?.name ?? row.brand!,
            nameFa: known?.nameFa ?? row.brand!,
            country: known?.country ?? '',
            productCount: row._count._all,
          };
        })
        .sort((a, b) => b.productCount - a.productCount);
      return apiResponse.success(reply, infos.length ? infos : BRANDS.map((b) => ({ ...b, productCount: 0 })));
    } catch (error) {
      logCatalogFallback(request, error);
      return apiResponse.success(reply, BRANDS.map((b) => ({ ...b, productCount: 0 })));
    }
  });

  // GET /products/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    try {
      const product = await prisma.product.findFirst({
        // Migrated WooCommerce slugs are stored on `slug`; public URLs keep working.
        where: { isActive: true, OR: [{ id }, { slug: id }] },
        include: { reviews: approvedReviews },
      });
      if (!product) throw notFound('محصول یافت نشد');
      return apiResponse.success(reply, product);
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) throw error;
      logCatalogFallback(request, error);
      const product = findProduct(id);
      if (!product || product.isActive === false) throw notFound('محصول یافت نشد');
      return apiResponse.success(reply, product);
    }
  });

  // GET /products/:id/related
  fastify.get('/:id/related', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const { limit } = parse(limitQuerySchema(4), request.query);

    try {
      const product = await prisma.product.findFirst({
        where: { id, isActive: true },
        select: { category: true, brand: true },
      });
      if (!product) throw notFound('محصول یافت نشد');
      const related = await prisma.product.findMany({
        where: { isActive: true, id: { not: id }, category: product.category },
        orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });
      return apiResponse.success(reply, related);
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) throw error;
      logCatalogFallback(request, error);
      if (!findProduct(id)) throw notFound('محصول یافت نشد');
      return apiResponse.success(reply, getRelatedProducts(id, limit));
    }
  });

  // POST /products/:id/reviews (auth) — creates a pending review
  fastify.post('/:id/reviews', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(reviewSchema, request.body);

    const [product, user, existing] = await Promise.all([
      prisma.product.findFirst({ where: { id, isActive: true }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: request.user.id } }),
      prisma.review.findFirst({ where: { productId: id, userId: request.user.id }, select: { id: true } }),
    ]);
    if (!product) throw notFound('محصول یافت نشد');
    if (!user) throw notFound('کاربر یافت نشد');
    if (existing) throw conflict('شما قبلاً برای این محصول نظر ثبت کرده‌اید');

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: user.id,
        userName: displayName(user),
        rating: input.rating,
        comment: input.comment,
        isApproved: false,
      },
      select: { ...reviewSelect, isApproved: true, productId: true },
    });

    return apiResponse.success(reply, review, 201);
  });
};
