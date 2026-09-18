import { FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { slugify, type AdminDashboardStats } from '@autolounge/shared';
import { prisma } from '../lib/prisma';
import {
  adminBookingQuerySchema,
  adminMessageQuerySchema,
  adminOrderQuerySchema,
  adminProductQuerySchema,
  adminProductSchema,
  adminProductUpdateSchema,
  adminReviewQuerySchema,
  adminServiceQuerySchema,
  adminServiceSchema,
  adminServiceUpdateSchema,
  adminUserQuerySchema,
  couponSchema,
  couponUpdateSchema,
  idParamSchema,
  siteSettingsSchema,
  updateBookingStatusSchema,
  updateOrderStatusSchema,
} from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { badRequest, conflict, notFound } from '../lib/errors';
import {
  bookingInclude,
  orderInclude,
  recomputeRating,
  searchFilter,
  stripUndefined,
  toJson,
  userSummarySelect,
} from '../lib/catalog';
import { dayRange } from '../lib/booking-time';
import { getSettings, saveSettings } from '../lib/settings';
import { sendStatusUpdate } from '../services/sms.service';

type ProductInput = z.infer<typeof adminProductSchema>;
type ServiceInput = z.infer<typeof adminServiceSchema>;

function productData(input: Partial<ProductInput>) {
  return stripUndefined({
    name: input.name,
    nameEn: input.nameEn,
    description: input.description,
    descriptionEn: input.descriptionEn,
    shortDescription: input.shortDescription,
    price: input.price,
    discountPrice: input.discountPrice,
    category: input.category,
    images: input.images,
    stock: input.stock,
    featured: input.featured,
    isActive: input.isActive,
    brand: input.brand,
    sku: input.sku,
    features: input.features,
    tags: input.tags,
    specifications: toJson(input.specifications),
  });
}

function serviceData(input: Partial<ServiceInput>) {
  return stripUndefined({
    name: input.name,
    nameEn: input.nameEn,
    description: input.description,
    descriptionEn: input.descriptionEn,
    shortDescription: input.shortDescription,
    price: input.price,
    duration: input.duration,
    type: input.type,
    images: input.images,
    featured: input.featured,
    isActive: input.isActive,
    features: input.features,
    tags: input.tags,
    pricing: toJson(input.pricing),
    addons: toJson(input.addons),
    warrantyMonths: input.warrantyMonths,
  });
}

/** slug id from the English name, salted when taken */
async function uniqueId(model: 'product' | 'service', requested: string | undefined, nameEn: string) {
  if (requested) {
    const exists =
      model === 'product'
        ? await prisma.product.findUnique({ where: { id: requested }, select: { id: true } })
        : await prisma.service.findUnique({ where: { id: requested }, select: { id: true } });
    if (exists) throw conflict('شناسه انتخاب‌شده قبلاً استفاده شده است');
    return requested;
  }
  const base = slugify(nameEn).replace(/[^a-z0-9-]/g, '') || undefined;
  if (!base) return undefined; // fall back to cuid()
  const exists =
    model === 'product'
      ? await prisma.product.findUnique({ where: { id: base }, select: { id: true } })
      : await prisma.service.findUnique({ where: { id: base }, select: { id: true } });
  return exists ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base;
}

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin);

  // ------------------------------------------------------------------
  // Dashboard
  // ------------------------------------------------------------------
  fastify.get('/dashboard', async (_request, reply) => {
    const [
      users,
      orders,
      bookings,
      products,
      services,
      pendingOrders,
      pendingBookings,
      unreadMessages,
      revenueAgg,
      recentOrders,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.booking.count(),
      prisma.product.count(),
      prisma.service.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.order.aggregate({ _sum: { totalPrice: true }, where: { paymentStatus: 'paid' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { ...orderInclude, user: { select: userSummarySelect } },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { ...bookingInclude, user: { select: userSummarySelect } },
      }),
    ]);

    const stats: AdminDashboardStats = {
      users,
      orders,
      bookings,
      products,
      services,
      revenue: revenueAgg._sum.totalPrice ?? 0,
      pendingOrders,
      pendingBookings,
      unreadMessages,
      recentOrders: recentOrders as unknown as AdminDashboardStats['recentOrders'],
      recentBookings: recentBookings as unknown as AdminDashboardStats['recentBookings'],
    };
    return apiResponse.success(reply, stats);
  });

  // ------------------------------------------------------------------
  // Products
  // ------------------------------------------------------------------
  fastify.get('/products', async (request, reply) => {
    const q = parse(adminProductQuerySchema, request.query);
    const where: Prisma.ProductWhereInput = {};
    if (q.category) where.category = q.category;
    if (q.isActive !== undefined) where.isActive = q.isActive;
    if (q.search) where.OR = searchFilter(q.search, ['id', 'name', 'nameEn', 'brand', 'sku']) as Prisma.ProductWhereInput[];

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      prisma.product.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.get('/products/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: 'desc' } }, _count: { select: { orderItems: true } } },
    });
    if (!product) throw notFound('محصول یافت نشد');
    return apiResponse.success(reply, product);
  });

  fastify.post('/products', async (request, reply) => {
    const input = parse(adminProductSchema, request.body);
    const id = await uniqueId('product', input.id, input.nameEn);
    const product = await prisma.product.create({
      data: { ...(id ? { id } : {}), ...productData(input), rating: 0, reviewCount: 0 } as Prisma.ProductUncheckedCreateInput,
    });
    return apiResponse.success(reply, product, 201);
  });

  fastify.put('/products/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(adminProductUpdateSchema, request.body);
    const product = await prisma.product.update({ where: { id }, data: productData(input) });
    return apiResponse.success(reply, product);
  });

  // soft delete — order items keep their product reference
  fastify.delete('/products/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const product = await prisma.product.update({ where: { id }, data: { isActive: false, featured: false } });
    return apiResponse.success(reply, product);
  });

  // ------------------------------------------------------------------
  // Services
  // ------------------------------------------------------------------
  fastify.get('/services', async (request, reply) => {
    const q = parse(adminServiceQuerySchema, request.query);
    const where: Prisma.ServiceWhereInput = {};
    if (q.type) where.type = q.type;
    if (q.isActive !== undefined) where.isActive = q.isActive;
    if (q.search) where.OR = searchFilter(q.search, ['id', 'name', 'nameEn']) as Prisma.ServiceWhereInput[];

    const [items, total] = await Promise.all([
      prisma.service.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      prisma.service.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.get('/services/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const service = await prisma.service.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: 'desc' } }, _count: { select: { bookings: true } } },
    });
    if (!service) throw notFound('خدمت یافت نشد');
    return apiResponse.success(reply, service);
  });

  fastify.post('/services', async (request, reply) => {
    const input = parse(adminServiceSchema, request.body);
    const id = await uniqueId('service', input.id, input.nameEn);
    const service = await prisma.service.create({
      data: { ...(id ? { id } : {}), ...serviceData(input), rating: 0, reviewCount: 0 } as Prisma.ServiceUncheckedCreateInput,
    });
    return apiResponse.success(reply, service, 201);
  });

  fastify.put('/services/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(adminServiceUpdateSchema, request.body);
    const service = await prisma.service.update({ where: { id }, data: serviceData(input) });
    return apiResponse.success(reply, service);
  });

  fastify.delete('/services/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const service = await prisma.service.update({ where: { id }, data: { isActive: false, featured: false } });
    return apiResponse.success(reply, service);
  });

  // ------------------------------------------------------------------
  // Orders
  // ------------------------------------------------------------------
  fastify.get('/orders', async (request, reply) => {
    const q = parse(adminOrderQuerySchema, request.query);
    const where: Prisma.OrderWhereInput = {};
    if (q.status) where.status = q.status;
    if (q.search) {
      where.OR = [
        { id: { contains: q.search } },
        { trackingCode: { contains: q.search, mode: 'insensitive' } },
        { shipmentCode: { contains: q.search, mode: 'insensitive' } },
        { user: { phoneNumber: { contains: q.search } } },
        { user: { name: { contains: q.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { ...orderInclude, user: { select: userSummarySelect } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.get('/orders/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { ...orderInclude, user: { select: userSummarySelect } },
    });
    if (!order) throw notFound('سفارش یافت نشد');
    return apiResponse.success(reply, order);
  });

  fastify.put('/orders/:id/status', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(updateOrderStatusSchema, request.body);

    const existing = await prisma.order.findUnique({ where: { id }, include: { items: true, user: true } });
    if (!existing) throw notFound('سفارش یافت نشد');

    const order = await prisma.$transaction(async (tx) => {
      // cancelling a live order puts the stock back
      if (input.status === 'cancelled' && existing.status !== 'cancelled') {
        for (const item of existing.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
      // re-activating a cancelled order takes it again
      if (input.status !== 'cancelled' && existing.status === 'cancelled') {
        for (const item of existing.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }
      const codDelivered = existing.paymentMethod === 'cod' && input.status === 'delivered';
      return tx.order.update({
        where: { id },
        data: {
          status: input.status,
          ...(input.shipmentCode !== undefined ? { shipmentCode: input.shipmentCode || null } : {}),
          ...(codDelivered ? { paymentStatus: 'paid' } : {}),
        },
        include: { ...orderInclude, user: { select: userSummarySelect } },
      });
    });

    if (existing.status !== input.status) {
      void sendStatusUpdate(existing.user.phoneNumber, 'order', input.status);
    }
    return apiResponse.success(reply, order);
  });

  // ------------------------------------------------------------------
  // Bookings
  // ------------------------------------------------------------------
  fastify.get('/bookings', async (request, reply) => {
    const q = parse(adminBookingQuerySchema, request.query);
    const where: Prisma.BookingWhereInput = {};
    if (q.status) where.status = q.status;
    if (q.date) where.date = dayRange(q.date);

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { ...bookingInclude, user: { select: userSummarySelect } },
        orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.booking.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.get('/bookings/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ...bookingInclude,
        user: { select: userSummarySelect },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!booking) throw notFound('رزرو یافت نشد');
    return apiResponse.success(reply, booking);
  });

  fastify.put('/bookings/:id/status', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(updateBookingStatusSchema, request.body);

    const existing = await prisma.booking.findUnique({ where: { id }, include: { user: true } });
    if (!existing) throw notFound('رزرو یافت نشد');

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: input.status },
      include: { ...bookingInclude, user: { select: userSummarySelect } },
    });

    if (existing.status !== input.status) {
      void sendStatusUpdate(existing.user.phoneNumber, 'booking', input.status);
    }
    return apiResponse.success(reply, booking);
  });

  // ------------------------------------------------------------------
  // Users
  // ------------------------------------------------------------------
  fastify.get('/users', async (request, reply) => {
    const q = parse(adminUserQuerySchema, request.query);
    const where: Prisma.UserWhereInput = {};
    if (q.search) {
      where.OR = [
        { phoneNumber: { contains: q.search } },
        { name: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: {
          ...userSummarySelect,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true, bookings: true, reviews: true, addresses: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.get('/users/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userSummarySelect,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, bookings: true, reviews: true, addresses: true } },
        orders: { take: 10, orderBy: { createdAt: 'desc' }, include: orderInclude },
        bookings: { take: 10, orderBy: { createdAt: 'desc' }, include: bookingInclude },
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
      },
    });
    if (!user) throw notFound('کاربر یافت نشد');
    return apiResponse.success(reply, user);
  });

  // ------------------------------------------------------------------
  // Contact messages
  // ------------------------------------------------------------------
  fastify.get('/messages', async (request, reply) => {
    const q = parse(adminMessageQuerySchema, request.query);
    const where: Prisma.ContactMessageWhereInput = {};
    if (q.unread !== undefined) where.isRead = !q.unread;

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit }),
      prisma.contactMessage.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.put('/messages/:id/read', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const message = await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
    return apiResponse.success(reply, message);
  });

  // ------------------------------------------------------------------
  // Reviews
  // ------------------------------------------------------------------
  const adminReviewInclude = {
    product: { select: { id: true, name: true } },
    service: { select: { id: true, name: true } },
    user: { select: userSummarySelect },
  } satisfies Prisma.ReviewInclude;

  fastify.get('/reviews', async (request, reply) => {
    const q = parse(adminReviewQuerySchema, request.query);
    const where: Prisma.ReviewWhereInput = {};
    if (q.approved !== undefined) where.isApproved = q.approved;

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: adminReviewInclude,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.review.count({ where }),
    ]);
    return apiResponse.paginated(reply, items, total, q.page, q.limit);
  });

  fastify.put('/reviews/:id/approve', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const review = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({ where: { id }, data: { isApproved: true }, include: adminReviewInclude });
      await recomputeRating(tx, updated);
      return updated;
    });
    return apiResponse.success(reply, review);
  });

  fastify.delete('/reviews/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const review = await prisma.$transaction(async (tx) => {
      const deleted = await tx.review.delete({ where: { id } });
      await recomputeRating(tx, deleted);
      return deleted;
    });
    return apiResponse.success(reply, review);
  });

  // ------------------------------------------------------------------
  // Coupons
  // ------------------------------------------------------------------

  /** `expiresAt` arrives as yyyy-MM-dd or an ISO string; store end-of-day UTC for a bare date. */
  const expiryDate = (value: string | undefined): Date | null | undefined => {
    if (value === undefined) return undefined;
    if (!value) return null;
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59.999Z` : value;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) throw badRequest('تاریخ انقضا معتبر نیست');
    return parsed;
  };

  fastify.get('/coupons', async (_request, reply) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return apiResponse.success(reply, coupons);
  });

  fastify.post('/coupons', async (request, reply) => {
    const input = parse(couponSchema, request.body);
    const existing = await prisma.coupon.findUnique({ where: { code: input.code }, select: { id: true } });
    if (existing) throw conflict('کد تخفیف با این عنوان از قبل وجود دارد');

    const coupon = await prisma.coupon.create({
      data: {
        code: input.code,
        type: input.type,
        value: input.value,
        description: input.description,
        minTotal: input.minTotal ?? null,
        maxDiscount: input.maxDiscount ?? null,
        expiresAt: expiryDate(input.expiresAt) ?? null,
        isActive: input.isActive,
        usageLimit: input.usageLimit ?? null,
      },
    });
    return apiResponse.success(reply, coupon, 201);
  });

  fastify.put('/coupons/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(couponUpdateSchema, request.body);

    if (input.code) {
      const clash = await prisma.coupon.findUnique({ where: { code: input.code }, select: { id: true } });
      if (clash && clash.id !== id) throw conflict('کد تخفیف با این عنوان از قبل وجود دارد');
    }

    // The schema can only cap a percentage when the edit carries both fields.
    // Switching a 500,000-toman fixed coupon to `percent` sends just the type,
    // so the cap is re-checked against what the row will actually hold.
    const current = await prisma.coupon.findUnique({ where: { id }, select: { type: true, value: true } });
    if (!current) throw notFound('کد تخفیف پیدا نشد');
    const merged = { type: input.type ?? current.type, value: input.value ?? current.value };
    if (merged.type === 'percent' && merged.value > 100) {
      throw badRequest('درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد');
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: stripUndefined({
        code: input.code,
        type: input.type,
        value: input.value,
        description: input.description,
        minTotal: input.minTotal,
        maxDiscount: input.maxDiscount,
        expiresAt: expiryDate(input.expiresAt),
        isActive: input.isActive,
        usageLimit: input.usageLimit,
      }),
    });
    return apiResponse.success(reply, coupon);
  });

  fastify.delete('/coupons/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    // Orders keep the code they were placed with, so deleting one is safe.
    const deleted = await prisma.coupon.delete({ where: { id }, select: { id: true } });
    return apiResponse.success(reply, deleted);
  });

  // ------------------------------------------------------------------
  // Site settings
  // ------------------------------------------------------------------

  fastify.get('/settings', async (_request, reply) => {
    return apiResponse.success(reply, await getSettings());
  });

  fastify.put('/settings', async (request, reply) => {
    const input = parse(siteSettingsSchema, request.body);
    return apiResponse.success(reply, await saveSettings(input));
  });
};
