import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import type { JWTPayload } from '../types/fastify.d';
import { forbidden, unauthorized } from '../lib/errors';

/**
 * Authentication plugin: `authenticate` and `requireAdmin` preHandlers.
 * Errors are thrown as ApiError and formatted by the global error handler.
 */
async function authPlugin(fastify: FastifyInstance) {
  async function verify(request: FastifyRequest): Promise<JWTPayload> {
    try {
      return await request.jwtVerify<JWTPayload>();
    } catch (err: any) {
      const code: string | undefined = err?.code;
      if (code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
        throw unauthorized('نشست شما منقضی شده است. لطفاً دوباره وارد شوید');
      }
      throw unauthorized();
    }
  }

  fastify.decorate('authenticate', async function (request: FastifyRequest, _reply: FastifyReply) {
    const decoded = await verify(request);
    if (!decoded?.id) throw unauthorized();
    request.user = decoded;
  });

  fastify.decorate('requireAdmin', async function (request: FastifyRequest, _reply: FastifyReply) {
    const decoded = await verify(request);
    if (!decoded?.id) throw unauthorized();
    request.user = decoded;
    if (decoded.role !== 'admin') {
      throw forbidden('دسترسی محدود به مدیران سیستم است');
    }
  });

  // Backward-compatible alias
  fastify.decorate('adminOnly', fastify.requireAdmin);
}

export default fp(authPlugin, {
  name: 'auth-plugin',
  dependencies: ['@fastify/jwt'],
});
