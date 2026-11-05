import '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@technokhan/shared';

/** JWT payload — `role` is the user's real role (see docs/API.md) */
export interface JWTPayload {
  id: string;
  phoneNumber: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    /** preHandler: requires a valid bearer token (401 UNAUTHORIZED) */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** preHandler: requires a valid token with role `admin` (401 / 403 FORBIDDEN) */
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** @deprecated alias of requireAdmin */
    adminOnly: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}
