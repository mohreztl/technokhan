import { PRODUCTS, effectivePrice, formatToman, normalizeSearchText } from '@technokhan/shared';

export interface SupportReply {
  text: string;
  href?: string;
  linkLabel?: string;
}

const CATEGORY_KEYWORDS: { keywords: string[]; category: string }[] = [
  { keywords: ['شارژر', 'شارژ'], category: 'chargers' },
  { keywords: ['هدفون', 'ایرباد', 'اسپیکر', 'موسیقی'], category: 'headphones' },
  { keywords: ['پاوربانک', 'مگ سیف', 'مگ‌سیف'], category: 'powerbanks' },
  { keywords: ['کیبورد', 'ماوس', 'گیم', 'دسکتاپ'], category: 'gaming' },
  { keywords: ['ساعت', 'پوشیدنی'], category: 'wearables' },
  { keywords: ['کابل', 'هاب', 'مبدل'], category: 'cables' },
];

export function getSupportReply(input: string): SupportReply {
  const message = normalizeSearchText(input);
  if (/سلام|درود/.test(message)) return { text: 'سلام! نام دستگاه یا نوع گجت را بنویسید تا چند انتخاب مناسب پیشنهاد کنم. برای پیگیری سفارش هم می‌توانید از همین‌جا وارد شوید.' };
  if (/اصالت|اورجینال|اصل بودن|گارانتی/.test(message)) return { text: 'همه محصولات با ضمانت اصالت، فاکتور رسمی و گارانتی قابل بررسی عرضه می‌شوند. قبل از خرید می‌توانید شرایط گارانتی هر مدل را در صفحه محصول ببینید.', href: '/about', linkLabel: 'درباره استانداردهای تکنو خان' };
  if (/ارسال|پست|تحویل|بسته بندی|بسته‌بندی/.test(message)) return { text: 'سفارش‌ها با بسته‌بندی امن و امکان رهگیری ارسال می‌شوند. زمان دقیق تحویل به شهر و روش ارسال بستگی دارد؛ برای برآورد دقیق، تیم پشتیبانی مسیر ارسال را بررسی می‌کند.', href: '/contact', linkLabel: 'پرسش درباره ارسال' };
  if (/بازگشت|مرجوع|عودت/.test(message)) return { text: 'تا ۷ روز فرصت بررسی و درخواست بازگشت دارید. وضعیت کالا و بسته‌بندی باید مطابق شرایط بازگشت باشد؛ جزئیات و مسیر ثبت درخواست در صفحه تماس در دسترس است.', href: '/contact?subject=بازگشت کالا', linkLabel: 'ثبت درخواست بازگشت' };
  if (/سفارش|رهگیری|پیگیری/.test(message)) return { text: 'برای دیدن وضعیت آماده‌سازی، ارسال و تحویل، کد رهگیری یا شماره موبایل را در صفحه پیگیری وارد کنید.', href: '/track', linkLabel: 'پیگیری سفارش' };
  if (/مشاوره|اپراتور|انسان|تماس با/.test(message)) return { text: 'برای بررسی سازگاری، گارانتی یا شرایط سفارش، درخواست خود را برای کارشناسان تکنو خان ارسال کنید.', href: '/contact', linkLabel: 'گفت‌وگو با کارشناس' };

  const matched = CATEGORY_KEYWORDS.find((item) => item.keywords.some((keyword) => message.includes(normalizeSearchText(keyword))));
  if (matched) {
    const suggestions = PRODUCTS.filter((product) => product.category === matched.category && product.stock > 0 && product.isActive !== false)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 2);
    if (suggestions.length) {
      const list = suggestions.map((product) => `«${product.name}» با قیمت ${formatToman(effectivePrice(product))}`).join(' و ');
      return { text: `برای شروع، ${list} را پیشنهاد می‌کنم. در صفحه دسته می‌توانید برند، بودجه، امتیاز و ویژگی فنی را هم فیلتر کنید.`, href: `/category/${matched.category}`, linkLabel: 'مشاهده و مقایسه پیشنهادها' };
    }
  }

  return { text: 'برای راهنمایی دقیق‌تر، نوع گجت یا نام دستگاه را بنویسید؛ مثلاً «شارژر لپ‌تاپ» یا «هدفون با نویزکنسلینگ». درباره ارسال، اصالت، بازگشت و پیگیری سفارش هم می‌توانید بپرسید.', href: '/shop', linkLabel: 'جستجو در همه محصولات' };
}
