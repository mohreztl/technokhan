// Shared constants
import type { SiteSettings, VehicleSize } from '../types';

export const APP_NAME = 'اتولانژ';
export const APP_NAME_EN = 'AutoLounge';
export const APP_DESCRIPTION = 'مرکز تخصصی مراقبت و زیبایی خودرو';
export const APP_DESCRIPTION_EN = 'Premium Automotive Care & Detailing Center';
export const APP_TAGLINE = 'جایی که خودروی شما دوباره می‌درخشد';

export const CONTACT = {
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  phoneEn: '021-12345678',
  mobile: '۰۹۱۲-۳۴۵-۶۷۸۹',
  mobileEn: '09123456789',
  email: 'info@autolounge.ir',
  address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
  addressEn: 'Tehran, Vali-e-Asr St., No. 123',
  /** used by the map embed */
  location: { lat: 35.7219, lng: 51.4105 },
  workingHours: 'شنبه تا پنجشنبه ۸:۰۰ تا ۲۰:۰۰',
  workingDays: 'شنبه تا پنجشنبه',
  closedDays: 'جمعه‌ها تعطیل',
};

export const SOCIAL_MEDIA = {
  instagram: 'https://instagram.com/autolounge.ir',
  telegram: 'https://t.me/autolounge',
  whatsapp: 'https://wa.me/989123456789',
};

/** Browser-facing API host (without the /api/v1 prefix). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_PREFIX = '/api/v1';

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  SERVICES: '/services',
  BOOKING: '/booking',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  GALLERY: '/gallery',
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

export const BOOKING_TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
];

/** Workshop is closed on Fridays (day 5 in JS getDay()) */
export const CLOSED_WEEKDAYS: number[] = [5];

/** How many days ahead a booking can be made */
export const BOOKING_MAX_DAYS_AHEAD = 45;

/**
 * What the shop looks like before anyone has saved settings: a fresh database,
 * or a demo build with no API at all. The seed writes exactly these values into
 * the SiteSettings row, so a real deployment and a demo start out identical.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  closedWeekdays: [...CLOSED_WEEKDAYS],
  closedDates: [],
  timeSlots: [...BOOKING_TIME_SLOTS],
  phone: CONTACT.phoneEn,
  mobile: CONTACT.mobileEn,
  email: CONTACT.email,
  address: CONTACT.address,
  workingHours: CONTACT.workingHours,
  instagram: SOCIAL_MEDIA.instagram,
  telegram: SOCIAL_MEDIA.telegram,
  whatsapp: SOCIAL_MEDIA.whatsapp,
};

export const VEHICLE_SIZES: { id: VehicleSize; label: string; description: string }[] = [
  { id: 'small', label: 'سواری', description: 'پراید، ۲۰۶، تیبا، سایپا' },
  { id: 'medium', label: 'سدان / کراس‌اوور', description: 'دنا، سمند، ال۹۰، هیوندای، کیا' },
  { id: 'large', label: 'شاسی‌بلند / ون', description: 'سانتافه، تویوتا لندکروزر، ون' },
];

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

export const CAR_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'white', name: 'سفید', hex: '#F5F5F5' },
  { id: 'black', name: 'مشکی', hex: '#111111' },
  { id: 'silver', name: 'نقره‌ای', hex: '#C0C0C0' },
  { id: 'gray', name: 'خاکستری', hex: '#6B7280' },
  { id: 'blue', name: 'آبی', hex: '#1E40AF' },
  { id: 'red', name: 'قرمز', hex: '#B91C1C' },
  { id: 'beige', name: 'بژ', hex: '#D6C6A5' },
  { id: 'green', name: 'سبز', hex: '#166534' },
  { id: 'other', name: 'سایر', hex: '#9CA3AF' },
];

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  in_progress: 'در حال انجام',
  completed: 'انجام شده',
  cancelled: 'لغو شده',
};

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
  detailing: 'دیتیلینگ',
  car_wrap: 'کاور و رپ',
  accessories: 'لوازم جانبی',
  tools: 'ابزار',
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  paint_restoration: 'احیای رنگ',
  detailing: 'دیتیلینگ',
  car_wrap: 'رپ خودرو',
  ceramic_coating: 'سرامیک بدنه',
  ppf: 'محافظ رنگ (PPF)',
  interior_cleaning: 'صفرشویی داخل',
  engine_cleaning: 'شست‌وشوی موتور',
  headlight_restoration: 'احیای چراغ',
  custom: 'سفارشی',
};

export const DEMO_OTP_CODE = '123456';
export const DEMO_ADMIN_PHONE = '09120000000';
