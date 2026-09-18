/**
 * API validation schemas.
 * Request bodies are validated with the schemas shared with the web forms
 * (`@autolounge/shared`); only API-specific query/param schemas live here.
 */
import { z } from 'zod';
import { faErrorMap, toEnglishDigits } from '@autolounge/shared';

// The error envelope hands `details[0].message` to the client as the message a
// user sees, so zod's English defaults would surface untranslated. Schemas
// carry Persian text for the issues they define; this covers the rest, most
// visibly "expected string, received undefined" on a missing field.
z.config({ customError: faErrorMap });

export {
  phoneSchema,
  postalCodeSchema,
  otpCodeSchema,
  sendOTPSchema,
  verifyOTPSchema,
  updateProfileSchema,
  shippingAddressSchema,
  paymentMethodSchema,
  couponCodeSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  vehicleSizeSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  availableSlotsQuerySchema,
  contactSchema,
  reviewSchema,
  adminProductSchema,
  adminServiceSchema,
  idParamSchema,
  paginationQuerySchema,
} from '@autolounge/shared';

export type {
  SendOTPInput,
  VerifyOTPInput,
  UpdateProfileInput,
  ShippingAddressInput,
  CreateOrderSchemaInput,
  CreateBookingSchemaInput,
  ContactSchemaInput,
  AdminProductInput,
  AdminServiceInput,
} from '@autolounge/shared';

import { adminProductSchema, adminServiceSchema } from '@autolounge/shared';

// ---------------------------------------------------------------------------
// Query-string helpers
// ---------------------------------------------------------------------------

/** "true"/"false"/"1"/"0" → boolean, anything else → undefined */
export const queryBool = z.preprocess((v) => {
  if (v === true || v === 'true' || v === '1') return true;
  if (v === false || v === 'false' || v === '0') return false;
  return undefined;
}, z.boolean().optional());

const queryNumber = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(toEnglishDigits(String(v)));
  return Number.isFinite(n) ? n : undefined;
}, z.number().optional());

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');
export const catalogSortBySchema = z.enum(['createdAt', 'price', 'rating', 'name']).default('createdAt');

export const pageQuery = (defaultLimit = 12, maxLimit = 100) =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
  });

export const productQuerySchema = pageQuery(12).extend({
  category: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  featured: queryBool,
  search: z.string().trim().min(1).max(100).optional(),
  minPrice: queryNumber,
  maxPrice: queryNumber,
  inStock: queryBool,
  sortBy: catalogSortBySchema,
  sortOrder: sortOrderSchema,
});

export const serviceQuerySchema = pageQuery(12).extend({
  type: z.string().trim().min(1).optional(),
  featured: queryBool,
  search: z.string().trim().min(1).max(100).optional(),
  minPrice: queryNumber,
  maxPrice: queryNumber,
  sortBy: catalogSortBySchema,
  sortOrder: sortOrderSchema,
});

export const limitQuerySchema = (defaultLimit: number) =>
  z.object({ limit: z.coerce.number().int().min(1).max(50).default(defaultLimit) });

export const listStatusQuerySchema = pageQuery(20).extend({
  status: z.string().trim().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Orders / payment
// ---------------------------------------------------------------------------

export const validateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'کد تخفیف را وارد کنید')
    .max(30)
    .transform((v) => toEnglishDigits(v).toUpperCase()),
  subtotal: z.number().min(0),
});

/** Absolute URL, or a site-relative path the API resolves against WEB_URL. */
const callbackUrlSchema = z
  .string()
  .refine(
    (v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'),
    'آدرس بازگشت نامعتبر است'
  )
  .optional();

export const paymentRequestSchema = z.object({
  orderId: z.string().min(1, 'شناسه سفارش الزامی است'),
  callbackUrl: callbackUrlSchema,
});

export const bookingPaymentRequestSchema = z.object({
  bookingId: z.string().min(1, 'شناسه رزرو الزامی است'),
  callbackUrl: callbackUrlSchema,
});

export const paymentVerifySchema = z.object({
  authority: z.string().min(1, 'شناسه تراکنش الزامی است'),
  status: z.enum(['OK', 'NOK']).default('OK'),
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const adminProductUpdateSchema = adminProductSchema.partial();
export const adminServiceUpdateSchema = adminServiceSchema.partial();

export const adminProductQuerySchema = pageQuery(20).extend({
  search: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().min(1).optional(),
  isActive: queryBool,
});

export const adminServiceQuerySchema = pageQuery(20).extend({
  search: z.string().trim().min(1).max(100).optional(),
  type: z.string().trim().min(1).optional(),
  isActive: queryBool,
});

export const adminOrderQuerySchema = pageQuery(20).extend({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const adminBookingQuerySchema = pageQuery(20).extend({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ نامعتبر است').optional(),
});

export const adminUserQuerySchema = pageQuery(20).extend({
  search: z.string().trim().min(1).max(100).optional(),
});

export const adminMessageQuerySchema = pageQuery(20).extend({
  unread: queryBool,
});

export const adminReviewQuerySchema = pageQuery(20).extend({
  approved: queryBool,
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type PaymentRequestInput = z.infer<typeof paymentRequestSchema>;
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>;
