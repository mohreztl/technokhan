import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { productQuerySchema, paginationSchema } from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';

export const productRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all products with filtering and pagination
  fastify.get('/', async (request, reply) => {
    const queryValidation = validateRequest(productQuerySchema, request.query);
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

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return apiResponse.paginated(reply, products, total, page, limit);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت محصولات', 500);
    }
  });

  // Get product by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return apiResponse.error(reply, 'محصول یافت نشد', 404);
      }

      return apiResponse.success(reply, product);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت محصول', 500);
    }
  });

  // Get featured products
  fastify.get('/featured/list', async (request, reply) => {
    try {
      const products = await prisma.product.findMany({
        where: {
          featured: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      });

      return apiResponse.success(reply, products);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت محصولات ویژه', 500);
    }
  });

  // Get product categories
  fastify.get('/categories/list', async (request, reply) => {
    try {
      const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
      });

      const categoryList = categories.map((c) => c.category).filter(Boolean);

      return apiResponse.success(reply, categoryList);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت دسته‌بندی‌ها', 500);
    }
  });

  // Get related products
  fastify.get<{ Params: { id: string } }>('/:id/related', async (request, reply) => {
    const { id } = request.params;

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        select: { category: true },
      });

      if (!product) {
        return apiResponse.error(reply, 'محصول یافت نشد', 404);
      }

      const relatedProducts = await prisma.product.findMany({
        where: {
          category: product.category,
          id: { not: id },
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
      });

      return apiResponse.success(reply, relatedProducts);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت محصولات مرتبط', 500);
    }
  });
};
