import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { JWTPayload } from '../types/fastify.d';

/**
 * Authentication middleware plugin
 * Registers authenticate and adminOnly decorators
 */
async function authPlugin(fastify: FastifyInstance) {
  // Authenticate decorator - verifies JWT token
  fastify.decorate('authenticate', async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const decoded = await request.jwtVerify<JWTPayload>();
      request.user = decoded;
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: 'احراز هویت نامعتبر. لطفاً دوباره وارد شوید.',
        code: 'UNAUTHORIZED',
      });
    }
  });

  // Admin only decorator - checks if user is admin
  fastify.decorate('adminOnly', async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const decoded = await request.jwtVerify<JWTPayload>();
      request.user = decoded;

      if (decoded.role !== 'admin') {
        reply.status(403).send({
          success: false,
          error: 'دسترسی محدود به مدیران سیستم',
          code: 'FORBIDDEN',
        });
      }
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: 'احراز هویت نامعتبر. لطفاً دوباره وارد شوید.',
        code: 'UNAUTHORIZED',
      });
    }
  });
}

export default fp(authPlugin, {
  name: 'auth-plugin',
  dependencies: ['@fastify/jwt'],
});
