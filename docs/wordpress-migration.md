# راهنمای مهاجرت از وردپرس به فروشگاه جدید

> این سند برای دو پروژه نوشته شده: **تکنوخان (TechnoKhan)** — همین ریپو — و **آریا تکنو (Arya Techno)**.
> تمام فازها پیاده‌سازی شده‌اند؛ دستورها با همان env اجرا می‌شوند و فقط کافی است فایل env متعلق به هر پروژه را بدهید.
> مرجع فنی ساختار: `ARCHITECTURE.md` — Next.js 16 (web) + Fastify 5 (api) + Prisma/PostgreSQL.
> ابزارهای مهاجرت در `apps/api/tools/` و پایپ‌لاین تصویر در `tools/image-pipeline/` هستند.

---

## ۰) تصمیم‌های کلیدی (پیاده‌سازی‌شده)

| موضوع | تصمیم | کجا |
|---|---|---|
| سایت قدیمی | وردپرس + ووکامرس (دسترسی ادمین موجود است) | — |
| حسابداری | **سپیدار (همکاران سیستم)** — منبع اصلی کالا/قیمت/موجودی؛ سینک خودکار | `apps/api/src/services/accounting/sepidar.ts` + `src/jobs/accounting-sync.ts` |
| پنل پیامکی | **ملی‌پیامک** (کاوه‌نگار هم با `SMS_PROVIDER=kavenegar` فعال است) | `apps/api/src/services/sms.service.ts` |
| درگاه پرداخت | زرین‌پال | `apps/api/src/services/zarinpal.service.ts` |
| ورود کاربران | OTP **و** نام‌کاربری/رمز؛ رمز وردپرس با همان هش phpass کار می‌کند و در اولین ورود به bcrypt ارتقا می‌یابد | `apps/api/src/lib/phpass.ts` + `routes/auth.ts` |
| محصولات | اسلاگ ووکامرس **بدون تغییر** در `Product.slug` — مسیر `/product/<slug>` همان آدرس قدیمی می‌ماند | `apps/api/tools/import-products.ts` |
| مقالات | مدل `Article` در دیتابیس + اسلاگ حفظ‌شده | `apps/api/tools/import-articles.ts` |
| ترب | فید `/torob.xml` آماده‌ی ثبت در پنل ترب | `apps/web/src/app/torob.xml/route.ts` |
| باسلام | کلاینت API فروشنده + env توکن | `apps/api/src/services/basalam.service.ts` |
| مجوزهای فوتر | اینماد / ساماندهی / اصناف — HTML صادرشده از پنل ادمین تنظیم می‌شود | `apps/web/src/components/organisms/footer.tsx` + تنظیمات ادمین |
| تصاویر | ۱ عکس خام → ۳ تصویر قالبی با AI (اصلی/لایف‌استایل/بنر) → WebP | `tools/image-pipeline/generate.mjs` |

**قانون طلایی SEO:** اسلاگ‌ها دست نمی‌خورند → محصولات اصلاً ریدایرکت نمی‌خواهند.

---

## ۱) نگاشت مسیرها

| مسیر وردپرس (قدیمی) | مسیر سایت جدید | ریدایرکت |
|---|---|---|
| `/product/<slug>/` | `/product/<slug>` | نه — اسلاگ حفظ شده |
| `/product-category/<slug>/` | `/category/<slug>` | ۳۰۱ الگویی |
| `/<postname>/` (مقاله) | `/blog/<slug>` | ۳۰۱ تکی (خودکار ساخته می‌شود) |
| `/category/<slug>/` (دسته مقاله) | `/blog?category=<slug>` | ۳۰۱ الگویی |
| `/tag/<slug>/` | `/blog` | ۳۰۱ الگویی |
| صفحات (`/about`, …) | `/<slug>` | ۳۰۱ تکی |

---

## ۲) پیش‌نیازها و env پروژه‌ها

از پنل وردپرس (لاگین هستید):

