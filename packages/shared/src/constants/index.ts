// Shared constants

export const APP_NAME = 'اتولانژ';
export const APP_NAME_EN = 'AutoLounge';
export const APP_DESCRIPTION = 'مرکز تخصصی مراقبت و زیبایی خودرو';
export const APP_DESCRIPTION_EN = 'Premium Automotive Care & Detailing Center';

export const CONTACT = {
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  phoneEn: '021-12345678',
  email: 'info@autolounge.ir',
  address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
  addressEn: 'Tehran, Vali-e-Asr St., No. 123',
};

export const SOCIAL_MEDIA = {
  instagram: 'https://instagram.com/autolounge.ir',
  telegram: 'https://t.me/autolounge',
  whatsapp: 'https://wa.me/989123456789',
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  SERVICES: '/services',
  BOOKING: '/booking',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
} as const;

export const BOOKING_TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
];

export const PROVINCES = [
  'تهران',
  'اصفهان',
  'شیراز',
  'مشهد',
  'تبریز',
  'کرج',
  'اهواز',
  'قم',
  'کرمان',
  'ارومیه',
] as const;
