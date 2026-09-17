import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { idParamSchema, shippingAddressSchema } from '../schemas';
import { parse, apiResponse } from '../lib/validation';
import { badRequest, notFound } from '../lib/errors';

const MAX_ADDRESSES = 5;

export const addressRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  async function ownedAddress(id: string, userId: string) {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw notFound('آدرس یافت نشد');
    return address;
  }

  // GET /addresses
  fastify.get('/', async (request, reply) => {
    const addresses = await prisma.address.findMany({
      where: { userId: request.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return apiResponse.success(reply, addresses);
  });

  // POST /addresses
  fastify.post('/', async (request, reply) => {
    const input = parse(shippingAddressSchema, request.body);
    const userId = request.user.id;

    const count = await prisma.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) {
      throw badRequest(`حداکثر ${MAX_ADDRESSES} آدرس می‌توانید ثبت کنید`);
    }

    const makeDefault = input.isDefault === true || count === 0;
    const address = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
      }
      return tx.address.create({
        data: {
          userId,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          province: input.province,
          city: input.city,
          address: input.address,
          postalCode: input.postalCode,
          isDefault: makeDefault,
        },
      });
    });

    return apiResponse.success(reply, address, 201);
  });

  // PUT /addresses/:id
  fastify.put('/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(shippingAddressSchema, request.body);
    const userId = request.user.id;
    await ownedAddress(id, userId);

    const address = await prisma.$transaction(async (tx) => {
      if (input.isDefault === true) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id },
        data: {
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          province: input.province,
          city: input.city,
          address: input.address,
          postalCode: input.postalCode,
          ...(input.isDefault === true ? { isDefault: true } : {}),
        },
      });
    });

    return apiResponse.success(reply, address);
  });

  // PUT /addresses/:id/default
  fastify.put('/:id/default', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const userId = request.user.id;
    await ownedAddress(id, userId);

    const address = await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data: { isDefault: true } });
    });

    return apiResponse.success(reply, address);
  });

  // DELETE /addresses/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id } = parse(idParamSchema, request.params);
    const userId = request.user.id;
    const existing = await ownedAddress(id, userId);

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });
      if (existing.isDefault) {
        const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
        if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    });

    return apiResponse.success(reply, existing);
  });
};
