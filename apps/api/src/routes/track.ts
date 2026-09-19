import { FastifyPluginAsync } from 'fastify';
import { normalizePhoneNumber, trackingCodeKind } from '@autolounge/shared';
import type { TrackResult } from '@autolounge/shared';

import { prisma } from '../lib/prisma';
import { config as appConfig } from '../config';
import { trackSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { notFound } from '../lib/errors';

/**
 * Public order and booking tracking, for customers who never made an account.
 *
 * A tracking code is six characters and sits in an SMS, so it is treated as a
 * weak secret: the caller also has to supply the phone number on the record,
 * the route is rate-limited like the OTP endpoints, and a wrong code and a
 * wrong phone number produce exactly the same answer so neither can be used to
 * enumerate the other. What comes back carries no address, name or phone.
 */
export const trackRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', { config: { rateLimit: appConfig.rateLimit.otp } }, async (request, reply) => {
    const input = parse(trackSchema, request.body);
    const phone = normalizePhoneNumber(input.phoneNumber);
    const missing = notFound('سفارش یا رزروی با این کد و شمارهٔ موبایل پیدا نشد');

    if (trackingCodeKind(input.code) === 'booking') {
      const booking = await prisma.booking.findUnique({
        where: { trackingCode: input.code },
        select: {
          status: true,
          totalPrice: true,
          date: true,
          timeSlot: true,
          createdAt: true,
          updatedAt: true,
          service: { select: { name: true } },
          user: { select: { phoneNumber: true } },
        },
      });
      if (!booking || normalizePhoneNumber(booking.user.phoneNumber) !== phone) throw missing;

      const result: TrackResult = {
        kind: 'booking',
        code: input.code,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        totalPrice: booking.totalPrice,
        serviceName: booking.service.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
      };
      return apiResponse.success(reply, result);
    }

    const order = await prisma.order.findUnique({
      where: { trackingCode: input.code },
      select: {
        status: true,
        paymentStatus: true,
        totalPrice: true,
        shipmentCode: true,
        shippingAddress: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
        user: { select: { phoneNumber: true } },
      },
    });
    if (!order) throw missing;

    // Either the account that placed it or the person it ships to may look it up.
    const address = (order.shippingAddress ?? {}) as { phoneNumber?: string; province?: string; city?: string };
    const owners = [order.user.phoneNumber, address.phoneNumber].map((p) => normalizePhoneNumber(p ?? ''));
    if (!owners.includes(phone)) throw missing;

    const result: TrackResult = {
      kind: 'order',
      code: input.code,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      totalPrice: order.totalPrice,
      itemCount: order._count.items,
      shipmentCode: order.shipmentCode ?? undefined,
      destination: [address.province, address.city].filter(Boolean).join('، ') || undefined,
    };
    return apiResponse.success(reply, result);
  });
};
