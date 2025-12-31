import { z } from 'zod';

// ========================================
// Auth Schemas
// ========================================

export const sendOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, 'شماره تلفن باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
});

export const verifyOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, 'شماره تلفن نامعتبر است'),
  code: z
    .string()
    .length(6, 'کد تایید باید ۶ رقم باشد')
    .regex(/^\d{6}$/, 'کد تایید باید فقط شامل اعداد باشد'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').optional(),
  email: z.string().email('ایمیل نامعتبر است').optional(),
});

// ========================================
// Product Schemas
// ========================================

export const createProductSchema = z.object({
  name: z.string().min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد'),
  nameEn: z.string().min(2, 'نام انگلیسی محصول باید حداقل ۲ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  descriptionEn: z.string().min(10, 'توضیحات انگلیسی باید حداقل ۱۰ کاراکتر باشد'),
  price: z.number().positive('قیمت باید بزرگتر از صفر باشد'),
  discountPrice: z.number().positive().optional().nullable(),
  category: z.string().min(1, 'دسته‌بندی الزامی است'),
  images: z.array(z.string().url()).default([]),
  stock: z.number().int().min(0, 'موجودی نمی‌تواند منفی باشد').default(0),
  featured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().cuid('شناسه محصول نامعتبر است'),
});

// ========================================
// Service Schemas
// ========================================

export const createServiceSchema = z.object({
  name: z.string().min(2, 'نام خدمت باید حداقل ۲ کاراکتر باشد'),
  nameEn: z.string().min(2, 'نام انگلیسی خدمت باید حداقل ۲ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  descriptionEn: z.string().min(10, 'توضیحات انگلیسی باید حداقل ۱۰ کاراکتر باشد'),
  price: z.number().positive('قیمت باید بزرگتر از صفر باشد'),
  duration: z.number().int().positive('مدت زمان باید بزرگتر از صفر باشد'),
  type: z.string().min(1, 'نوع خدمت الزامی است'),
  images: z.array(z.string().url()).default([]),
  featured: z.boolean().default(false),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceIdParamSchema = z.object({
  id: z.string().cuid('شناسه خدمت نامعتبر است'),
});

// ========================================
// Booking Schemas
// ========================================

export const createBookingSchema = z.object({
  serviceId: z.string().cuid('شناسه خدمت نامعتبر است'),
  date: z.coerce.date({ errorMap: () => ({ message: 'تاریخ نامعتبر است' }) }),
  timeSlot: z.string().min(1, 'ساعت رزرو الزامی است'),
  location: z.string().min(2, 'محل خدمت الزامی است'),
  carModel: z.string().min(2, 'مدل خودرو الزامی است'),
  carYear: z.number().int().min(1350).max(1410, 'سال خودرو نامعتبر است'),
  carColor: z.string().min(2, 'رنگ خودرو الزامی است'),
  carPlate: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.number().positive('مبلغ کل باید بزرگتر از صفر باشد'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'وضعیت نامعتبر است' }),
  }),
});

export const bookingIdParamSchema = z.object({
  id: z.string().cuid('شناسه رزرو نامعتبر است'),
});

// ========================================
// Order Schemas
// ========================================

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'نام کامل الزامی است'),
  phoneNumber: z.string().regex(/^09\d{9}$/, 'شماره تلفن نامعتبر است'),
  province: z.string().min(2, 'استان الزامی است'),
  city: z.string().min(2, 'شهر الزامی است'),
  address: z.string().min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
  postalCode: z.string().regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
});

export const orderItemSchema = z.object({
  productId: z.string().cuid('شناسه محصول نامعتبر است'),
  quantity: z.number().int().positive('تعداد باید بزرگتر از صفر باشد'),
  price: z.number().positive('قیمت باید بزرگتر از صفر باشد'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'سبد خرید نمی‌تواند خالی باشد'),
  totalPrice: z.number().positive('مبلغ کل باید بزرگتر از صفر باشد'),
  shippingAddress: shippingAddressSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'وضعیت نامعتبر است' }),
  }),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().cuid('شناسه سفارش نامعتبر است'),
});

// ========================================
// Pagination & Query Schemas
// ========================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'name', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
});

export const serviceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

// ========================================
// Payment Schemas
// ========================================

export const paymentRequestSchema = z.object({
  orderId: z.string().cuid('شناسه سفارش نامعتبر است'),
  callbackUrl: z.string().url('آدرس بازگشت نامعتبر است').optional(),
});

export const paymentVerifySchema = z.object({
  authority: z.string().min(1, 'شناسه تراکنش الزامی است'),
  status: z.string(),
});

// ========================================
// Type Exports
// ========================================

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type PaymentRequestInput = z.infer<typeof paymentRequestSchema>;
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>;
