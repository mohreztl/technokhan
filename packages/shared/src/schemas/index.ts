// Zod schemas shared by the web forms and the API validation
import { z } from 'zod';
import { toEnglishDigits } from '../utils/digits';
import { normalizeTrackingCode } from '../utils/tracking';

export { faErrorMap } from './error-map';

const IRAN_MOBILE = /^09\d{9}$/;

/** Accepts Persian/Arabic digits, spaces and dashes; normalizes to 09XXXXXXXXX */
export const phoneSchema = z
  .string()
  .transform((v) => toEnglishDigits(v).replace(/[\s-]/g, ''))
  .refine((v) => IRAN_MOBILE.test(v), { message: 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد' });

export const postalCodeSchema = z
  .string()
  .transform((v) => toEnglishDigits(v).replace(/[\s-]/g, ''))
  .refine((v) => /^\d{10}$/.test(v), { message: 'کد پستی باید ۱۰ رقم باشد' });

export const otpCodeSchema = z
  .string()
  .transform((v) => toEnglishDigits(v).replace(/\s/g, ''))
  .refine((v) => /^\d{6}$/.test(v), { message: 'کد تأیید باید ۶ رقم باشد' });

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const sendOTPSchema = z.object({
  phoneNumber: phoneSchema,
});

export const verifyOTPSchema = z.object({
  phoneNumber: phoneSchema,
  code: otpCodeSchema,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'نام باید حداقل ۲ حرف باشد').max(60).optional(),
  email: z
    .string()
    .trim()
    .email('ایمیل نامعتبر است')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

// ---------------------------------------------------------------------------
// Addresses / orders
// ---------------------------------------------------------------------------

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(3, 'نام و نام خانوادگی را کامل وارد کنید').max(80),
  phoneNumber: phoneSchema,
  province: z.string().trim().min(2, 'استان را انتخاب کنید'),
  city: z.string().trim().min(2, 'شهر را وارد کنید'),
  address: z.string().trim().min(10, 'آدرس باید حداقل ۱۰ حرف باشد').max(300),
  postalCode: postalCodeSchema,
  isDefault: z.boolean().optional(),
});

export const paymentMethodSchema = z.enum(['zarinpal', 'cod']);

export const couponCodeSchema = z
  .string()
  .trim()
  .transform((v) => toEnglishDigits(v).toUpperCase())
  .refine((v) => /^[A-Z0-9_-]{3,20}$/.test(v), { message: 'کد تخفیف نامعتبر است' });

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'سبد خرید خالی است'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema.default('zarinpal'),
  couponCode: couponCodeSchema.optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  /** The courier's consignment number. The order's own code is never editable. */
  shipmentCode: z.string().trim().max(60).optional(),
});

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export const vehicleSizeSchema = z.enum(['small', 'medium', 'large']);

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'خدمت را انتخاب کنید'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ نامعتبر است'),
  timeSlot: z.string().min(1, 'بازه زمانی را انتخاب کنید'),
  location: z.string().min(1, 'محل انجام خدمت را انتخاب کنید'),
  carModel: z.string().trim().min(2, 'مدل خودرو را وارد کنید').max(60),
  carYear: z.number().int().min(1350).max(1420),
  carColor: z.string().trim().min(1, 'رنگ خودرو را انتخاب کنید'),
  carPlate: z.string().trim().max(20).optional(),
  vehicleSize: vehicleSizeSchema.optional(),
  addonIds: z.array(z.string()).default([]),
  notes: z.string().trim().max(500).optional(),
  totalPrice: z.number().min(0),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});

export const availableSlotsQuerySchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ---------------------------------------------------------------------------
// Contact / reviews
// ---------------------------------------------------------------------------

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'نام باید حداقل ۲ حرف باشد').max(80),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email('ایمیل نامعتبر است')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  subject: z.string().trim().min(2, 'موضوع را وارد کنید').max(120),
  message: z.string().trim().min(10, 'پیام باید حداقل ۱۰ حرف باشد').max(2000),
});

/**
 * Public tracking lookup. The phone number is required as a second factor: a
 * tracking code is short and guessable, and the record behind it is somebody's.
 */
export const trackSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'کد پیگیری را وارد کنید')
    .max(32)
    .transform((v) => normalizeTrackingCode(v))
    .refine((v) => v !== '', 'کد پیگیری معتبر نیست (مثل OR-9726DQ یا BK-3F9A2C)'),
  phoneNumber: phoneSchema,
});

