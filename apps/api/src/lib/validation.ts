import { FastifyReply } from 'fastify';
import { ZodError, ZodTypeAny, z } from 'zod';
import type { Pagination } from '@autolounge/shared';

/**
 * Parse `data` with a Zod schema. Throws a ZodError which the global error
 * handler turns into a 400 VALIDATION_ERROR envelope with `details`.
 */
export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  return schema.parse(data ?? {});
}

/** @deprecated use parse() */
export const validateSchema = parse;

export function formatZodError(error: ZodError): { field: string; message: string }[] {
  // zod 4 dropped the `.errors` alias; `.issues` is the only accessor now.
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

type ValidationResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string; details?: { field: string; message: string }[] };

/** Non-throwing variant (used for optional query strings) */
export function validateRequest<S extends ZodTypeAny>(schema: S, data: unknown): ValidationResult<z.output<S>> {
  const result = schema.safeParse(data ?? {});
  if (result.success) return { success: true, data: result.data };
  const details = formatZodError(result.error);
  return { success: false, error: details[0]?.message || 'خطای اعتبارسنجی', details };
}

export function buildPagination(total: number, page: number, limit: number): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

/** Standard API response helpers */
export const apiResponse = {
  success: <T>(reply: FastifyReply, data: T, statusCode = 200) => {
    return reply.status(statusCode).send({ success: true, data });
  },

  error: (reply: FastifyReply, error: string, statusCode = 400, code = 'INTERNAL', details?: unknown) => {
    const response: Record<string, unknown> = { success: false, error, code };
    if (details !== undefined) response.details = details;
    return reply.status(statusCode).send(response);
  },

  paginated: <T>(reply: FastifyReply, data: T[], total: number, page: number, limit: number) => {
    return reply.status(200).send({
      success: true,
      data,
      pagination: buildPagination(total, page, limit),
    });
  },
};
