import { FastifyPluginAsync } from 'fastify';

import { getSettings } from '../lib/settings';
import { apiResponse } from '../lib/validation';

/**
 * Public contact details, social links and working hours shown on the site.
 */
export const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (_request, reply) => {
    reply.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    return apiResponse.success(reply, await getSettings());
  });
};
