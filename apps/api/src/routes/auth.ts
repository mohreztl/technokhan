import { FastifyPluginAsync } from 'fastify';
import { createOTP, verifyOTP, canRequestOTP, sendOTP } from '../services/sms.service';
import { prisma } from '../lib/prisma';
import { sendOTPSchema, verifyOTPSchema, updateProfileSchema } from '../schemas';
import { validateRequest, apiResponse } from '../lib/validation';
import type { JWTPayload } from '../types/fastify.d';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Send OTP
  fastify.post('/send-otp', async (request, reply) => {
    const validation = validateRequest(sendOTPSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    const { phoneNumber } = validation.data;

    try {
      // Check cooldown
      const cooldownCheck = await canRequestOTP(phoneNumber);
      if (!cooldownCheck.canRequest) {
        return apiResponse.error(
          reply,
          `لطفاً ${cooldownCheck.waitSeconds} ثانیه صبر کنید`,
          429
        );
      }

      // Create OTP (hashed in database)
      const otpCode = await createOTP(phoneNumber);

      // Send SMS
      await sendOTP(phoneNumber, otpCode);

      return apiResponse.success(reply, {
        message: 'کد تایید به شماره شما ارسال شد',
        expiresIn: 120, // 2 minutes
      });
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در ارسال کد تایید', 500);
    }
  });

  // Verify OTP and login
  fastify.post('/verify-otp', async (request, reply) => {
    const validation = validateRequest(verifyOTPSchema, request.body);
    if (!validation.success) {
      return apiResponse.error(reply, validation.error, 400);
    }

    const { phoneNumber, code } = validation.data;

    try {
      // Verify OTP (handles hashing and attempts)
      const otpResult = await verifyOTP(phoneNumber, code);

      if (!otpResult.valid) {
        const errorMessage =
          otpResult.reason === 'expired'
            ? 'کد تایید منقضی شده است'
            : otpResult.reason === 'max_attempts'
            ? 'تعداد تلاش‌ها بیش از حد مجاز است'
            : 'کد تایید نامعتبر است';

        return apiResponse.error(reply, errorMessage, 400);
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            phoneNumber,
          },
        });
      }

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        role: 'customer', // Default role
      };

      const token = fastify.jwt.sign(payload);

      return apiResponse.success(reply, {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return apiResponse.error(reply, 'خطا در تایید کد', 500);
    }
  });

  // Get current user
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user.userId },
          include: {
            orders: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            bookings: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (!user) {
          return apiResponse.error(reply, 'کاربر یافت نشد', 404);
        }

        return apiResponse.success(reply, {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          recentOrders: user.orders,
          recentBookings: user.bookings,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در دریافت اطلاعات کاربر', 500);
      }
    }
  );

  // Update profile
  fastify.put(
    '/profile',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const validation = validateRequest(updateProfileSchema, request.body);
      if (!validation.success) {
        return apiResponse.error(reply, validation.error, 400);
      }

      try {
        const user = await prisma.user.update({
          where: { id: request.user.userId },
          data: validation.data,
        });

        return apiResponse.success(reply, {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          updatedAt: user.updatedAt,
        });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در به‌روزرسانی پروفایل', 500);
      }
    }
  );

  // Logout (invalidate token - client side)
  fastify.post(
    '/logout',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      // In a real app, you'd blacklist the token
      // For now, client should remove the token
      return apiResponse.success(reply, {
        message: 'با موفقیت خارج شدید',
      });
    }
  );

  // Refresh token
  fastify.post(
    '/refresh',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user.userId },
        });

        if (!user) {
          return apiResponse.error(reply, 'کاربر یافت نشد', 401);
        }

        const payload: JWTPayload = {
          userId: user.id,
          phoneNumber: user.phoneNumber,
          role: 'customer',
        };

        const token = fastify.jwt.sign(payload);

        return apiResponse.success(reply, { token });
      } catch (error) {
        fastify.log.error(error);
        return apiResponse.error(reply, 'خطا در تمدید توکن', 500);
      }
    }
  );
};
