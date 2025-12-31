import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { paymentRequestSchema, paymentVerifySchema } from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';
import { sendOrderConfirmation } from '../services/sms.service';

// Zarinpal Configuration
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '';
const ZARINPAL_SANDBOX = process.env.NODE_ENV !== 'production';
const ZARINPAL_API_URL = ZARINPAL_SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://api.zarinpal.com/pg/v4/payment';
const ZARINPAL_GATEWAY_URL = ZARINPAL_SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/StartPay'
  : 'https://www.zarinpal.com/pg/StartPay';
const CALLBACK_URL = process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/payment/callback';

interface ZarinpalRequestResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee_type?: string;
    fee?: number;
  };
  errors: unknown[];
}

interface ZarinpalVerifyResponse {
  data: {
    code: number;
    message: string;
    card_hash?: string;
    card_pan?: string;
    ref_id?: number;
    fee_type?: string;
    fee?: number;
  };
  errors: unknown[];
}

export const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // All payment routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // Request payment for an order
  fastify.post('/request', async (request, reply) => {
    const validation = validateRequest(paymentRequestSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    const { orderId, callbackUrl } = validation.data;

    try {
      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        return apiResponse.error(reply, 'سفارش یافت نشد', 404);
      }

      // Check if order belongs to user
      if (order.userId !== request.user.userId) {
        return apiResponse.error(reply, 'شما دسترسی به این سفارش ندارید', 403);
      }

      // Check if order is already paid
      if (order.paymentStatus === 'paid') {
        return apiResponse.error(reply, 'این سفارش قبلاً پرداخت شده است', 400);
      }

      // Convert to Toman (Zarinpal uses Toman)
      const amountInToman = Math.round(order.totalPrice / 10);

      // Request payment from Zarinpal
      const response = await fetch(`${ZARINPAL_API_URL}/request.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: ZARINPAL_MERCHANT_ID,
          amount: amountInToman,
          callback_url: callbackUrl || CALLBACK_URL,
          description: `پرداخت سفارش شماره ${order.id}`,
          metadata: {
            mobile: order.user.phoneNumber,
            email: order.user.email || undefined,
          },
        }),
      });

      const data = (await response.json()) as ZarinpalRequestResponse;

      if (data.data.code !== 100) {
        fastify.log.error({ msg: 'Zarinpal request failed', data });
        return apiResponse.error(reply, 'خطا در ایجاد درخواست پرداخت', 500);
      }

      return apiResponse.success(reply, {
        authority: data.data.authority,
        paymentUrl: `${ZARINPAL_GATEWAY_URL}/${data.data.authority}`,
        amount: order.totalPrice,
        amountInToman,
      });
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در ایجاد درخواست پرداخت', 500);
    }
  });

  // Verify payment callback
  fastify.post('/verify', async (request, reply) => {
    const validation = validateRequest(paymentVerifySchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    const { authority, status } = validation.data;

    try {
      // Get orderId from request body
      const { orderId } = request.body as { orderId?: string };
      
      if (!orderId) {
        return apiResponse.error(reply, 'شناسه سفارش الزامی است', 400);
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        return apiResponse.error(reply, 'تراکنش یافت نشد', 404);
      }

      // Check if already verified
      if (order.paymentStatus === 'paid') {
        return apiResponse.success(reply, {
          status: 'already_verified',
          message: 'این تراکنش قبلاً تایید شده است',
        });
      }

      // If user cancelled payment
      if (status === 'NOK') {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'failed' },
        });

        return apiResponse.error(reply, 'پرداخت توسط کاربر لغو شد', 400);
      }

      // Verify with Zarinpal
      const amountInToman = Math.round(order.totalPrice / 10);

      const response = await fetch(`${ZARINPAL_API_URL}/verify.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: ZARINPAL_MERCHANT_ID,
          amount: amountInToman,
          authority,
        }),
      });

      const data = (await response.json()) as ZarinpalVerifyResponse;

      if (data.data.code === 100 || data.data.code === 101) {
        // Payment successful
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            status: 'processing',
            trackingCode: data.data.ref_id?.toString(),
          },
        });

        // Send confirmation SMS
        await sendOrderConfirmation(
          order.user.phoneNumber,
          order.id,
          order.totalPrice.toString()
        );

        return apiResponse.success(reply, {
          status: 'success',
          message: 'پرداخت با موفقیت انجام شد',
          refId: data.data.ref_id,
          cardPan: data.data.card_pan,
        });
      } else {
        // Payment failed
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'failed' },
        });

        return apiResponse.error(reply, data.data.message || 'خطا در تایید پرداخت', 400);
      }
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در تایید پرداخت', 500);
    }
  });

  // Get payment status by order ID
  fastify.get<{ Params: { orderId: string } }>('/status/:orderId', async (request, reply) => {
    const { orderId } = request.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          totalPrice: true,
          status: true,
          paymentStatus: true,
          trackingCode: true,
          createdAt: true,
        },
      });

      if (!order) {
        return apiResponse.error(reply, 'سفارش یافت نشد', 404);
      }

      return apiResponse.success(reply, {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        amount: order.totalPrice,
        refId: order.trackingCode,
        createdAt: order.createdAt,
      });
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت وضعیت تراکنش', 500);
    }
  });

  // Get user's orders (with payment info)
  fastify.get('/history', async (request, reply) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: request.user.userId,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          totalPrice: true,
          status: true,
          paymentStatus: true,
          trackingCode: true,
          createdAt: true,
        },
      });

      return apiResponse.success(reply, orders);
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در دریافت تاریخچه پرداخت‌ها', 500);
    }
  });

  // Request payment for a booking
  fastify.post('/booking/request', async (request, reply) => {
    const { bookingId, callbackUrl } = request.body as { bookingId: string; callbackUrl?: string };

    if (!bookingId) {
      return apiResponse.error(reply, 'شناسه رزرو الزامی است', 400);
    }

    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, service: true },
      });

      if (!booking) {
        return apiResponse.error(reply, 'رزرو یافت نشد', 404);
      }

      // Check if booking belongs to user
      if (booking.userId !== request.user.userId) {
        return apiResponse.error(reply, 'شما دسترسی به این رزرو ندارید', 403);
      }

      // Check if booking is already paid
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        return apiResponse.error(reply, 'این رزرو قبلاً پرداخت شده است', 400);
      }

      // Convert to Toman
      const amountInToman = Math.round(booking.totalPrice / 10);

      // Request payment from Zarinpal
      const response = await fetch(`${ZARINPAL_API_URL}/request.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: ZARINPAL_MERCHANT_ID,
          amount: amountInToman,
          callback_url: callbackUrl || CALLBACK_URL,
          description: `پرداخت رزرو ${booking.service.name}`,
          metadata: {
            mobile: booking.user.phoneNumber,
          },
        }),
      });

      const data = (await response.json()) as ZarinpalRequestResponse;

      if (data.data.code !== 100) {
        fastify.log.error({ msg: 'Zarinpal request failed', data });
        return apiResponse.error(reply, 'خطا در ایجاد درخواست پرداخت', 500);
      }

      // Store authority in booking notes
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          notes: `Authority: ${data.data.authority}`,
        },
      });

      return apiResponse.success(reply, {
        authority: data.data.authority,
        paymentUrl: `${ZARINPAL_GATEWAY_URL}/${data.data.authority}`,
        amount: booking.totalPrice,
        amountInToman,
      });
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در ایجاد درخواست پرداخت', 500);
    }
  });
};