1. **Application Password**: `wp-admin → کاربران → شناسه شما → Application Passwords`
2. **کلید REST ووکامرس**: `wp-admin → ووکامرس → تنظیمات → پیشرفته → REST API`
3. **اطلاعات اتصال** سپیدار، ترب، باسلام و ملی‌پیامک — طبق گفته‌ی شما همه در تنظیمات پلاگین‌های پنل وردپرس هستند؛ همان مقادیر را در env کپی کنید.
4. **بکاپ**:
   ```bash
   # روی هاست وردپرس
   wp db export backup-$(date +%F).sql
   tar czf uploads-$(date +%F).tar.gz wp-content/uploads
   ```

```bash
# .env (apps/api) — بخش مهاجرت؛ برای آریا تکنو فقط مقادیر عوض می‌شود
WP_URL=https://old-technokhan.ir
WP_USER=admin
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
WC_CONSUMER_KEY=ck_xxx
WC_CONSUMER_SECRET=cs_xxx
MIGRATION_EXPORT_DIR=./data/exports

# سپیدار (از پنل وردپرس/پلاگین سپیدار)
SEPIDAR_BASE_URL=http://sepidar-server:port
SEPIDAR_USERNAME=webservice_user
SEPIDAR_PASSWORD=...
SEPIDAR_PRICE_LIST_ID=0
#SEPIDAR_ITEMS_PATH=/api/Item/GetItems     ← اگر پلاگین مسیر متفاوتی دارد
#SEPIDAR_STOCK_PATH=/api/Stock/GetStocks

# ملی‌پیامک
SMS_PROVIDER=mellipayamak
SMS_BRAND_NAME=تکنو خان
MELIPAYAMAK_USERNAME=
MELIPAYAMAK_PASSWORD=
MELIPAYAMAK_FROM=
MELIPAYAMAK_OTP_BODY_ID=0    ← کد الگوی OTP خدماتی؛ 0 = پیامک معمولی

# زرین‌پال / باسلام / تصویر AI
ZARINPAL_MERCHANT_ID=
BASALAM_TOKEN=
BASALAM_VENDOR_ID=
OPENAI_API_KEY=
IMAGE_BRAND_NAME=تکنو خان
```

---

## ۳) فاز ۱ — خروجی از وردپرس

### ۳.۱ با WP-CLI (روی هاست — برای لیست URL و هش رمز کاربران لازم است)

```bash
cd /path/to/wordpress
wp export --dir=./exports --post_type=post,page

# هش رمز کاربران فقط از این مسیر به دست می‌آید (REST آن را نمی‌دهد)
wp user list --format=json --fields=ID,user_login,user_email,display_name,user_pass > users.json
# شماره موبایل از آدرس‌های ووکامرس:
wp eval 'global $wpdb; echo json_encode($wpdb->get_results("SELECT user_id, meta_value phone FROM {$wpdb->prefix}usermeta WHERE meta_key=\"billing_phone\""));' > phones.json
# (شماره‌ها را بر اساس user_id به users.json اضافه کنید — فیلد billing_phone)

wp post list --post_type=post,page,product --field=url --posts_per_page=-1 > all-urls.txt
```

### ۳.۲ با REST API (از سیستم خودتان — بقیه‌ی داده‌ها)

```bash
cd apps/api
pnpm migrate:export-wp
# خروجی‌ها در MIGRATION_EXPORT_DIR:
# posts.json / pages.json / post-categories.json / products.json / product-categories.json / all-urls.txt
```

### ۳.۳ رسانه

```bash
rsync -avz user@host:/path/to/wordpress/wp-content/uploads/ ./data/exports/media/
```

---

## ۴) فاز ۲ — ایمپورت به سایت جدید

نیازمندی اسکیما قبلاً اعمال شده (`Product.slug`، مدل `Article`، فیلدهای `User`) — فقط مایگریشن را اجرا کنید:

```bash
pnpm --filter api prisma:migrate     # یا prisma migrate deploy در پروداکشن
```

