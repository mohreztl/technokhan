// config must be imported first: it loads .env before other modules read process.env
import { config } from './config';

import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { prisma } from './lib/prisma';
import { bindLogger } from './lib/logger';
import { ApiError, rateLimited } from './lib/errors';
import { formatZodError } from './lib/validation';
import authPlugin from './plugins/auth';

import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { serviceRoutes } from './routes/services';
import { bookingRoutes } from './routes/bookings';
import { orderRoutes } from './routes/orders';
import { adminRoutes } from './routes/admin';
import { paymentRoutes } from './routes/payment';
import { contactRoutes } from './routes/contact';
import { addressRoutes } from './routes/addresses';
import { trackRoutes } from './routes/track';


if (!config.jwtSecret) {
  if (config.isProduction) {
    // eslint-disable-next-line no-console
    console.error('JWT_SECRET is required in production');
    process.exit(1);
  }
}

const fastify = Fastify({
  trustProxy: ['1', 'true', 'yes'].includes((process.env.TRUST_PROXY || '').toLowerCase()),
  logger: config.isProduction
    ? { level: process.env.LOG_LEVEL || 'info' }
    : {
        level: process.env.LOG_LEVEL || 'debug',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        },
      },
});

bindLogger(fastify.log);

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  error: string,
  details?: unknown
) {
  const body: Record<string, unknown> = { success: false, error, code };
  if (details !== undefined) body.details = details;
  return reply.status(statusCode).send(body);
}

fastify.setNotFoundHandler((request, reply) => {
  return sendError(reply, 404, 'NOT_FOUND', `مسیر ${request.method} ${request.url} یافت نشد`);
});

fastify.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof ZodError) {
    const details = formatZodError(error);
    return sendError(reply, 400, 'VALIDATION_ERROR', details[0]?.message || 'اطلاعات ارسال‌شده معتبر نیست', details);
  }

  if (error instanceof ApiError) {
    if (error.statusCode >= 500) request.log.error({ err: error }, error.message);
    return sendError(reply, error.statusCode, error.code, error.message, error.details);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return sendError(reply, 404, 'NOT_FOUND', 'موردی یافت نشد');
    if (error.code === 'P2002') return sendError(reply, 409, 'CONFLICT', 'این مورد قبلاً ثبت شده است');
    if (error.code === 'P2003') return sendError(reply, 400, 'VALIDATION_ERROR', 'ارجاع نامعتبر است');
    request.log.error({ err: error }, 'Prisma error');
    return sendError(reply, 500, 'INTERNAL', 'خطای پایگاه داده');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    request.log.error({ err: error }, 'Prisma validation error');
    return sendError(reply, 400, 'VALIDATION_ERROR', 'اطلاعات ارسال‌شده معتبر نیست');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    request.log.error({ err: error }, 'Database unavailable');
    return sendError(reply, 503, 'INTERNAL', 'ارتباط با پایگاه داده برقرار نشد');
  }

  // Fastify's JSON body parser throws a SyntaxError with statusCode 400
  if (error instanceof SyntaxError) {
    return sendError(reply, 400, 'VALIDATION_ERROR', 'بدنه درخواست JSON معتبر نیست');
  }

  const fastifyError = error as FastifyError;
  const status = fastifyError.statusCode ?? 500;
  const fcode = fastifyError.code || '';

  if (status === 429) return sendError(reply, 429, 'RATE_LIMITED', rateLimited().message);
  if (status === 401 || fcode.startsWith('FST_JWT')) {
    return sendError(reply, 401, 'UNAUTHORIZED', 'احراز هویت نامعتبر است. لطفاً دوباره وارد شوید');
  }
  if (status === 403) return sendError(reply, 403, 'FORBIDDEN', 'شما به این بخش دسترسی ندارید');
  if (status === 404) return sendError(reply, 404, 'NOT_FOUND', 'موردی یافت نشد');
  if (status === 413) return sendError(reply, 413, 'VALIDATION_ERROR', 'حجم درخواست بیش از حد مجاز است');
  if (status === 415 || fcode.startsWith('FST_ERR_CTP') || fastifyError.validation) {
    return sendError(reply, 400, 'VALIDATION_ERROR', 'درخواست نامعتبر است', fastifyError.validation);
  }
  if (status >= 400 && status < 500) {
    return sendError(reply, status, 'VALIDATION_ERROR', fastifyError.message || 'درخواست نامعتبر است');
  }

  request.log.error({ err: error }, 'Unhandled error');
  return sendError(reply, 500, 'INTERNAL', 'خطای داخلی سرور');
});

// ---------------------------------------------------------------------------
// Plugins
// ---------------------------------------------------------------------------

async function registerPlugins() {
  await fastify.register(cors, {
    origin: config.allowedOrigins.includes('*') ? true : config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await fastify.register(jwt, {
    secret: config.jwtSecret || 'autolounge-dev-secret-change-me',
    sign: { expiresIn: config.jwtExpiresIn },
  });

  await fastify.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  await fastify.register(rateLimit, {
    max: config.rateLimit.global.max,
    timeWindow: config.rateLimit.global.timeWindow,
    errorResponseBuilder: () => rateLimited(),
  });

  await fastify.register(authPlugin);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

async function checkDatabase(timeoutMs = 3000): Promise<boolean> {
  const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs));
  const ping = prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  return Promise.race([ping, timeout]);
}

async function registerRoutes() {
  fastify.get('/health', { config: { rateLimit: false } }, async (_request, reply) => {
    const db = await checkDatabase();
    return reply.status(db ? 200 : 503).send({
      status: db ? 'ok' : 'degraded',
      db,
      env: config.env,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  await fastify.register(
    async (instance) => {
      await instance.register(authRoutes, { prefix: '/auth' });
      await instance.register(productRoutes, { prefix: '/products' });
      await instance.register(serviceRoutes, { prefix: '/services' });
      await instance.register(bookingRoutes, { prefix: '/bookings' });
      await instance.register(orderRoutes, { prefix: '/orders' });
      await instance.register(paymentRoutes, { prefix: '/payment' });
      await instance.register(addressRoutes, { prefix: '/addresses' });
      await instance.register(contactRoutes, { prefix: '/contact' });
      await instance.register(trackRoutes, { prefix: '/track' });
      await instance.register(adminRoutes, { prefix: '/admin' });
    },
    { prefix: '/api/v1' }
  );
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function start() {
  try {
    await registerPlugins();
    await registerRoutes();
    await fastify.listen({ port: config.port, host: config.host });

    fastify.log.info(`AutoLounge API listening on http://${config.host}:${config.port}/api/v1`);
    fastify.log.info(
      {
        env: config.env,
        demoGateway: !config.zarinpal.merchantId && !config.isProduction,
        otpBypass: Boolean(config.otpDevBypassCode),
        sms: Boolean(config.melipayamak.username),
      },
      'runtime flags'
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down`);
    await fastify.close();
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  });
}

start();
