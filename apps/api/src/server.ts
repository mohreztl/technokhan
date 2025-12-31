import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

// Plugins
import authPlugin from './plugins/auth';

// Routes
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { serviceRoutes } from './routes/services';
import { bookingRoutes } from './routes/bookings';
import { orderRoutes } from './routes/orders';
import { adminRoutes } from './routes/admin';
import { paymentRoutes } from './routes/payment';

// Types
import './types/fastify.d';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is required in production');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'production' 
    ? { level: 'info' }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
    sign: {
      expiresIn: '7d',
    },
  });

  // Multipart/form-data for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });

  // Authentication plugin (must be after JWT)
  await fastify.register(authPlugin);
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API v1 routes
  await fastify.register(
    async (instance) => {
      await instance.register(authRoutes, { prefix: '/auth' });
      await instance.register(productRoutes, { prefix: '/products' });
      await instance.register(serviceRoutes, { prefix: '/services' });
      await instance.register(bookingRoutes, { prefix: '/bookings' });
      await instance.register(orderRoutes, { prefix: '/orders' });
      await instance.register(adminRoutes, { prefix: '/admin' });
      await instance.register(paymentRoutes, { prefix: '/payment' });
    },
    { prefix: '/api/v1' }
  );

  // Legacy routes (backward compatibility)
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(productRoutes, { prefix: '/api/products' });
  await fastify.register(serviceRoutes, { prefix: '/api/services' });
  await fastify.register(bookingRoutes, { prefix: '/api/bookings' });
  await fastify.register(orderRoutes, { prefix: '/api/orders' });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await fastify.listen({ port: PORT, host: HOST });
    
    fastify.log.info(`🚀 Server is running on http://${HOST}:${PORT}`);
    fastify.log.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server...`);
    await fastify.close();
    process.exit(0);
  });
});

start();
