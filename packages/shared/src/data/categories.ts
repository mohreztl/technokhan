import { ProductCategory, type Brand, type Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: ProductCategory.CHARGERS, name: 'شارژرهای فوق سریع', description: 'شارژر GaN، شارژر بی‌سیم و تجهیزات شارژ ایمن', image: '/images/categories/chargers.webp' },
  { id: ProductCategory.HEADPHONES, name: 'هدفون و ایرباد', description: 'صداپردازی دقیق و نویزکنسلینگ برای تمرکز', image: '/images/categories/headphones.webp' },
  { id: ProductCategory.POWERBANKS, name: 'پاوربانک و مگ‌سیف', description: 'انرژی همراه با شارژ سریع و بدنه قابل اعتماد', image: '/images/categories/powerbanks.webp' },
  { id: ProductCategory.GAMING, name: 'گیمینگ و دسکتاپ', description: 'کیبورد، ماوس و تجهیزات دقیق برای میز کار', image: '/images/categories/gaming.webp' },
  { id: ProductCategory.WEARABLES, name: 'گجت‌های پوشیدنی', description: 'ساعت هوشمند و ابزارهای سلامت روی مچ', image: '/images/categories/wearables.webp' },
  { id: ProductCategory.CABLES, name: 'کابل، هاب و مبدل', description: 'اتصال پایدار با کابل کنفی و هاب حرفه‌ای', image: '/images/categories/cables.webp' },
];

export const BRANDS: Brand[] = [
  { id: 'anker', name: 'Anker', nameFa: 'انکر', country: 'چین' },
  { id: 'baseus', name: 'Baseus', nameFa: 'بیسوس', country: 'چین' },
  { id: 'mcdodo', name: 'Mcdodo', nameFa: 'مک‌دودو', country: 'چین' },
  { id: 'jbl', name: 'JBL', nameFa: 'جی‌بی‌ال', country: 'آمریکا' },
  { id: 'samsung', name: 'Samsung', nameFa: 'سامسونگ', country: 'کره جنوبی' },
  { id: 'apple', name: 'Apple', nameFa: 'اپل', country: 'آمریکا' },
  { id: 'xiaomi', name: 'Xiaomi', nameFa: 'شیائومی', country: 'چین' },
];

export const findCategory = (id: string): Category | undefined => CATEGORIES.find((category) => category.id === id);
