/**
 * Store taxonomy: the curated category tree and brand dictionary that the
 * storefront exposes, mapped onto the raw Sepidar/WordPress category names
 * stored on products. Raw names are matched after Persian normalization, so
 * Arabic ي/ك spellings and ZWNJ variants collapse onto the same page.
 */

export interface StoreCategory {
  /** Latin, URL- and SEO-friendly identifier. */
  slug: string;
  /** Persian display name. */
  name: string;
  /** Raw `Product.category` values (any spelling) that belong to this page. */
  match: string[];
  /** Legacy bundled-catalog category ids that also resolve here. */
  aliases?: string[];
  description: string;
  keywords: string[];
  /** Optional artwork reused from the bundled category media. */
  image?: string;
}

export interface StoreBrand {
  id: string;
  name: string;
  nameFa: string;
  aliases: string[];
  country: string;
}

/** Normalize a raw category/brand string for matching (not for display). */
export function normalizeTaxonomyText(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    slug: 'cables-chargers',
    name: 'کابل و شارژر',
    match: ['کابل و شارژر', 'شارژر دیواری', 'شارژر دیواری برند شرکتی', 'شارژر', 'chargers'],
    aliases: ['chargers'],
    description: 'شارژر دیواری، شارژر فست و کابل‌های اورجینال با توان واقعی و ایمنی کامل برای همه‌ی گوشی‌ها.',
    keywords: ['خرید شارژر', 'کابل شارژر', 'شارژر فست', 'شارژر سامسونگ'],
    image: '/images/categories/chargers.webp',
  },
  {
    slug: 'phone-cables',
    name: 'کابل گوشی',
    match: ['کابل گوشی', 'کابل آیفون', 'کابل تایپ سی', 'کابل میکرو', 'کابل c.c', 'کابل c.i', 'کابل چندکاره', 'cables'],
    aliases: ['cables'],
    description: 'کابل تایپ‌سی، لایتنینگ و میکرو با روکش مقاوم و پشتیبانی از شارژ سریع و انتقال داده.',
    keywords: ['کابل تایپ سی', 'کابل آیفون', 'کابل شارژ گوشی'],
    image: '/images/categories/cables.webp',
  },
  {
    slug: 'headphones',
    name: 'هدفون و هندزفری',
    match: [
      'هدفون و هندزفری',
      'هدفون و هندزفری بلوتوث',
      'هندزفری',
      'هدست و هدفون',
      'هدفون بی سیم',
      'هندزفری بلوتوثی',
      'هندزفری سیم‌دار سوکت سوزنی',
      'هندزفری سیم دار تایپ سی',
      'هندزفری سیم‌دار تایپ سی',
      'headphones',
    ],
    aliases: ['headphones'],
    description: 'هدفون و هندزفری سیمی و بلوتوثی با صدای شفاف، میکروفون اختصاصی و نویزکنسلینگ.',
    keywords: ['خرید هندزفری', 'هدفون بلوتوثی', 'هندزفری سیم دار'],
    image: '/images/categories/headphones.webp',
  },
  {
    slug: 'airpods',
    name: 'ایرپاد',
    match: ['ایرپاد'],
    description: 'ایرپاد و هندزفری‌های TWS با کیس شارژ، اتصال پایدار و میکروفون شفاف برای تماس و موزیک.',
    keywords: ['خرید ایرپاد', 'هندزفری TWS', 'ایرپاد پرو'],
  },
  {
    slug: 'holders',
    name: 'هولدر و پایه نگهدارنده',
    match: ['هولدر', 'پایه نگهدارنده', 'پایه گوشی'],
    description: 'هولدر خودرویی، پایه رومیزی و نگهدارنده مغناطیسی برای استفاده راحت و ایمن از گوشی.',
    keywords: ['هولدر موبایل', 'پایه نگهدارنده گوشی', 'هولدر خودرو'],
  },
  {
    slug: 'speakers',
    name: 'اسپیکر',
    match: ['اسپیکر', 'اسپیکر پرتابل'],
    description: 'اسپیکر پرتابل و رومیزی با صدای پرحجم، باتری بادوام و اتصال بلوتوث پایدار.',
    keywords: ['خرید اسپیکر', 'اسپیکر بلوتوثی', 'اسپیکر پرتابل'],
  },
  {
    slug: 'phone-cases',
    name: 'قاب و کاور گوشی',
    match: ['قاب گوشی', 'قاب آیفون', 'قاب موبایل آیفون', 'قاب موبایل', 'کاور گوشی'],
    description: 'قاب و کاور مقاوم برای آیفون و اندروید؛ از شفاف و مینیمال تا ضدضربه و مگ‌سیف.',
    keywords: ['قاب آیفون', 'کاور موبایل', 'قاب گوشی'],
  },
  {
    slug: 'screen-protector',
    name: 'گلس و محافظ صفحه',
    match: ['گلس سامسونگ', 'گلس آیفون', 'گلس شیائومی', 'گلس', 'محافظ صفحه'],
    description: 'گلس تمام‌چسب و محافظ صفحه نشکن برای سامسونگ، آیفون و شیائومی با نصب آسان.',
    keywords: ['گلس سامسونگ', 'گلس آیفون', 'محافظ صفحه نمایش'],
  },
  {
    slug: 'smartwatch',
    name: 'ساعت هوشمند',
    match: ['ساعت هوشمند', 'اسمارت واچ', 'wearables'],
    aliases: ['wearables'],
    description: 'ساعت هوشمند و مچ‌بند سلامت با صفحه لمسی، پایش ضربان قلب و باتری چندروزه.',
    keywords: ['خرید ساعت هوشمند', 'اسمارت واچ', 'مچ بند هوشمند'],
    image: '/images/categories/wearables.webp',
  },
  {
    slug: 'powerbank',
    name: 'پاوربانک',
    match: ['پاوربانک', 'پاوربانک ۱۰ هزار میلی آمپر', 'پاوربانک ۲۰ هزار میلی آمپر', 'powerbanks'],
    aliases: ['powerbanks'],
    description: 'پاوربانک ۱۰ تا ۲۰ هزار میلی‌آمپری با شارژ سریع PD و بدنه مقاوم برای سفر و روزمره.',
    keywords: ['خرید پاوربانک', 'پاوربانک سریع', 'پاوربانک ۲۰ هزار'],
    image: '/images/categories/powerbanks.webp',
  },
  {
    slug: 'car-chargers',
    name: 'شارژر فندکی',
    match: ['شارژر فندکی', 'فندکی شارژر'],
    description: 'شارژر فندکی دوپورت و فست با ولتاژ پایدار برای شارژ امن گوشی در خودرو.',
    keywords: ['شارژر فندکی', 'شارژر خودرو', 'شارژر فست ماشین'],
  },
  {
    slug: 'multi-chargers',
    name: 'شارژر چندراهی',
    match: ['شارژر چندراهی', 'چند راهی برق', 'چندراهی برق'],
    description: 'شارژر رومیزی چندپورت و محافظ برق برای شارژ هم‌زمان چند دستگاه روی میز یا پایه دیواری.',
    keywords: ['شارژر چندراهی', 'شارژر رومیزی', 'چندراهی برق'],
  },
  {
    slug: 'adapters-hubs',
    name: 'مبدل، هاب و دانگل',
    match: ['مبدل', 'مبدل و رابط', 'هاب', 'دانگل'],
    description: 'مبدل تایپ‌سی، هاب USB و دانگل برای اتصال مانیتور، فلش و لوازم جانبی به لپ‌تاپ و گوشی.',
    keywords: ['مبدل تایپ سی', 'هاب USB', 'دانگل'],
  },
  {
    slug: 'computer-accessories',
    name: 'لوازم جانبی کامپیوتر',
    match: ['محصولات کامپیوتری', 'موس بی سیم', 'موس', 'کیبورد'],
    description: 'ماوس، کیبورد و لوازم جانبی کامپیوتر برای میز کار منظم و کار روزمره بدون وقفه.',
    keywords: ['موس بی سیم', 'لوازم جانبی کامپیوتر', 'کیبورد'],
    image: '/images/categories/gaming.webp',
  },
  {
    slug: 'aux-cables',
    name: 'کابل AUX',
    match: ['کابل aux', 'کابل ایوایکس', 'ایوایکس', 'aux'],
    description: 'کابل AUX باکیفیت برای اتصال گوشی به ضبط خودرو و اسپیکر با صدای بدون نویز.',
    keywords: ['کابل aux', 'کابل ایوایکس', 'کابل صدا'],
  },
  {
    slug: 'hdmi-cables',
    name: 'کابل HDMI',
    match: ['کابل HDMI', 'HDMI'],
    description: 'کابل HDMI نسخه 2.0 و 2.1 برای انتقال تصویر 4K بدون افت کیفیت به مانیتور و تلویزیون.',
    keywords: ['کابل HDMI', 'کابل اچ دی ام آی', 'کابل مانیتور'],
  },
  {
    slug: 'gadgets',
    name: 'گجت و سایر لوازم',
    match: ['گجت', 'سایر گجت ها', 'سایر گجت‌ها', 'باتری سکه ای', 'باتری سکه‌ای'],
    description: 'گجت‌های کاربردی، باتری سکه‌ای و لوازم جانبی متفرقه برای نیازهای روزمره دیجیتال.',
    keywords: ['گجت', 'لوازم جانبی دیجیتال', 'باتری سکه ای'],
  },
  {
    slug: 'gaming',
    name: 'گیمینگ و دسکتاپ',
    match: ['gaming', 'گیمینگ'],
    aliases: ['gaming'],
    description: 'تجهیزات گیمینگ و دسکتاپ؛ از هدست و ماوس گیمری تا اکسسوری میز بازی.',
    keywords: ['گیمینگ', 'لوازم گیمری'],
    image: '/images/categories/gaming.webp',
  },
];

