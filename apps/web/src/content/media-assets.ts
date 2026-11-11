export type MediaKind = 'hero' | 'category' | 'product' | 'article';

export interface MediaAsset {
  src: `/images/${string}.webp`;
  alt: string;
  width: number;
  height: number;
  kind: MediaKind;
  generator: 'Google AI Studio / Nano Banana 2 Lite';
}

const generator = 'Google AI Studio / Nano Banana 2 Lite' as const;

export const HERO_MEDIA = [
  { src: '/images/hero/hero-headphones.webp', alt: 'هدفون بی‌سیم گرافیتی با نور لبه سبز و فضای خالی برای تیتر', width: 1600, height: 1000, kind: 'hero', generator },
  { src: '/images/hero/hero-gadgets.webp', alt: 'ترکیب شارژر شفاف، ساعت هوشمند و اسپیکر پرتابل با نورپردازی دراماتیک', width: 1600, height: 1000, kind: 'hero', generator },
] satisfies MediaAsset[];

export const CATEGORY_MEDIA = {
  chargers: { src: '/images/categories/chargers.webp', alt: 'شارژر فوق سریع GaN با بدنه مات و جزئیات فلزی', width: 1200, height: 900, kind: 'category', generator },
  headphones: { src: '/images/categories/headphones.webp', alt: 'هدفون نویزکنسلینگ و ایرباد با بدنه گرافیتی', width: 1200, height: 900, kind: 'category', generator },
  powerbanks: { src: '/images/categories/powerbanks.webp', alt: 'پاوربانک مگ‌سیف با ظرفیت بالا و طراحی فلزی', width: 1200, height: 900, kind: 'category', generator },
  gaming: { src: '/images/categories/gaming.webp', alt: 'کیبورد، ماوس و تجهیزات گیمینگ دسکتاپ با نور سبز', width: 1200, height: 900, kind: 'category', generator },
  wearables: { src: '/images/categories/wearables.webp', alt: 'ساعت هوشمند و گجت پوشیدنی با بدنه تیتانیومی', width: 1200, height: 900, kind: 'category', generator },
  cables: { src: '/images/categories/cables.webp', alt: 'کابل کنفی، هاب و مبدل حرفه‌ای روی سطح مات', width: 1200, height: 900, kind: 'category', generator },
} satisfies Record<string, MediaAsset>;

export const HERO_SHELF_MEDIA = {
  chargers: { src: '/images/hero-shelf/chargers.webp', alt: 'شارژر GaN شفاف روی پس‌زمینه استودیویی خنثی برای قفسه Hero', width: 1200, height: 1200, kind: 'hero', generator },
  headphones: { src: '/images/hero-shelf/headphones.webp', alt: 'هدفون نویزکنسلینگ گرافیتی با نور لبه سبز برای قفسه Hero', width: 1200, height: 1200, kind: 'hero', generator },
  powerbanks: { src: '/images/hero-shelf/powerbanks.webp', alt: 'پاوربانک مگ‌سیف آلومینیومی با نور لبه سبز برای قفسه Hero', width: 1200, height: 1200, kind: 'hero', generator },
  gaming: { src: '/images/hero-shelf/gaming.webp', alt: 'کیبورد و ماوس گیمینگ فلزی با نور لبه سبز برای قفسه Hero', width: 1200, height: 1200, kind: 'hero', generator },
  wearables: { src: '/images/hero-shelf/wearables.webp', alt: 'ساعت هوشمند تیتانیومی با نور لبه سبز برای قفسه Hero', width: 1200, height: 1200, kind: 'hero', generator },
  cables: { src: '/images/hero-shelf/cables.webp', alt: 'کابل کنفی و هاب آلومینیومی با نور لبه سبز برای قفسه Hero', width: 1200, height: 1200, kind: 'hero', generator },
} satisfies Record<string, MediaAsset>;