سپس (همه `-- --dry-run` هم می‌پذیرند):

```bash
pnpm --filter api migrate:users        # users.json → User (+wpPassHash, +username)
pnpm --filter api migrate:products     # products.json → Product (slug حفظ‌شده)
pnpm --filter api migrate:articles     # posts.json → Article
```

- **کاربران:** `username` همان `user_login` وردپرس؛ رمز به‌صورت هش phpass در `wpPassHash` نگه داشته می‌شود و کاربر با همان رمز قدیمی وارد می‌شود — در اولین ورود موفق، هش به bcrypt ارتقا و فیلد پاک می‌شود. کاربران بدون موبایل معتبر در `users-skipped.json` گزارش می‌شوند.
- **محصولات:** `sku` ووکامرس → `Product.sku`؛ این همان کلید اتصال به سپیدار است (کد کالا در سپیدار = SKU).
- **مقالات:** محتوای HTML به پاراگراف متنی تبدیل می‌شود تا قالب فعلی بدون تغییر رندر کند.

---

## ۵) فاز ۳ — SEO: ریدایرکت ۳۰۱، سایت‌مپ، کنسول

```bash
pnpm --filter api migrate:redirects
# خروجی:
#   redirects.conf        → بدنه‌ی nginx map
#   next-redirects.json   → [{source,destination,permanent}] (اگر middleware می‌خواهید)
#   redirects-unmatched.txt → URLهایی که قانون نگاشت نداشتند (fallback /blog)
```

nginx:

```nginx
map $uri $redirect_target {
  default "";
  include /etc/nginx/redirects.conf;
}
server {
  if ($redirect_target != "") { return 301 $redirect_target; }
  # قوانین الگویی:
  location ~ ^/product-category/(.+?)/?$ { return 301 /category/$1; }
  location ~ ^/category/(.+?)/?$        { return 301 /blog?category=$1; }
}
```

چک‌لیست: Change of Address در Search Console، ثبت sitemap جدید، `noindex` برای تگ‌ها، ماندگاری دائمی ریدایرکت‌ها.

---

## ۶) فاز ۴ — سینک خودکار سپیدار

```bash
pnpm sync:accounting              # اجرای تک‌بار (root script)
pnpm --filter api sync:accounting -- --dry-run   # پیش‌نمایش بدون نوشتن
# کرون (هر ۱۰ دقیقه):
*/10 * * * * cd /app && pnpm sync:accounting >> /var/log/accounting-sync.log 2>&1
```

رفتار: کالای جدید سپیدار → محصول **پیش‌نویس** (`isActive=false`) تا توضیح/تصویر تکمیل شود؛ تغییر قیمت/موجودی → به‌روزرسانی خودکار محصول موجود (محصول هیچ‌وقت حذف نمی‌شود). مسیرهای API با `SEPIDAR_ITEMS_PATH` / `SEPIDAR_STOCK_PATH` قابل تنظیم است — مقدارش را از پلاگین سپیدار در پنل وردپرس بردارید.

---

## ۷) فاز ۵ — پیامک و درگاه

- **ملی‌پیامک:** پیش‌فرض فعال است؛ `MELIPAYAMAK_OTP_BODY_ID` را از پنل ملی‌پیامک (الگوهای خدماتی) بردارید تا OTP از خط خدماتی برود. متن پیامک‌ها از `SMS_BRAND_NAME` برند هر پروژه را می‌گیرند.
- **زرین‌پال:** فقط `ZARINPAL_MERCHANT_ID` — برای هر دامنه یک کد درگاه جدا.
- تست OTP:
  ```bash
  curl -X POST localhost:5000/api/v1/auth/otp/request -H 'content-type: application/json' \
    -d '{"phoneNumber":"09123456789"}'
  ```

---

## ۸) فاز ۶ — ترب و باسلام

