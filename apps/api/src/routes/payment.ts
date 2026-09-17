import { FastifyPluginAsync } from 'fastify';
import type { PaymentRequestResult, PaymentVerifyResult } from '@autolounge/shared';
import { prisma } from '../lib/prisma';
import { config as appConfig, isDemoGateway } from '../config';
import * as zarinpal from '../services/zarinpal.service';
import { sendPaymentConfirmation } from '../services/sms.service';
import { bookingPaymentRequestSchema, paymentRequestSchema, paymentVerifySchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { forbidden, notFound, paymentError } from '../lib/errors';

const DEMO_PREFIX = 'DEMO-';

interface StartPaymentInput {
  orderId?: string;
  bookingId?: string;
  amount: number;
  callbackUrl?: string;
  description: string;
  mobile: string;
  email?: string | null;
}

/**
 * Create the PaymentTransaction row and obtain an authority — from Zarinpal,
 * or simulated when no merchant id is configured outside production.
 */
async function startPayment(input: StartPaymentInput): Promise<PaymentRequestResult> {
  const amount = Math.round(input.amount);
  // The web app sends a site-relative path; Zarinpal needs an absolute URL.
  const requested = input.callbackUrl || appConfig.paymentCallbackUrl;
  const callbackUrl = requested.startsWith('/') ? `${appConfig.webUrl}${requested}` : requested;
  const demo = isDemoGateway();

  const tx = await prisma.paymentTransaction.create({
    data: {
      orderId: input.orderId,
      bookingId: input.bookingId,
      amount,
      status: 'pending',
      gateway: demo ? 'demo' : 'zarinpal',
    },
  });

  if (demo) {
    const authority = `${DEMO_PREFIX}${tx.id}`;
    await prisma.paymentTransaction.update({ where: { id: tx.id }, data: { authority } });
    const separator = callbackUrl.includes('?') ? '&' : '?';
    return {
      authority,
      paymentUrl: `${callbackUrl}${separator}Authority=${authority}&Status=OK`,
      amount,
      demo: true,
    };
  }

  const result = await zarinpal.requestPayment({
    amount,
    callbackUrl,
    description: input.description,
    mobile: input.mobile,
    email: input.email,
  });

  if (!result.ok) {
    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: { status: 'failed', errorCode: String(result.code), errorMessage: result.message },
    });
    throw paymentError(result.message, 502, { gatewayCode: result.code });
  }

  await prisma.paymentTransaction.update({
    where: { id: tx.id },
    data: { authority: result.authority },
  });

  return { authority: result.authority, paymentUrl: result.paymentUrl, amount };
}

const txInclude = {
  order: { include: { user: { select: { phoneNumber: true } } } },
  booking: { include: { user: { select: { phoneNumber: true } } } },
} as const;

