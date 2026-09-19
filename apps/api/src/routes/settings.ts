import { FastifyPluginAsync } from 'fastify';

import { getSettings } from '../lib/settings';
import { apiResponse } from '../lib/validation';

/**
 * The shop's opening days, bookable windows and contact details. Everything
 * here is already printed on the site, so it is public — the booking calendar
 * and the footer read it instead of the bundled constants.
 */
export const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (_request, reply) => {
    reply.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    return apiResponse.success(reply, await getSettings());
  });
};
