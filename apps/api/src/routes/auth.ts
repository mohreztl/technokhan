import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { config as appConfig } from '../config';
import { canRequestOTP, createOTP, sendOTP, verifyOTP } from '../services/sms.service';
import { sendOTPSchema, verifyOTPSchema, updateProfileSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { ApiError, badRequest, forbidden, notFound, rateLimited } from '../lib/errors';
import { serializeUser } from '../lib/serialize';
import type { JWTPayload } from '../types/fastify.d';

const OTP_EXPIRES_IN = 120;

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /auth/send-otp
  fastify.post('/send-otp', { config: { rateLimit: appConfig.rateLimit.otp } }, async (request, reply) => {
    const { phoneNumber } = parse(sendOTPSchema, request.body);

    const cooldown = await canRequestOTP(phoneNumber);
    if (!cooldown.canRequest) {
      throw rateLimited(`لطفاً ${cooldown.waitSeconds} ثانیه صبر کنید و دوباره تلاش کنید`);
    }

    const code = await createOTP(phoneNumber);
    try {
      await sendOTP(phoneNumber, code);
    } catch (error) {
      request.log.error({ err: error }, 'OTP delivery failed');
      throw new ApiError(502, 'INTERNAL', 'ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید');
    }

    const data: { message: string; expiresIn: number; demoCode?: string } = {
      message: 'کد تایید به شماره شما ارسال شد',
      expiresIn: OTP_EXPIRES_IN,
    };
    if (appConfig.otpDevBypassCode) data.demoCode = appConfig.otpDevBypassCode;

    return apiResponse.success(reply, data);
  });

  // POST /auth/verify-otp
  fastify.post('/verify-otp', async (request, reply) => {
    const { phoneNumber, code } = parse(verifyOTPSchema, request.body);

    const result = await verifyOTP(phoneNumber, code);
    if (!result.valid) {
      const message =
        result.reason === 'expired'
          ? 'کد تایید منقضی شده است. کد جدید درخواست کنید'
          : result.reason === 'max_attempts'
          ? 'تعداد تلاش‌ها بیش از حد مجاز است. کد جدید درخواست کنید'
          : 'کد تایید نامعتبر است';
      throw badRequest(message);
    }

    let user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber,
          role: phoneNumber === appConfig.adminPhone ? 'admin' : 'customer',
        },
      });
    }

    if (!user.isActive) {
      throw forbidden('حساب کاربری شما غیرفعال شده است');
    }

    const payload: JWTPayload = { id: user.id, phoneNumber: user.phoneNumber, role: user.role };
    const token = fastify.jwt.sign(payload);

    return apiResponse.success(reply, { token, user: serializeUser(user) });
  });

  // GET /auth/me
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    if (!user) throw notFound('کاربر یافت نشد');
    return apiResponse.success(reply, serializeUser(user));
  });

  // PUT /auth/profile
  fastify.put('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const input = parse(updateProfileSchema, request.body);
    const user = await prisma.user.update({
      where: { id: request.user.id },
      data: { name: input.name, email: input.email },
    });
    return apiResponse.success(reply, serializeUser(user));
  });

  // POST /auth/logout (stateless JWT — the client discards the token)
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (_request, reply) => {
    return apiResponse.success(reply, { message: 'با موفقیت خارج شدید' });
  });

  // POST /auth/refresh
  fastify.post('/refresh', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    if (!user || !user.isActive) throw new ApiError(401, 'UNAUTHORIZED', 'کاربر یافت نشد');

    const payload: JWTPayload = { id: user.id, phoneNumber: user.phoneNumber, role: user.role };
    const token = fastify.jwt.sign(payload);
    return apiResponse.success(reply, { token });
  });
};
