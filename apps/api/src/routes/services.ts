import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { serviceQuerySchema, paginationSchema } from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';

export const serviceRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all services with filtering and pagination
  fastify.get('/', async (request, reply) => {
    const queryValidation = validateRequest(serviceQuerySchema, request.query);
    const paginationValidation = validateRequest(paginationSchema, request.query);

    const {
      category,
      minPrice,
      maxPrice,
      featured,
      search,
    } = queryValidation.success ? queryValidation.data : {};

    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } =
      paginationValidation.success ? paginationValidation.data : { page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' as const };

    try {
      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = category;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      if (featured !== undefined) {
        where.featured = featured;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.service.count({ where }),
      ]);

      return apiResponse.paginated(reply, services, total, page, limit);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت خدمات', 500);
    }
  });

  // Get service by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const service = await prisma.service.findUnique({
        where: { id },
      });

      if (!service) {
        return apiResponse.error(reply, 'خدمت یافت نشد', 404);
      }

      return apiResponse.success(reply, service);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت خدمت', 500);
    }
  });

  // Get featured services
  fastify.get('/featured/list', async (request, reply) => {
    try {
      const services = await prisma.service.findMany({
        where: {
          featured: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      });

      return apiResponse.success(reply, services);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت خدمات ویژه', 500);
    }
  });

  // Get service types (categories)
  fastify.get('/categories/list', async (request, reply) => {
    try {
      const types = await prisma.service.findMany({
        select: { type: true },
        distinct: ['type'],
      });

      const typeList = types.map((t) => t.type).filter(Boolean);

      return apiResponse.success(reply, typeList);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت دسته‌بندی‌ها', 500);
    }
  });

  // Get related services
  fastify.get<{ Params: { id: string } }>('/:id/related', async (request, reply) => {
    const { id } = request.params;

    try {
      const service = await prisma.service.findUnique({
        where: { id },
        select: { type: true },
      });

      if (!service) {
        return apiResponse.error(reply, 'خدمت یافت نشد', 404);
      }

      const relatedServices = await prisma.service.findMany({
        where: {
          type: service.type,
          id: { not: id },
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
      });

      return apiResponse.success(reply, relatedServices);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت خدمات مرتبط', 500);
    }
  });
};