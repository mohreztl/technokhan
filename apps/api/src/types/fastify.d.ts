import '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  role: 'admin' | 'customer';
  iat?: number;
  exp?: number;
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user: JWTPayload;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    adminOnly: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Extend @fastify/jwt
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}
