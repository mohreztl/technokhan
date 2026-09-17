import { FastifyPluginAsync } from 'fastify';
import { Prisma, OrderStatus } from '@prisma/client';
import { COUPONS, applyCoupon, computeOrderTotals, effectivePrice, trackingCodeFromId } from '@autolounge/shared';
import { prisma } from '../lib/prisma';
import {
  createOrderSchema,
  idParamSchema,
  listStatusQuerySchema,
  shippingAddressSchema,
  validateCouponSchema,
} from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors';
import { orderInclude } from '../lib/catalog';
import { sendOrderConfirmation } from '../services/sms.service';

const ORDER_STATUSES = Object.values(OrderStatus) as string[];

export const orderRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /orders/validate-coupon (public)
  fastify.post('/validate-coupon', async (request, reply) => {
    const { code, subtotal } = parse(validateCouponSchema, request.body);
    return apiResponse.success(reply, applyCoupon(code, subtotal, COUPONS));
  });

  // POST /orders
  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const input = parse(createOrderSchema, request.body);

    // merge duplicate lines
    const quantities = new Map<string, number>();
    for (const item of input.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    const productIds = Array.from(quantities.keys());

    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      throw badRequest('برخی از محصولات یافت نشد یا غیرفعال است', {
        missing: productIds.filter((id) => !found.has(id)),
      });
    }

    const shortage = products.find((p) => p.stock < (quantities.get(p.id) ?? 0));
    if (shortage) throw conflict(`موجودی «${shortage.name}» کافی نیست`);

    const lines = products.map((p) => ({
      product: { price: p.price, discountPrice: p.discountPrice ?? undefined },
      quantity: quantities.get(p.id) ?? 0,
    }));
    const totals = computeOrderTotals(lines, input.couponCode, COUPONS);
    if (input.couponCode && !totals.coupon.valid) {
      throw badRequest(totals.coupon.message || 'کد تخفیف نامعتبر است');
    }

    const orderItems = products.map((p) => ({
      productId: p.id,
      quantity: quantities.get(p.id) ?? 0,
      price: effectivePrice({ price: p.price, discountPrice: p.discountPrice ?? undefined }),
    }));

    const { isDefault: _ignored, ...shippingAddress } = input.shippingAddress;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        const res = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (res.count !== 1) throw conflict('موجودی برخی محصولات کافی نیست');
      }

      const created = await tx.order.create({
        data: {
          userId: request.user.id,
          subtotal: totals.subtotal,
          discount: totals.couponDiscount,
          shippingCost: totals.shipping,
          totalPrice: totals.total,
          shippingAddress: shippingAddress as Prisma.InputJsonObject,
          status: input.paymentMethod === 'cod' ? 'processing' : 'pending',
          paymentStatus: 'pending',
          paymentMethod: input.paymentMethod,
          couponCode: totals.coupon.valid ? totals.coupon.code : null,
          notes: input.notes,
          items: { create: orderItems },
        },
        select: { id: true },
      });

      return tx.order.update({
        where: { id: created.id },
        data: { trackingCode: trackingCodeFromId('OR', created.id) },
        include: orderInclude,
      });
    });

    void sendOrderConfirmation(request.user.phoneNumber, order.trackingCode ?? order.id, order.totalPrice);

    return apiResponse.success(reply, order, 201);
  });

  // GET /orders/my-orders
  fastify.get('/my-orders', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const q = parse(listStatusQuerySchema, request.query);
    if (q.status && !ORDER_STATUSES.includes(q.status)) throw badRequest('وضعیت نامعتبر است');

    const where: Prisma.OrderWhereInput = { userId: request.user.id };
    if (q.status) where.status = q.status as OrderStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return apiResponse.paginated(reply, orders, total, q.page, q.limit);
  });

  // GET /orders/:id
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw notFound('سفارش یافت نشد');
    if (order.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این سفارش دسترسی ندارید');
    }
    return apiResponse.success(reply, order);
  });

  // DELETE /orders/:id — cancel (pending only), restores stock
  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw notFound('سفارش یافت نشد');
    if (order.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این سفارش دسترسی ندارید');
    }
    if (order.status !== 'pending') throw conflict('فقط سفارش‌های در انتظار پرداخت قابل لغو هستند');

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.order.update({ where: { id }, data: { status: 'cancelled' }, include: orderInclude });
    });

    return apiResponse.success(reply, updated);
  });

  // PUT /orders/:id/address — only while pending
  fastify.put('/:id/address', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const { isDefault: _ignored, ...address } = parse(shippingAddressSchema, request.body);

    const order = await prisma.order.findUnique({ where: { id }, select: { userId: true, status: true } });
    if (!order) throw notFound('سفارش یافت نشد');
    if (order.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این سفارش دسترسی ندارید');
    }
    if (order.status !== 'pending' && order.status !== 'processing') {
      throw conflict('آدرس سفارش ارسال‌شده قابل تغییر نیست');
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { shippingAddress: address as Prisma.InputJsonObject },
      include: orderInclude,
    });
    return apiResponse.success(reply, updated);
  });
};
