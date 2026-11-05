import { type FastifyPluginAsync, type FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { BRANDS, CATEGORIES, PRODUCTS, filterProducts, findProduct, getFeaturedProducts, getRelatedProducts } from '@technokhan/shared';
import { prisma } from '../lib/prisma';
import { productQuerySchema, limitQuerySchema, idParamSchema, reviewSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { conflict, notFound } from '../lib/errors';
import { approvedReviews, displayName, reviewSelect, searchFilter } from '../lib/catalog';

/** Records why a public read switched to the bundled catalog. */
function logCatalogFallback(request: FastifyRequest, error: unknown): void {
  request.log.warn({ err: error }, 'Database product read failed; serving bundled catalog');
}

/** Public product catalog, filtering, related items and authenticated reviews. */
export const productRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /products
  fastify.get('/', async (request, reply) => {
    const q = parse(productQuerySchema, request.query);

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (q.category) where.category = q.category;
    if (q.brands?.length) where.brand = { in: q.brands, mode: 'insensitive' };
    else if (q.brand) where.brand = { equals: q.brand, mode: 'insensitive' };
    if (q.features?.length) where.tags = { hasEvery: q.features };
    if (q.featured !== undefined) where.featured = q.featured;
    if (q.inStock === true) where.stock = { gt: 0 };
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = {
        ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}),
        ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}),
      };
    }
    if (q.search) {
      where.OR = [
        ...(searchFilter(q.search, ['name', 'nameEn', 'shortDescription', 'description', 'brand']) as Prisma.ProductWhereInput[]),
        { tags: { has: q.search } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      q.sortBy === 'rating'
        ? [{ rating: q.sortOrder }, { reviewCount: 'desc' }]
        : q.sortBy === 'popular'
          ? [{ salesCount: q.sortOrder }, { reviewCount: 'desc' }]
          : [{ [q.sortBy === 'newest' ? 'createdAt' : q.sortBy]: q.sortOrder }, { id: 'asc' }];

    try {
      const [products, total] = await Promise.all([
        prisma.product.findMany({ where, orderBy, skip: (q.page - 1) * q.limit, take: q.limit }),
        prisma.product.count({ where }),
      ]);
      return apiResponse.paginated(reply, products, total, q.page, q.limit);
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

  // GET /products/categories/details
  fastify.get('/categories/details', async (_request, reply) => {
    return apiResponse.success(reply, CATEGORIES);
  });

  // GET /products/brands/list
  fastify.get('/brands/list', async (_request, reply) => {
    return apiResponse.success(reply, BRANDS);
  });

  // GET /products/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    try {
      const product = await prisma.product.findFirst({
        where: { id, isActive: true },
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