export const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /payment/request — order
  fastify.post('/request', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { orderId, callbackUrl } = parse(paymentRequestSchema, request.body);

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
    if (!order) throw notFound('سفارش یافت نشد');
    if (order.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این سفارش دسترسی ندارید');
    }
    if (order.paymentStatus === 'paid') throw paymentError('این سفارش قبلاً پرداخت شده است', 400);
    if (order.status === 'cancelled') throw paymentError('سفارش لغو شده قابل پرداخت نیست', 400);
    if (order.paymentMethod === 'cod') {
      throw paymentError('روش پرداخت این سفارش «پرداخت در محل» است', 400);
    }

    const result = await startPayment({
      orderId: order.id,
      amount: order.totalPrice,
      callbackUrl,
      description: `پرداخت سفارش ${order.trackingCode ?? order.id} — اتولانژ`,
      mobile: order.user.phoneNumber,
      email: order.user.email,
    });

    return apiResponse.success(reply, result);
  });

  // POST /payment/booking/request — booking
  fastify.post('/booking/request', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { bookingId, callbackUrl } = parse(bookingPaymentRequestSchema, request.body);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, service: { select: { name: true } } },
    });
    if (!booking) throw notFound('رزرو یافت نشد');
    if (booking.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این رزرو دسترسی ندارید');
    }
    if (booking.status === 'cancelled') throw paymentError('رزرو لغو شده قابل پرداخت نیست', 400);
    if (booking.status !== 'pending') throw paymentError('این رزرو قبلاً پرداخت/تأیید شده است', 400);

    const result = await startPayment({
      bookingId: booking.id,
      amount: booking.totalPrice,
      callbackUrl,
      description: `پرداخت رزرو ${booking.service.name} (${booking.trackingCode ?? booking.id}) — اتولانژ`,
      mobile: booking.user.phoneNumber,
      email: booking.user.email,
    });

    return apiResponse.success(reply, result);
  });

  // POST /payment/verify — gateway callback (looked up by authority; public)
  fastify.post('/verify', async (request, reply) => {
    const { authority, status } = parse(paymentVerifySchema, request.body);

    const tx = await prisma.paymentTransaction.findUnique({ where: { authority }, include: txInclude });
    if (!tx) throw notFound('تراکنش یافت نشد');

    const base: PaymentVerifyResult = {
      success: false,
      amount: tx.amount,
      orderId: tx.orderId ?? undefined,
      bookingId: tx.bookingId ?? undefined,
    };

    if (tx.status === 'success') {
      return apiResponse.success(reply, {
        ...base,
        success: true,
        refId: tx.refId ?? undefined,
        cardNumber: tx.cardNumber ?? undefined,
        message: 'این تراکنش قبلاً تأیید شده است',
      });
    }

    // Refuse before capturing: an unverified Zarinpal transaction is reversed automatically,
    // so bailing out here is what keeps a cancelled order from being charged.
    if (tx.order?.status === 'cancelled' || tx.booking?.status === 'cancelled') {
      await markFailed(tx.id, tx.orderId, 'CANCELLED', 'سفارش یا رزرو پیش از پرداخت لغو شده بود');
      return apiResponse.success(reply, {
        ...base,
        message: 'این سفارش پیش از تکمیل پرداخت لغو شده بود و مبلغی کسر نشد',
      });
    }

    if (status === 'NOK') {
      await markFailed(tx.id, tx.orderId, 'NOK', 'پرداخت توسط کاربر لغو شد');
      return apiResponse.success(reply, { ...base, message: 'پرداخت لغو شد' });
    }

    let refId: string;
    let cardNumber: string | undefined;

    if (authority.startsWith(DEMO_PREFIX)) {
      if (appConfig.isProduction || tx.gateway !== 'demo') {
        throw paymentError('تراکنش نمایشی در این محیط پذیرفته نمی‌شود', 400);
      }
      refId = `DEMO${Date.now().toString().slice(-9)}`;
      cardNumber = '6219-86**-****-0000';
    } else {
      const result = await zarinpal.verifyPayment({ amount: tx.amount, authority });
      if (!result.ok) {
        await markFailed(tx.id, tx.orderId, String(result.code), result.message);
        return apiResponse.success(reply, { ...base, message: result.message });
      }
      refId = result.refId;
      cardNumber = result.cardPan;
    }

    await prisma.$transaction(async (db) => {
      await db.paymentTransaction.update({
        where: { id: tx.id },
        data: { status: 'success', refId, cardNumber, errorCode: null, errorMessage: null },
      });
      if (tx.orderId) {
        await db.order.update({
          where: { id: tx.orderId },
          data: {
            paymentStatus: 'paid',
            ...(tx.order?.status === 'pending' ? { status: 'processing' } : {}),
          },
        });
      }
      if (tx.bookingId) {
        await db.booking.update({
          where: { id: tx.bookingId },
          data: { ...(tx.booking?.status === 'pending' ? { status: 'confirmed' } : {}) },
        });
      }
    });

    const phone = tx.order?.user.phoneNumber ?? tx.booking?.user.phoneNumber;
    const code = tx.order?.trackingCode ?? tx.booking?.trackingCode ?? tx.orderId ?? tx.bookingId ?? '';
    if (phone) void sendPaymentConfirmation(phone, tx.orderId ? 'order' : 'booking', code, refId);

    return apiResponse.success(reply, {
      ...base,
      success: true,
      refId,
      cardNumber,
      message: 'پرداخت با موفقیت انجام شد',
    });
  });

  // GET /payment/status/:orderId
  fastify.get('/status/:orderId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        totalPrice: true,
        trackingCode: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw notFound('سفارش یافت نشد');
    if (order.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این سفارش دسترسی ندارید');
    }
    return apiResponse.success(reply, {
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.totalPrice,
      trackingCode: order.trackingCode,
      transactions: order.transactions,
    });
  });

  // GET /payment/history
  fastify.get('/history', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        OR: [{ order: { userId: request.user.id } }, { booking: { userId: request.user.id } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return apiResponse.success(reply, transactions);
  });
};

async function markFailed(txId: string, orderId: string | null, code: string, message: string) {
  await prisma.$transaction(async (db) => {
    await db.paymentTransaction.update({
      where: { id: txId },
      data: { status: 'failed', errorCode: code, errorMessage: message },
    });
    if (orderId) {
      await db.order.updateMany({
        where: { id: orderId, paymentStatus: 'pending' },
        data: { paymentStatus: 'failed' },
      });
    }
  });
}
