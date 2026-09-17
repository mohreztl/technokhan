import { FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { serviceQuerySchema, limitQuerySchema, idParamSchema, reviewSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { conflict, notFound } from '../lib/errors';
import { approvedReviews, displayName, reviewSelect, searchFilter } from '../lib/catalog';

export const serviceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /services
  fastify.get('/', async (request, reply) => {
    const q = parse(serviceQuerySchema, request.query);

    const where: Prisma.ServiceWhereInput = { isActive: true };
    if (q.type) where.type = q.type;
    if (q.featured !== undefined) where.featured = q.featured;
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = {
        ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}),
        ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}),
      };
    }
    if (q.search) {
      where.OR = [
        ...(searchFilter(q.search, ['name', 'nameEn', 'shortDescription', 'description']) as Prisma.ServiceWhereInput[]),
        { tags: { has: q.search } },
      ];
    }

    const orderBy: Prisma.ServiceOrderByWithRelationInput[] =
      q.sortBy === 'rating'
        ? [{ rating: q.sortOrder }, { reviewCount: 'desc' }]
        : [{ [q.sortBy]: q.sortOrder }, { id: 'asc' }];

    const [services, total] = await Promise.all([
      prisma.service.findMany({ where, orderBy, skip: (q.page - 1) * q.limit, take: q.limit }),
      prisma.service.count({ where }),
    ]);

    return apiResponse.paginated(reply, services, total, q.page, q.limit);
  });

  // GET /services/featured/list
  fastify.get('/featured/list', async (request, reply) => {
    const { limit } = parse(limitQuerySchema(6), request.query);
    const services = await prisma.service.findMany({
      where: { featured: true, isActive: true },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return apiResponse.success(reply, services);
  });

  // GET /services/categories/list — distinct service types
  fastify.get('/categories/list', async (_request, reply) => {
    const rows = await prisma.service.findMany({
      where: { isActive: true },
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' },
    });
    return apiResponse.success(
      reply,
      rows.map((r) => r.type).filter(Boolean)
    );
  });

  // GET /services/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const service = await prisma.service.findFirst({
      where: { id, isActive: true },
      include: { reviews: approvedReviews },
    });
    if (!service) throw notFound('خدمت یافت نشد');
    return apiResponse.success(reply, service);
  });

  // GET /services/:id/related
  fastify.get('/:id/related', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const { limit } = parse(limitQuerySchema(3), request.query);

    const service = await prisma.service.findFirst({
      where: { id, isActive: true },
      select: { type: true },
    });
    if (!service) throw notFound('خدمت یافت نشد');

    let related = await prisma.service.findMany({
      where: { isActive: true, id: { not: id }, type: service.type },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    // Service types are often unique — fill up with featured services from other types
    if (related.length < limit) {
      const more = await prisma.service.findMany({
        where: { isActive: true, id: { notIn: [id, ...related.map((s) => s.id)] } },
        orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
        take: limit - related.length,
      });
      related = [...related, ...more];
    }
    return apiResponse.success(reply, related);
  });

  // POST /services/:id/reviews (auth) — creates a pending review
  fastify.post('/:id/reviews', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(reviewSchema, request.body);

    const [service, user, existing] = await Promise.all([
      prisma.service.findFirst({ where: { id, isActive: true }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: request.user.id } }),
      prisma.review.findFirst({ where: { serviceId: id, userId: request.user.id }, select: { id: true } }),
    ]);
    if (!service) throw notFound('خدمت یافت نشد');
    if (!user) throw notFound('کاربر یافت نشد');
    if (existing) throw conflict('شما قبلاً برای این خدمت نظر ثبت کرده‌اید');

    const review = await prisma.review.create({
      data: {
        serviceId: id,
        userId: user.id,
        userName: displayName(user),
        rating: input.rating,
        comment: input.comment,
        isApproved: false,
      },
      select: { ...reviewSelect, isApproved: true, serviceId: true },
    });

    return apiResponse.success(reply, review, 201);
  });
};
