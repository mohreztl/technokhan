import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import {
  createProductSchema,
  updateProductSchema,
  createServiceSchema,
  updateServiceSchema,
  updateBookingStatusSchema,
  updateOrderStatusSchema,
  paginationSchema,
} from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // All admin routes require authentication and admin role
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('preHandler', fastify.adminOnly);

  // ========================================
  // DASHBOARD
  // ========================================

  // Dashboard stats
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const [
        totalUsers,
        totalProducts,
        totalServices,
        totalOrders,
        totalBookings,
        pendingOrders,
        pendingBookings,
        recentOrders,
        recentBookings,
        revenue,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.service.count(),
        prisma.order.count(),
        prisma.booking.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.booking.count({ where: { status: 'pending' } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }),
        prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: true, service: true },
        }),
        prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: { status: 'delivered' },
        }),
      ]);

      return apiResponse.success(reply, {
        stats: {
          totalUsers,
          totalProducts,
          totalServices,
          totalOrders,
          totalBookings,
          pendingOrders,
          pendingBookings,
          totalRevenue: revenue._sum?.totalPrice || 0,
        },
        recentOrders,
        recentBookings,
      });
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت آمار', 500);
    }
  });

  // ========================================
  // PRODUCTS MANAGEMENT
  // ========================================

  // Create product
  fastify.post('/products', async (request, reply) => {
    const validation = validateRequest(createProductSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    try {
      const product = await prisma.product.create({
        data: {
          ...validation.data,
          isActive: true,
          rating: 0,
          reviewCount: 0,
        },
      });

      return apiResponse.success(reply, product, 201);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در ایجاد محصول', 500);
    }
  });

  // Update product
  fastify.put<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    const { id } = request.params;
    const validation = validateRequest(updateProductSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    try {
      const product = await prisma.product.update({
        where: { id },
        data: validation.data,
      });

      return apiResponse.success(reply, product);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return apiResponse.error(reply, 'محصول یافت نشد', 404);
      }
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در به‌روزرسانی محصول', 500);
    }
  });

  // Delete product (soft delete)
  fastify.delete<{ Params: { id: string } }>('/products/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return apiResponse.success(reply, { message: 'محصول با موفقیت حذف شد' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return apiResponse.error(reply, 'محصول یافت نشد', 404);
      }
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در حذف محصول', 500);
    }
  });

  // ========================================
  // SERVICES MANAGEMENT
  // ========================================

  // Create service
  fastify.post('/services', async (request, reply) => {
    const validation = validateRequest(createServiceSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    try {
      const service = await prisma.service.create({
        data: {
          ...validation.data,
          isActive: true,
          rating: 0,
          reviewCount: 0,
        },
      });

      return apiResponse.success(reply, service, 201);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در ایجاد سرویس', 500);
    }
  });

  // Update service
  fastify.put<{ Params: { id: string } }>('/services/:id', async (request, reply) => {
    const { id } = request.params;
    const validation = validateRequest(updateServiceSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    try {
      const service = await prisma.service.update({
        where: { id },
        data: validation.data,
      });

      return apiResponse.success(reply, service);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return apiResponse.error(reply, 'سرویس یافت نشد', 404);
      }
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در به‌روزرسانی سرویس', 500);
    }
  });

  // Delete service (soft delete)
  fastify.delete<{ Params: { id: string } }>('/services/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      return apiResponse.success(reply, { message: 'سرویس با موفقیت حذف شد' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return apiResponse.error(reply, 'سرویس یافت نشد', 404);
      }
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در حذف سرویس', 500);
    }
  });

  // ========================================
  // ORDERS MANAGEMENT
  // ========================================

  // List all orders with pagination
  fastify.get('/orders', async (request, reply) => {
    const validation = validateRequest(paginationSchema, request.query);
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = validation.success
      ? validation.data
      : { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };

    try {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: true,
            items: {
              include: { product: true },
            },
          },
        }),
        prisma.order.count(),
      ]);

      return apiResponse.paginated(reply, orders, total, page, limit);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت سفارشات', 500);
    }
  });

  // Get order details
  fastify.get<{ Params: { id: string } }>('/orders/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) {
        return apiResponse.error(reply, 'سفارش یافت نشد', 404);
      }

      return apiResponse.success(reply, order);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت سفارش', 500);
    }
  });

  // Update order status
  fastify.put<{ Params: { id: string } }>('/orders/:id/status', async (request, reply) => {
    const { id } = request.params;
    const validation = validateRequest(updateOrderStatusSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    try {
      const order = await prisma.order.update({
        where: { id },
        data: { status: validation.data.status },
        include: { user: true },
      });

      // TODO: Send SMS notification to user about status change

      return apiResponse.success(reply, order);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return apiResponse.error(reply, 'سفارش یافت نشد', 404);
      }
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در به‌روزرسانی وضعیت سفارش', 500);
    }
  });

  // ========================================
  // BOOKINGS MANAGEMENT
  // ========================================

  // List all bookings with pagination
  fastify.get('/bookings', async (request, reply) => {
    const validation = validateRequest(paginationSchema, request.query);
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = validation.success
      ? validation.data
      : { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };

    try {
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: true,
            service: true,
          },
        }),
        prisma.booking.count(),
      ]);

      return apiResponse.paginated(reply, bookings, total, page, limit);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت رزروها', 500);
    }
  });

  // Get booking details
  fastify.get<{ Params: { id: string } }>('/bookings/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          service: true,
        },
      });

      if (!booking) {
        return apiResponse.error(reply, 'رزرو یافت نشد', 404);
      }

      return apiResponse.success(reply, booking);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت رزرو', 500);
    }
  });

  // Update booking status
  fastify.put<{ Params: { id: string } }>('/bookings/:id/status', async (request, reply) => {
    const { id } = request.params;
    const validation = validateRequest(updateBookingStatusSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: validation.data.status as any },
        include: { user: true, service: true },
      });

      // TODO: Send SMS notification to user about status change

      return apiResponse.success(reply, booking);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return apiResponse.error(reply, 'رزرو یافت نشد', 404);
      }
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در به‌روزرسانی وضعیت رزرو', 500);
    }
  });

  // ========================================
  // USERS MANAGEMENT
  // ========================================

  // List all users with pagination
  fastify.get('/users', async (request, reply) => {
    const validation = validateRequest(paginationSchema, request.query);
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = validation.success
      ? validation.data
      : { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };

    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            phoneNumber: true,
            name: true,
            email: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      return apiResponse.paginated(reply, users, total, page, limit);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت کاربران', 500);
    }
  });

  // Get user details
  fastify.get<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          bookings: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        return apiResponse.error(reply, 'کاربر یافت نشد', 404);
      }

      return apiResponse.success(reply, user);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت کاربر', 500);
    }
  });

  // Note: User management features (toggle-active, make-admin) will be enabled after database migration

  // ========================================
  // REVIEWS MANAGEMENT
  // Note: Review routes will be enabled after migration
  // ========================================

  // Placeholder - Reviews endpoints will be added after database migration
};