export const STORE_BRANDS: StoreBrand[] = [
  { id: 'samsung', name: 'Samsung', nameFa: 'سامسونگ', aliases: ['samsung', 'سامسونگ'], country: 'کره جنوبی' },
  { id: 'apple', name: 'Apple', nameFa: 'اپل', aliases: ['apple', 'اپل'], country: 'آمریکا' },
  { id: 'xiaomi', name: 'Xiaomi', nameFa: 'شیائومی', aliases: ['xiaomi', 'شیائومی'], country: 'چین' },
  { id: 'ldnio', name: 'LDNIO', nameFa: 'الدی‌انو', aliases: ['ldnio', 'ldinio', 'الدی انو', 'الدینو'], country: 'چین' },
  { id: 'earldom', name: 'Earldom', nameFa: 'ارلدام', aliases: ['earldom', 'ارلدام'], country: 'چین' },
  { id: 'hiska', name: 'Hiska', nameFa: 'هیسکا', aliases: ['hiska', 'هیسکا'], country: 'چین' },
  { id: 'ultrasur', name: 'UltraSur', nameFa: 'التراسر', aliases: ['ultrasur', 'ultra sur', 'التراسر'], country: 'چین' },
  { id: 'proone', name: 'ProOne', nameFa: 'پرووان', aliases: ['proone', 'pro one', 'پرووان', 'پرو وان'], country: 'چین' },
  { id: 'mcdodo', name: 'Mcdodo', nameFa: 'مک‌دودو', aliases: ['mcdodo', 'mc dodo', 'مک دودو', 'مک‌دودو'], country: 'چین' },
  { id: 'usams', name: 'USAMS', nameFa: 'یوسمز', aliases: ['usams', 'یوسمز'], country: 'چین' },
  { id: 'xo', name: 'XO', nameFa: 'ایکس‌او', aliases: ['xo'], country: 'چین' },
  { id: 'celebrat', name: 'Celebrat', nameFa: 'سلبرات', aliases: ['celebrat', 'celebrate', 'سلبرات'], country: 'چین' },
  { id: 'welot', name: 'Welot', nameFa: 'ولوت', aliases: ['welot', 'ولوت'], country: 'چین' },
  { id: 'remax', name: 'Remax', nameFa: 'ریمکس', aliases: ['remax', 'ریمکس'], country: 'چین' },
  { id: 'tsco', name: 'TSCO', nameFa: 'تسکو', aliases: ['tsco', 'تسکو'], country: 'ایران' },
];