// ---------------------------------------------------------------------------
// Admin: coupons and site settings
// ---------------------------------------------------------------------------

const HHMM_RANGE = /^([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** The coupon's bare fields, unrefined — admin forms extend this. */
export const couponFields = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'کد باید حداقل ۳ کاراکتر باشد')
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, 'فقط حروف انگلیسی، عدد، خط تیره و زیرخط مجاز است')
    .transform((v) => v.toUpperCase()),
  type: z.enum(['percent', 'fixed'], { error: () => ({ message: 'نوع تخفیف را انتخاب کنید' }) }),
  value: z.number({ error: 'مقدار تخفیف را وارد کنید' }).positive('مقدار تخفیف باید بیشتر از صفر باشد'),
  description: z.string().trim().min(3, 'توضیح کوتاهی بنویسید').max(160),
  minTotal: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  expiresAt: z.string().trim().min(1).optional(),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().positive().optional(),
});

/**
 * A percentage over 100 would hand money back. Written to tolerate missing
 * fields so the same rule can guard a partial update; when an edit changes only
 * one of the pair the route re-checks the merged coupon.
 */
const withinPercentCap = (c: { type?: 'percent' | 'fixed'; value?: number }) =>
  c.type !== 'percent' || c.value == null || c.value <= 100;

const PERCENT_CAP_ERROR = {
  message: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد',
  path: ['value'],
};

export const couponSchema = couponFields.refine(withinPercentCap, PERCENT_CAP_ERROR);

// zod 4 refuses `.partial()` on a refined object, so the update schema starts
// from the bare fields and re-applies the rule.
export const couponUpdateSchema = couponFields.partial().refine(withinPercentCap, PERCENT_CAP_ERROR);

export const siteSettingsSchema = z.object({
  closedWeekdays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  closedDates: z.array(z.string().regex(YMD, 'تاریخ باید به شکل YYYY-MM-DD باشد')).max(120).default([]),
  timeSlots: z
    .array(z.string().trim().regex(HHMM_RANGE, 'بازه باید به شکل «۰۸:۰۰ - ۱۰:۰۰» باشد'))
    .max(24)
    .default([]),
  phone: z.string().trim().max(40).default(''),
  mobile: z.string().trim().max(40).default(''),
  email: z.string().trim().max(120).default(''),
  address: z.string().trim().max(240).default(''),
  workingHours: z.string().trim().max(120).default(''),
  instagram: z.string().trim().max(200).default(''),
  telegram: z.string().trim().max(200).default(''),
  whatsapp: z.string().trim().max(200).default(''),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, 'نظر شما باید حداقل ۵ حرف باشد').max(1000),
});

// ---------------------------------------------------------------------------
// Admin catalog
// ---------------------------------------------------------------------------

const imagePath = z.string().min(1).refine((v) => /^(\/|https?:\/\/)/.test(v), {
  message: 'مسیر تصویر نامعتبر است',
});

export const adminProductSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(2),
  nameEn: z.string().trim().min(2),
  description: z.string().trim().min(10),
  descriptionEn: z.string().trim().min(10),
  shortDescription: z.string().trim().max(200).optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  category: z.string().min(1),
  images: z.array(imagePath).default([]),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  brand: z.string().trim().max(60).optional(),
  sku: z.string().trim().max(40).optional(),
  features: z.array(z.string()).default([]),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const adminServiceSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(2),
  nameEn: z.string().trim().min(2),
  description: z.string().trim().min(10),
  descriptionEn: z.string().trim().min(10),
  shortDescription: z.string().trim().max(200).optional(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  type: z.string().min(1),
  images: z.array(imagePath).default([]),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).default([]),
  pricing: z
    .object({ small: z.number().min(0), medium: z.number().min(0), large: z.number().min(0) })
    .optional(),
  addons: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().min(0),
        description: z.string().optional(),
      })
    )
    .default([]),
  warrantyMonths: z.number().int().min(0).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const idParamSchema = z.object({ id: z.string().min(1, 'شناسه نامعتبر است') });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderSchemaInput = z.infer<typeof createOrderSchema>;
export type CreateBookingSchemaInput = z.infer<typeof createBookingSchema>;
export type ContactSchemaInput = z.infer<typeof contactSchema>;
export type TrackInput = z.infer<typeof trackSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminServiceInput = z.infer<typeof adminServiceSchema>;
