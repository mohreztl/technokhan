// Shared constants
import type { SiteSettings } from '../types';

export const APP_NAME = 'تکنو خان';
export const APP_NAME_EN = 'TechnoKhan';
export const APP_DESCRIPTION = 'فروشگاه تخصصی گجت‌های هوشمند و لوازم جانبی دیجیتال';
export const APP_DESCRIPTION_EN = 'Curated Smart Gadgets and Digital Accessories';
export const APP_TAGLINE = 'گجت‌های اورجینال، انتخاب دقیق';

export const CONTACT = {
  phone: 'پشتیبانی آنلاین',
  phoneEn: '',
  mobile: 'پشتیبانی آنلاین',
  mobileEn: '',
  email: 'support@technokhan.com',
  address: 'تهران، ایران',
  addressEn: 'Tehran, Iran',
  /** used by the map embed */
  location: { lat: 35.7219, lng: 51.4105 },
  workingHours: 'پاسخ‌گویی آنلاین در روزهای کاری',
  workingDays: 'شنبه تا پنجشنبه',
  closedDays: 'جمعه‌ها تعطیل',
};

export const SOCIAL_MEDIA = {
  instagram: 'https://instagram.com/technokhan',
  telegram: 'https://t.me/technokhan',
  whatsapp: 'https://wa.me/technokhan',
};

/** Browser-facing API host (without the /api/v1 prefix). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_PREFIX = '/api/v1';

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  ABOUT: '/about',
  CONTACT: '/contact',
  TRACK: '/track',
  FAQ: '/faq',
  BLOG: '/blog',
  COMPARE: '/compare',
  LOGIN: '/login',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ADMIN: '/admin',
} as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phone: CONTACT.phoneEn,
  mobile: CONTACT.mobileEn,
  email: CONTACT.email,
  address: CONTACT.address,
  workingHours: CONTACT.workingHours,
  instagram: SOCIAL_MEDIA.instagram,
  telegram: SOCIAL_MEDIA.telegram,
  whatsapp: SOCIAL_MEDIA.whatsapp,
};

export const SHIPPING = {
  /** orders above this subtotal ship free (Toman) */
  freeThreshold: 3_000_000,
  /** flat shipping cost below the threshold (Toman) */
  cost: 120_000,
  /** shown in the checkout summary */
  estimate: '۲ تا ۴ روز کاری',
};

export const CURRENCY_LABEL = 'تومان';

export const PROVINCES = [
  'تهران',
  'البرز',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'آذربایجان غربی',
  'خوزستان',
  'قم',
  'کرمان',
  'گیلان',
  'مازندران',
  'یزد',
  'همدان',
  'کرمانشاه',
  'مرکزی',
  'هرمزگان',
  'گلستان',
  'قزوین',
  'زنجان',
  'لرستان',
  'سمنان',
  'اردبیل',
  'بوشهر',
  'کردستان',
  'چهارمحال و بختیاری',
  'خراسان شمالی',
  'خراسان جنوبی',
  'کهگیلویه و بویراحمد',
  'ایلام',
  'سیستان و بلوچستان',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'مسترد شده',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  zarinpal: 'پرداخت آنلاین (زرین‌پال)',
  cod: 'پرداخت در محل',
};

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  chargers: 'شارژرهای فوق سریع',
  headphones: 'هدفون و ایرباد',
  powerbanks: 'پاوربانک و مگ‌سیف',
  gaming: 'گیمینگ و دسکتاپ',
  wearables: 'گجت‌های پوشیدنی',
  cables: 'کابل، هاب و مبدل',
};

export const DEMO_OTP_CODE = '123456';
export const DEMO_ADMIN_PHONE = '09120000000';
