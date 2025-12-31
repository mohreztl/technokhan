import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { sendBookingConfirmation } from '../services/sms.service';
import { createBookingSchema, paginationSchema } from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';

export const bookingRoutes: FastifyPluginAsync = async (fastify) => {
  // Create booking
  fastify.post(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const validation = validateRequest(createBookingSchema, request.body);
      if (!validation.success) {
        return apiResponse.error(reply, validation.error, 400);
      }

      try {
        // Check if service exists
        const service = await prisma.service.findUnique({
          where: { id: validation.data.serviceId },
        });

        if (!service) {
          return apiResponse.error(reply, 'سرویس یافت نشد', 404);
        }

        // Check for conflicting bookings
        const existingBooking = await prisma.booking.findFirst({
          where: {
            serviceId: validation.data.serviceId,
            date: validation.data.date,
            timeSlot: validation.data.timeSlot,
            status: {
              in: ['pending', 'confirmed'],
            },
          },
        });

        if (existingBooking) {
          return apiResponse.error(reply, 'این زمان قبلاً رزرو شده است', 409);
        }

        const booking = await prisma.booking.create({
          data: {
            serviceId: validation.data.serviceId,
            userId: request.user.userId,
            date: validation.data.date,
            timeSlot: validation.data.timeSlot,
            location: validation.data.location,
            carModel: validation.data.carModel,
            carYear: validation.data.carYear,
            carColor: validation.data.carColor,
            carPlate: validation.data.carPlate,
            notes: validation.data.notes,
            totalPrice: validation.data.totalPrice,
            status: 'pending',
          },
          include: {
            service: true,
            user: {
              select: {
                id: true,
                phoneNumber: true,
                name: true,
              },
            },
          },
        });

        // Send confirmation SMS
        await sendBookingConfirmation(
          booking.user.phoneNumber,
          booking.service.name,
          booking.date.toISOString().split('T')[0],
          booking.timeSlot
        );

        return apiResponse.success(
          reply,
          {
            booking,
            message: 'رزرو با موفقیت ثبت شد',
          },
          201
        );
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در ثبت رزرو', 500);
      }
    }
  );

  // Get user bookings
  fastify.get(
    '/my-bookings',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const validation = validateRequest(paginationSchema, request.query);
      const { page = 1, limit = 10 } = validation.success
        ? validation.data
        : { page: 1, limit: 10 };

      try {
        const [bookings, total] = await Promise.all([
          prisma.booking.findMany({
            where: { userId: request.user.userId },
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true,
                  images: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.booking.count({
            where: { userId: request.user.userId },
          }),
        ]);

        return apiResponse.paginated(reply, bookings, total, page, limit);
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در دریافت رزروها', 500);
      }
    }
  );

  // Get single booking
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const booking = await prisma.booking.findUnique({
          where: { id },
          include: {
            service: true,
            user: {
              select: {
                id: true,
                phoneNumber: true,
                name: true,
              },
            },
          },
        });

        if (!booking) {
          return apiResponse.error(reply, 'رزرو یافت نشد', 404);
        }

        // Check ownership (unless admin)
        if (booking.userId !== request.user.userId && request.user.role !== 'admin') {
          return apiResponse.error(reply, 'شما دسترسی به این رزرو ندارید', 403);
        }

        return apiResponse.success(reply, booking);
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در دریافت رزرو', 500);
      }
    }
  );

  // Cancel booking
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const booking = await prisma.booking.findUnique({
          where: { id },
        });

        if (!booking) {
          return apiResponse.error(reply, 'رزرو یافت نشد', 404);
        }

        // Check ownership
        if (booking.userId !== request.user.userId && request.user.role !== 'admin') {
          return apiResponse.error(reply, 'شما دسترسی به این رزرو ندارید', 403);
        }

        // Check if can be cancelled
        if (booking.status === 'completed') {
          return apiResponse.error(reply, 'رزرو تکمیل شده قابل لغو نیست', 400);
        }

        if (booking.status === 'cancelled') {
          return apiResponse.error(reply, 'این رزرو قبلاً لغو شده است', 400);
        }

        await prisma.booking.update({
          where: { id },
          data: { status: 'cancelled' },
        });

        return apiResponse.success(reply, { message: 'رزرو با موفقیت لغو شد' });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در لغو رزرو', 500);
      }
    }
  );

  // Get available time slots for a service on a date
  fastify.get<{ Querystring: { serviceId: string; date: string } }>(
    '/available-slots',
    async (request, reply) => {
      const { serviceId, date } = request.query;

      if (!serviceId || !date) {
        return apiResponse.error(reply, 'شناسه سرویس و تاریخ الزامی است', 400);
      }

      try {
        // All possible time slots
        const allSlots = [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ];

        // Get booked slots for this date and service
        const bookedBookings = await prisma.booking.findMany({
          where: {
            serviceId,
            date: new Date(date),
            status: {
              in: ['pending', 'confirmed'],
            },
          },
          select: {
            timeSlot: true,
          },
        });

        const bookedSlots = bookedBookings.map((b) => b.timeSlot);
        const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

        return apiResponse.success(reply, {
          date,
          serviceId,
          availableSlots,
          bookedSlots,
        });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در دریافت زمان‌های خالی', 500);
      }
    }
  );
};
