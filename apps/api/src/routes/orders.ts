import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { createOrderSchema, paginationSchema, shippingAddressSchema } from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';
import { sendOrderConfirmation } from '../services/sms.service';

export const orderRoutes: FastifyPluginAsync = async (fastify) => {
  // Create order
  fastify.post(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const validation = validateRequest(createOrderSchema, request.body);
      if (!validation.success) {
        return apiResponse.error(reply, validation.error, 400);
      }

      try {
        const { items, shippingAddress } = validation.data;

        // Validate products exist and get prices
        const productIds = items.map((item) => item.productId);
        const products = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            isActive: true,
          },
        });

        if (products.length !== productIds.length) {
          return apiResponse.error(reply, 'برخی از محصولات یافت نشد یا موجود نیست', 400);
        }

        // Check stock availability
        const stockIssues = items.filter((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product && product.stock < item.quantity;
        });

        if (stockIssues.length > 0) {
          return apiResponse.error(reply, 'موجودی برخی محصولات کافی نیست', 400);
        }

        // Calculate total
        const orderItems = items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        });

        const totalPrice = orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
          // Create the order
          const newOrder = await tx.order.create({
            data: {
              userId: request.user.userId,
              totalPrice,
              shippingAddress: JSON.stringify(shippingAddress),
              status: 'pending',
              items: {
                create: orderItems,
              },
            },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      images: true,
                    },
                  },
                },
              },
            },
          });

          // Update stock
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          return newOrder;
        });

        // Get user for SMS
        const user = await prisma.user.findUnique({
          where: { id: request.user.userId },
        });

        // Send confirmation SMS
        if (user) {
          await sendOrderConfirmation(user.phoneNumber, order.id, totalPrice.toString());
        }

        return apiResponse.success(
          reply,
          {
            order,
            message: 'سفارش با موفقیت ثبت شد',
          },
          201
        );
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در ثبت سفارش', 500);
      }
    }
  );

  // Get user orders
  fastify.get(
    '/my-orders',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const validation = validateRequest(paginationSchema, request.query);
      const { page = 1, limit = 10 } = validation.success
        ? validation.data
        : { page: 1, limit: 10 };

      try {
        const [orders, total] = await Promise.all([
          prisma.order.findMany({
            where: { userId: request.user.userId },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      images: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.order.count({
            where: { userId: request.user.userId },
          }),
        ]);

        return apiResponse.paginated(reply, orders, total, page, limit);
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در دریافت سفارشات', 500);
      }
    }
  );

  // Get single order
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const order = await prisma.order.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                id: true,
                phoneNumber: true,
                name: true,
              },
            },
          },
        });

        if (!order) {
          return apiResponse.error(reply, 'سفارش یافت نشد', 404);
        }

        // Check ownership (unless admin)
        if (order.userId !== request.user.userId && request.user.role !== 'admin') {
          return apiResponse.error(reply, 'شما دسترسی به این سفارش ندارید', 403);
        }

        return apiResponse.success(reply, order);
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در دریافت سفارش', 500);
      }
    }
  );

  // Cancel order (only pending orders)
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const order = await prisma.order.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!order) {
          return apiResponse.error(reply, 'سفارش یافت نشد', 404);
        }

        // Check ownership
        if (order.userId !== request.user.userId && request.user.role !== 'admin') {
          return apiResponse.error(reply, 'شما دسترسی به این سفارش ندارید', 403);
        }

        // Only pending orders can be cancelled
        if (order.status !== 'pending') {
          return apiResponse.error(
            reply,
            'فقط سفارشات در انتظار پرداخت قابل لغو هستند',
            400
          );
        }

        // Cancel order and restore stock
        await prisma.$transaction(async (tx) => {
          // Update order status
          await tx.order.update({
            where: { id },
            data: { status: 'cancelled' },
          });

          // Restore stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        });

        return apiResponse.success(reply, { message: 'سفارش با موفقیت لغو شد' });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در لغو سفارش', 500);
      }
    }
  );

  // Update shipping address (only pending orders)
  fastify.put<{ Params: { id: string } }>(
    '/:id/address',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;
      const validation = validateRequest(shippingAddressSchema, request.body);
      if (!validation.success) {
        return apiResponse.error(reply, validation.error, 400);
      }

      try {
        const order = await prisma.order.findUnique({
          where: { id },
        });

        if (!order) {
          return apiResponse.error(reply, 'سفارش یافت نشد', 404);
        }

        // Check ownership
        if (order.userId !== request.user.userId) {
          return apiResponse.error(reply, 'شما دسترسی به این سفارش ندارید', 403);
        }

        // Only pending orders can have address updated
        if (order.status !== 'pending') {
          return apiResponse.error(
            reply,
            'آدرس سفارشات پرداخت شده قابل تغییر نیست',
            400
          );
        }

        const updated = await prisma.order.update({
          where: { id },
          data: { shippingAddress: JSON.stringify(validation.data) },
        });

        return apiResponse.success(reply, {
          message: 'آدرس سفارش با موفقیت به‌روزرسانی شد',
          shippingAddress: updated.shippingAddress,
        });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در به‌روزرسانی آدرس', 500);
      }
    }
  );
};