### ترب
فید آماده است: `https://new-site.ir/torob.xml` — همین URL را در پنل فروشنده‌ی ترب ثبت کنید. قیمت/موجودی از همان دیتای سینک سپیدار تغذیه می‌شود (کش ۱۰ دقیقه). لندینگ ترب از `url` داخل فید می‌خواند → خودکار به دامنه‌ی جدید می‌آید.

### باسلام
توکن از `basalam.com → پنل فروشنده → تنظیمات → API` (یا پلاگین باسلام در پنل وردپرس):

```bash
BASALAM_TOKEN=xxx node -e "import('./apps/api/dist/services/basalam.service.js').then(m=>new m.BasalamClient().healthCheck().then(console.log))"
```

کلاینت در `apps/api/src/services/basalam.service.ts` — سفارش‌های جدید باسلام را بخواند و به‌عنوان `Order` ثبت کنید (نگاشت در همان فایل، `fetchOrders`).

---

## ۹) فاز ۷ — پایپ‌لاین تصویر AI

```bash
pnpm images:generate -- --input ./raw/photo.jpg --slug wireless-mouse
# خروجی: apps/web/public/images/products/wireless-mouse-{main,lifestyle,banner}.webp
```

۱ عکس خام → ۳ فراخوانی `gpt-image-1` با پرامپت قالب ثابت (پس‌زمینه‌ی برند / صحنه‌ی لایف‌استایل / بنر تبلیغاتی) → برش دقیق به ابعاد قالب (`1200×1200`, `1200×1200`, `1600×1000`) → WebP. قالب (رنگ، لحن، جای لوگو) در `TEMPLATES` داخل `tools/image-pipeline/generate.mjs` تعریف شده — برای آریا تکنو فقط `IMAGE_BRAND_NAME` و `IMAGE_BRAND_STYLE` عوض می‌شود.

پردازش دسته‌ای تصاویر قدیمی ووکامرس: ابتدا `pnpm --filter web assets:ai` (تبدیل JPGهای دانلودشده به WebP با `optimize-ai-assets.mjs`)، بعد نسخه‌های AI را برای محصولات مهم تولید کنید.

---

## ۱۰) ترتیب اجرای نهایی

1. [ ] بکاپ وردپرس (دیتابیس + uploads) و تهیه‌ی `users.json` با هش رمزها (§۳.۱)
2. [ ] `pnpm --filter api prisma:migrate` + تنظیم env هر پروژه
3. [ ] `pnpm migrate:export-wp` → `migrate:users` → `migrate:products` → `migrate:articles`
4. [ ] پردازش تصاویر (§۹)
5. [ ] `migrate:redirects` + کانفیگ nginx + Change of Address + sitemap
6. [ ] `sync:accounting -- --dry-run` و بعد کرون واقعی
7. [ ] کلیدهای ملی‌پیامک (با body id خدماتی) و زرین‌پال + تست OTP/پرداخت
8. [ ] ثبت `/torob.xml` در ترب + اتصال باسلام
9. [ ] تنظیم مجوزهای فوتر: `wp-admin جدید ← تنظیمات ← مجوزهای فوتر` (کد HTML اینماد/ساماندهی/اصناف)
10. [ ] DNS سوییچ + مانیتورینگ ۴۸ ساعته (Coverage گوگل، ۴۰۴ها در لاگ nginx)

---

## ۱۱) نکات مخصوص آریا تکنو

- همه‌ی مقادیر برند (نام در پیامک، فونت/رنگ قالب تصویر، متن فوتر) از env می‌آید — هیچ‌چیز در کد hard-code نیست.
- ابزارهای `apps/api/tools` و `tools/image-pipeline` مستقل از برندند؛ مستقیم در ریپوی آریا تکنو کپی شوند.
- ساختار permalink وردپرس آریا تکنو را قبل از `migrate:redirects` چک کنید؛ اگر متفاوت است قوانین §۵ را برای همان بنویسید.
- رمزهای وردپرس آریا تکنو هم با همان مکانیزم phpass→bcrypt مهاجرت می‌شوند — بدون اجبار به ریست رمز.
