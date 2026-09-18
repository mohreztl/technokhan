import { FastifyPluginAsync } from 'fastify';
import { Prisma, BookingStatus } from '@prisma/client';
import {
  computeQuote,
  trackingCodeFromId,
  type ServiceAddon,
  type ServicePricing,
} from '@autolounge/shared';
import { prisma } from '../lib/prisma';
import { sendBookingConfirmation } from '../services/sms.service';
import {
  availableSlotsQuerySchema,
  createBookingSchema,
  idParamSchema,
  listStatusQuerySchema,
} from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors';
import { bookingInclude } from '../lib/catalog';
import { dayRange, isSlotPast, utcMidnight, validateBookingDate } from '../lib/booking-time';
import { getSettings } from '../lib/settings';

const BOOKING_STATUSES = Object.values(BookingStatus) as string[];
const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed'];

/** Assign `BK-XXXXXX`; retries with a salt on the (very unlikely) unique collision */
async function assignTrackingCode(id: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const salt = attempt === 0 ? '' : Math.random().toString(36).slice(2, 8);
    try {
      return await prisma.booking.update({
        where: { id },
        data: { trackingCode: trackingCodeFromId('BK', id + salt) },
        include: bookingInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue;
      throw error;
    }
  }
  return prisma.booking.findUniqueOrThrow({ where: { id }, include: bookingInclude });
}

export const bookingRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /bookings/available-slots (public)
  fastify.get('/available-slots', async (request, reply) => {
    const { serviceId, date } = parse(availableSlotsQuerySchema, request.query);

    const service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
      select: { id: true },
    });
    if (!service) throw notFound('خدمت یافت نشد');

    const settings = await getSettings();
    const dateCheck = validateBookingDate(date, settings);
    const booked = dateCheck.ok
      ? await prisma.booking.findMany({
          where: { serviceId, date: dayRange(date), status: { not: 'cancelled' } },
          select: { timeSlot: true },
        })
      : [];
    const bookedSlots = Array.from(new Set(booked.map((b) => b.timeSlot)));

    const availableSlots = dateCheck.ok
      ? settings.timeSlots.filter((slot) => !bookedSlots.includes(slot) && !isSlotPast(date, slot))
      : [];

    return apiResponse.success(reply, { date, serviceId, availableSlots, bookedSlots });
  });

  // POST /bookings
  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const input = parse(createBookingSchema, request.body);

    const service = await prisma.service.findFirst({ where: { id: input.serviceId, isActive: true } });
    if (!service) throw notFound('خدمت یافت نشد');

    const settings = await getSettings();
    const dateCheck = validateBookingDate(input.date, settings);
    if (!dateCheck.ok) throw badRequest(dateCheck.message);
    if (!settings.timeSlots.includes(input.timeSlot)) throw badRequest('بازه زمانی نامعتبر است');
    if (isSlotPast(input.date, input.timeSlot)) throw badRequest('این بازه زمانی گذشته است');

    const addons = (service.addons as unknown as ServiceAddon[] | null) ?? [];
    const unknownAddon = input.addonIds.find((id) => !addons.some((a) => a.id === id));
    if (unknownAddon) throw badRequest('خدمت جانبی انتخاب‌شده نامعتبر است');

    const quote = computeQuote(
      {
        price: service.price,
        duration: service.duration,
        pricing: (service.pricing as unknown as ServicePricing | null) ?? undefined,
        addons,
      },
      input.vehicleSize ?? 'medium',
      input.addonIds
    );
    const tolerance = Math.max(1, quote.total * 0.01);
    if (Math.abs(input.totalPrice - quote.total) > tolerance) {
      throw badRequest('مبلغ ارسال‌شده با قیمت محاسبه‌شده مطابقت ندارد', {
        expected: quote.total,
        received: input.totalPrice,
      });
    }

    const taken = await prisma.booking.findFirst({
      where: {
        serviceId: input.serviceId,
        date: dayRange(input.date),
        timeSlot: input.timeSlot,
        status: { in: ACTIVE_STATUSES },
      },
      select: { id: true },
    });
    if (taken) throw conflict('این بازه زمانی قبلاً رزرو شده است');

    const created = await prisma.booking.create({
      data: {
        userId: request.user.id,
        serviceId: input.serviceId,
        date: utcMidnight(input.date),
        timeSlot: input.timeSlot,
        location: input.location,
        carModel: input.carModel,
        carYear: input.carYear,
        carColor: input.carColor,
        carPlate: input.carPlate,
        vehicleSize: input.vehicleSize,
        addonIds: input.addonIds,
        notes: input.notes,
        totalPrice: quote.total,
        status: 'pending',
      },
      select: { id: true },
    });
    const booking = await assignTrackingCode(created.id);

    void sendBookingConfirmation(
      request.user.phoneNumber,
      booking.service.name,
      input.date,
      booking.timeSlot,
      booking.trackingCode
    );

    return apiResponse.success(reply, booking, 201);
  });

  // GET /bookings/my-bookings
  fastify.get('/my-bookings', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const q = parse(listStatusQuerySchema, request.query);
    if (q.status && !BOOKING_STATUSES.includes(q.status)) throw badRequest('وضعیت نامعتبر است');

    const where: Prisma.BookingWhereInput = { userId: request.user.id };
    if (q.status) where.status = q.status as BookingStatus;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return apiResponse.paginated(reply, bookings, total, q.page, q.limit);
  });

  // GET /bookings/:id
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { ...bookingInclude, transactions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!booking) throw notFound('رزرو یافت نشد');
    if (booking.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این رزرو دسترسی ندارید');
    }
    return apiResponse.success(reply, booking);
  });

  // DELETE /bookings/:id — cancel (pending / confirmed only)
  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw notFound('رزرو یافت نشد');
    if (booking.userId !== request.user.id && request.user.role !== 'admin') {
      throw forbidden('شما به این رزرو دسترسی ندارید');
    }
    if (booking.status === 'cancelled') throw conflict('این رزرو قبلاً لغو شده است');
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      throw conflict('فقط رزروهای در انتظار یا تأیید شده قابل لغو هستند');
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: bookingInclude,
    });
    return apiResponse.success(reply, updated);
  });
};