// ---------------------------------------------------------------------------
// lookups
// ---------------------------------------------------------------------------

const categoryBySlug = new Map<string, StoreCategory>();
const categoryByMatch = new Map<string, StoreCategory>();
for (const category of STORE_CATEGORIES) {
  categoryBySlug.set(category.slug, category);
  for (const alias of category.aliases ?? []) categoryBySlug.set(alias, category);
  for (const raw of category.match) categoryByMatch.set(normalizeTaxonomyText(raw), category);
}

/** Resolve a URL slug (canonical, alias, or percent-decoded raw name) to its category. */
export function findStoreCategory(slug: string): StoreCategory | undefined {
  const decoded = decodeURIComponent(slug);
  return categoryBySlug.get(decoded) ?? categoryByMatch.get(normalizeTaxonomyText(decoded));
}

/** The category that owns a raw `Product.category` value, if any. */
export function categoryForRawName(raw: string): StoreCategory | undefined {
  return categoryByMatch.get(normalizeTaxonomyText(raw));
}

/** Raw category names a category page must query (its own match list). */
export function categoryQueryValues(category: StoreCategory): string[] {
  return category.match;
}

const brandById = new Map(STORE_BRANDS.map((brand) => [brand.id, brand]));

export function findStoreBrand(id: string): StoreBrand | undefined {
  return brandById.get(decodeURIComponent(id).toLowerCase());
}

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;
const BRAND_MATCHERS: Array<{ id: string; regex: RegExp }> = STORE_BRANDS.flatMap((brand) =>
  brand.aliases.map((alias) => {
    const escaped = alias.replace(ESCAPE_REGEX, '\\$&');
    // latin aliases need word boundaries ("xo" must not match "xoxo"); Persian aliases match anywhere
    const regex = /^[\x20-\x7e]+$/.test(alias)
      ? new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i')
      : new RegExp(escaped, 'i');
    return { id: brand.id, regex };
  })
).sort((a, b) => b.regex.source.length - a.regex.source.length);

/** Best-effort brand detection from a product's display names. Returns the brand id. */
export function detectBrandId(...texts: Array<string | null | undefined>): string | null {
  const haystack = normalizeTaxonomyText(texts.filter(Boolean).join(' \n '));
  if (!haystack) return null;
  for (const { id, regex } of BRAND_MATCHERS) {
    if (regex.test(haystack)) return id;
  }
  return null;
}