export const PRODUCT_MEDIA = {
  'anc-headphones': { src: '/images/products/anc-headphones.webp', alt: 'هدفون بی‌سیم نویزکنسلینگ گرافیتی در استودیو', width: 1200, height: 1200, kind: 'product', generator },
  earbuds: { src: '/images/products/earbuds.webp', alt: 'ایرباد بی‌سیم نویزکنسلینگ با کیس شارژ باز', width: 1200, height: 1200, kind: 'product', generator },
  smartwatch: { src: '/images/products/smartwatch.webp', alt: 'ساعت هوشمند اولترا با بدنه تیتانیومی و بند مشکی', width: 1200, height: 1200, kind: 'product', generator },
  speaker: { src: '/images/products/speaker.webp', alt: 'اسپیکر بلوتوثی قابل‌حمل با بدنه مشبک و پایه ضدآب', width: 1200, height: 1200, kind: 'product', generator },
  'gan-charger': { src: '/images/products/gan-charger.webp', alt: 'شارژر GaN سه پورت با طراحی صنعتی و پنل شفاف', width: 1200, height: 1200, kind: 'product', generator },
  powerbank: { src: '/images/products/powerbank.webp', alt: 'پاوربانک مگ‌سیف باریک با بدنه آلومینیومی', width: 1200, height: 1200, kind: 'product', generator },
  'usb-hub': { src: '/images/products/usb-hub.webp', alt: 'هاب USB-C آلومینیومی با پورت‌های متنوع', width: 1200, height: 1200, kind: 'product', generator },
  'braided-cable': { src: '/images/products/braided-cable.webp', alt: 'کابل USB-C کنفی با کانکتور فلزی و بافت مشکی', width: 1200, height: 1200, kind: 'product', generator },
  keyboard: { src: '/images/products/keyboard.webp', alt: 'کیبورد مکانیکال کم‌ارتفاع با قاب آلومینیومی', width: 1200, height: 1200, kind: 'product', generator },
  mouse: { src: '/images/products/mouse.webp', alt: 'ماوس بی‌سیم حرفه‌ای با بدنه مات و اسکرول فلزی', width: 1200, height: 1200, kind: 'product', generator },
  'phone-stand': { src: '/images/products/phone-stand.webp', alt: 'پایه نگه‌دارنده موبایل آلومینیومی با لولای تنظیم', width: 1200, height: 1200, kind: 'product', generator },
  'wireless-charger': { src: '/images/products/wireless-charger.webp', alt: 'شارژر بی‌سیم تاشو سه‌کاره برای گوشی، ساعت و ایرباد', width: 1200, height: 1200, kind: 'product', generator },
} satisfies Record<string, MediaAsset>;

export const ARTICLE_MEDIA = {
  'gan-guide': { src: '/images/blog/gan-guide.webp', alt: 'نمای داخلی شارژر GaN برای راهنمای فناوری شارژ سریع', width: 1200, height: 800, kind: 'article', generator },
  'noise-cancelling': { src: '/images/blog/noise-cancelling.webp', alt: 'هدفون نویزکنسلینگ با موج‌های صوتی مینیمال و نور سبز', width: 1200, height: 800, kind: 'article', generator },
  'minimal-desk': { src: '/images/blog/minimal-desk.webp', alt: 'میز کار مینیمال با کیبورد، ماوس و تجهیزات دیجیتال هماهنگ', width: 1200, height: 800, kind: 'article', generator },
  'powerbank-guide': { src: '/images/blog/powerbank-guide.webp', alt: 'پاوربانک و تجهیزات سفر برای راهنمای انتخاب ظرفیت', width: 1200, height: 800, kind: 'article', generator },
} satisfies Record<string, MediaAsset>;

export const ALL_MEDIA: MediaAsset[] = [
  ...HERO_MEDIA,
  ...Object.values(CATEGORY_MEDIA),
  ...Object.values(HERO_SHELF_MEDIA),
  ...Object.values(PRODUCT_MEDIA),
  ...Object.values(ARTICLE_MEDIA),
];
