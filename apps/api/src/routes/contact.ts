import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { config as appConfig } from '../config';
import { contactSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';

export const contactRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /contact — 5 requests per 15 minutes per IP
  fastify.post('/', { config: { rateLimit: appConfig.rateLimit.contact } }, async (request, reply) => {
    const input = parse(contactSchema, request.body);

    const created = await prisma.contactMessage.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
      select: { id: true },
    });

    return apiResponse.success(
      reply,
      { id: created.id, message: 'پیام شما ثبت شد. کارشناسان ما به‌زودی با شما تماس می‌گیرند' },
      201
    );
  });
};
