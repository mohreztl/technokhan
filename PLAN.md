# TechnoKhan Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ساخت فروشگاه کامل، سریع و فارسی «تکنو خان» برای گجت‌های هوشمند و لوازم جانبی دیجیتال با تجربه بصری ممتاز و جریان خرید واقعی در حالت دمو.

**Architecture:** مونوریپوی موجود بر پایه Next.js App Router و Fastify حفظ می‌شود. `packages/shared` منشأ واحد مدل‌ها، کاتالوگ فارسی، قیمت‌گذاری و محتواست؛ Next.js برای SEO، SSR/ISR و رابط کاربری، Fastify برای API فروشگاه و Zustand/React Query برای وضعیت پایدار و داده کلاینت استفاده می‌شوند. حالت دمو بدون PostgreSQL و درگاه خارجی، تمام مسیر خرید را قابل آزمایش نگه می‌دارد.

**Tech Stack:** Next.js 16، React 19، TypeScript strict، Tailwind CSS 4، Fastify 5، Prisma/PostgreSQL در حالت کامل، Zustand، TanStack Query، Framer Motion، Zod، Lucide، Serwist/PWA، Sharp/WebP.

**Spec:** مشخصات فازبندی‌شده ارسالی کاربر؛ این سند نسخه اجرایی و قرارداد معماری همان مشخصات است.

## Global Constraints

- ریموت اصلی فقط `origin = https://github.com/mohreztl/technokhan.git` است؛ هرگز روی `upstream-autolounge` پوش انجام نمی‌شود.
- پس از هر فاز: بررسی تغییرات، اجرای Lint و Typecheck مرتبط، سپس commit و `git push -u origin main`.
- زبان محصول فارسی، `lang="fa"`, `dir="rtl"`، طراحی mobile-first و استفاده از کلاس‌های منطقی RTL الزامی است.
- TypeScript سخت‌گیرانه؛ بدون `any` برای دور زدن خطا. کامپوننت‌ها، هوک‌ها و روت‌های جدید/بازنویسی‌شده TSDoc/JSDoc دقیق و کوتاه دارند.
- تمام قیمت‌ها تومان و تمام اعداد نمایشی فارسی و `tabular-nums` هستند.
- دسترسی‌پذیری: کیبورد، focus-visible، نام‌های قابل دسترس، کنتراست WCAG AA، اهداف لمسی حداقل ۴۴ پیکسل و احترام به reduced-motion.
- تصاویر محلی و بهینه WebP، دارای ابعاد، `sizes` و alt فارسی مشخص هستند؛ هیچ URL تصویری شکننده خارجی در UI قرار نمی‌گیرد.
- بدون وابستگی به پنل مدیریت برای خواندن ویترین؛ خواندن سروری از repository با fallback به کاتالوگ bundled انجام می‌شود.
- تسویه و پرداخت در نبود پیکربندی واقعی صریحاً «نمایشی» نام‌گذاری می‌شوند؛ موفقیت پرداخت واقعی القا نمی‌شود.

## Review Focus

- **Hydration و LocalStorage:** قیمت، تعداد سبد و صفحات وابسته به وضعیت پس از hydration بدون ناسازگاری SSR نمایش داده شوند؛ آزمون مرورگر reload سبد در فاز ۴.
- **فیلترهای خالی/ترکیبی:** ترکیب دسته، برند، قیمت، موجودی و مرتب‌سازی نباید خطا یا نتیجه نادرست بدهد؛ آزمون واحد `filterProducts` در فاز ۳.
- **موجودی و تعداد:** تعداد سبد نباید از موجودی محصول عبور کند؛ آزمون واحد store و سناریوی UI در فازهای ۳ و ۴.
- **RTL و اورفلو:** جداول مقایسه، مشخصات، گالری، دراورها و فرم‌ها در عرض ۳۷۵ پیکسل بدون اورفلو صفحه کار کنند؛ بازبینی مرورگر در فازهای ۴ و ۵.
- **خطای تصویر و داده:** تصویر مفقود fallback دارد و slug نامعتبر صفحه ۴۰۴ کنترل‌شده می‌سازد؛ آزمون مرورگر و metadata در فازهای ۴ و ۵.

---

## رویکردهای بررسی‌شده و تصمیم معماری

1. **بازآفرینی قراردادهای موجود — انتخاب‌شده:** مدل `Product`، repository، React Query، Zustand، سبد، checkout و SEO موجود حفظ و دامنه آن‌ها از خودرو به گجت منتقل می‌شود. سریع‌ترین مسیر با کمترین ریسک شکستن جریان خرید است.
2. **ساخت مجدد از صفر:** آزادی ظاهری بیشتر اما بازنویسی بی‌مورد API، فرم‌ها، اعتبارسنجی و حالت دمو؛ رد می‌شود.
3. **فرانت‌اند ایستا بدون Fastify:** ساده‌تر اما قرارداد صریح Next.js + Fastify و قابلیت توسعه سفارش واقعی را حذف می‌کند؛ رد می‌شود.

مسیرهای رزرو، گاراژ و سرویس‌های دیتیلینگ بخشی از محصول نهایی نیستند و از ناوبری، sitemap و bundle تجربه فروشگاه حذف می‌شوند. قابلیت‌های عمومی مثل احراز هویت، سفارش‌ها و مدیریت API فقط تا حد سازگاری زیرساخت حفظ می‌شوند.

## دیزاین سیستم «مکانیسم نئون»

### زبان بصری

- **شخصیت:** صنعتی، دقیق و لوکس؛ سطوح گرافیتی مات، شبکه‌های فنی نیمه‌شفاف، برچسب‌های مونو، شیشه مات و خطوط مواد مصرفی سبز نئونی. تقلید مستقیم از برند دیگری نمی‌شود.
- **پالت روشن:** پس‌زمینه استخوانی سرد `#F2F3EF`، سطح `#FCFCF8`، متن `#111315`، متن فرعی `#61676B`، خط `#D8DCD5`.
- **پالت تیره:** پس‌زمینه `#090B0C`، سطح `#111516`، سطح بالا `#181D1E`، متن `#F3F5EE`، خط `#293031`.
- **اکسنت:** Volt `#C8F45A` در تیره و `#709800` در روشن برای کنتراست؛ CTA تیره روی Volt. نارنجی `#FF6846` برای تخفیف، سبز `#35C98B` برای موجودی، کهربا `#E5A93D` برای کم‌موجودی و قرمز `#E65757` برای خطا/ناموجود.
- **فلز و شیشه:** نقره‌ای `#AEB6B8`، شیشه با blur ملایم و border واضح؛ سایه‌های کوتاه و دقیق به‌جای هاله‌های بزرگ.
- **تایپوگرافی:** Vazirmatn variable محلی؛ display با وزن ۷۰۰–۸۰۰ و tracking کنترل‌شده، متن ۴۰۰–۵۰۰، اعداد `tabular-nums`. متن لاتین کوچک برای مدل و برند با `dir="ltr"`.
- **فرم:** شعاع ۱۲ برای کنترل‌ها، ۲۰ برای کارت‌ها، ۲۸ برای ویترین‌ها و کپسول برای badge؛ border صنعتی ۱px و جزئیات خط‌چین.
- **حرکت:** ۱۶۰–۲۴۰ms برای کنترل‌ها و ۴۰۰–۶۰۰ms برای ویترین؛ transform/opacity، بدون animation دائمی پرهزینه و با reduced-motion.
- **امضای بصری:** شماره‌گذاری بخش‌ها `۰۱ / ۰۲`، برچسب «TECHNOKHAN / ORIGINAL TECH»، کارت‌های شناور مشخصات و Bento نامتقارن.

### ساختار کامپوننت‌ها

- `components/ui`: Button, IconButton, Badge, Input, Select, RangeSlider, Switch, Checkbox, Dialog, ResponsiveDialog/Drawer, BottomSheet, Tabs, Accordion, Skeleton, Toast, RatingStars, PriceTag.
- `components/storefront`: ProductCard, ProductGrid, ProductGallery, VariantSelector, WarrantySelector, FilterPanel, ActiveFilterChips, SortSelect, SearchPalette, CartLineItem, BrandStrip, SectionHeader.
- `components/home`: HeroShowcase, BentoCategories, FlashDeals, FeaturedTabs, GadgetFinder, MagazinePreview, TrustStrip.
- `components/organisms`: Navbar + MegaMenu, MobileTabBar, CartDrawer, QuickViewModal, CompareBar, Footer.
- `components/blog`: ArticleCard, ArticleBody, ArticleToc, ShareRow.
- `lib/store`: cart, wishlist, compare (۴ محصول)، recently-viewed و UI.
- `lib/data`: repository سروری، query/filter خالص، API fallback و مبدل‌های نمایش.

## مانیفست تصاویر مورد نیاز AI Studio

تمام پرامپت‌ها: عکاسی تجاری/رندر سه‌بعدی واقع‌گرایانه، گرافیت مات و فلز، نور Volt بسیار ظریف، بدون متن/لوگو/واترمارک، فضای منفی مناسب چیدمان RTL، نسبت و اندازه مشخص. خروجی نهایی WebP با کیفیت ۸۰–۸۶ و alt فارسی در `src/content/media-assets.ts` ثبت می‌شود.

| گروه | تعداد / نسبت | موضوع |
|---|---:|---|
| Hero | ۲ فریم اصلی، ۱۶:۱۰ | کلوزآپ هدفون بی‌سیم و ترکیب شارژر GaN شفاف، ساعت اولترا و اسپیکر قابل‌حمل |
| Bento | ۶ تصویر، ۴:۳ یا ۱:۱ | GaN، هدفون نویزکنسلینگ، پاوربانک MagSafe، گیمینگ/دسکتاپ، پوشیدنی، کابل/هاب/مبدل |
| محصول | ۱۲ تصویر، ۱:۱ | هدفون، ایرباد، ساعت، اسپیکر، شارژر GaN، پاوربانک، هاب، کابل، کیبورد، ماوس، گیره/پایه و شارژر بی‌سیم |
| مجله | ۴ تصویر، ۳:۲ | راهنمای GaN، نویزکنسلینگ، میز کار مینیمال، انتخاب پاوربانک |
| برند/عمومی | لوگوی SVG و OG | نشان اختصاصی تکنو خان، placeholder، تصویر اشتراک‌گذاری |

مسیرهای پیشنهادی: `/images/hero/*.webp`, `/images/categories/*.webp`, `/images/products/*.webp`, `/images/blog/*.webp`.

## معماری داده و مسیرها

- مدل محصول: slug/id، نام فارسی/لاتین، توضیح کوتاه/کامل، برند، دسته، قیمت/تخفیف، موجودی، gallery، رنگ‌ها، گارانتی‌ها، specifications، features، tags، rating/reviews، flags پرفروش/جدید/منتخب.
- مدل تکمیلی: Category، Brand، Article، Review، Coupon و تنظیمات ارسال.
- Query: `q`, `category`, `brands`, `minPrice`, `maxPrice`, `inStock`, `features`, `sort`, `page`, `limit`.
- API خواندنی: `GET /api/v1/products`, `/products/:slug`, `/categories`, `/brands`, `/search`, `/articles`, `/articles/:slug`؛ مسیرهای سبد/سفارش موجود سازگار می‌شوند.
- Routes وب: `/`, `/design-system`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/compare`, `/wishlist`, `/cart`, `/checkout`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/track`.
- سازگاری: `/products` و `/products/[id]` به مسیرهای canonical هدایت یا تا پایان انتقال سازگار نگه داشته می‌شوند.

---

### Task 0: ایزوله‌سازی و مستندسازی پایه

**Files:** Create `PLAN.md`; configure `.git/config` remotes.

- [x] Clone در پوشه خالی `technokhan` و rename به `upstream-autolounge`.
- [x] ساخت `mohreztl/technokhan` و اتصال `origin`.
- [x] اسکن Next.js، Fastify، shared و قراردادهای frontend.
- [ ] اجرای `pnpm lint` و `pnpm type-check` و ثبت وضعیت پایه.
- [ ] Commit `chore(init): initialize technokhan repository from base stack and add master PLAN.md` و push به `origin/main`.

### Task 1: دیزاین سیستم و UI primitives

**Files:** Modify `apps/web/src/app/{layout.tsx,globals.css}`; create `apps/web/src/app/design-system/page.tsx`; modify/create `apps/web/src/components/ui/*`; add local Vazirmatn assets.

**Interfaces:** variants پایدار `Button`, `Badge`, `Input`, `Dialog`, `Tabs`, `Accordion` حفظ می‌شوند؛ `PriceTag { price, originalPrice?, size?, className? }` و `RangeSlider { min, max, value:[number,number], onValueChange }` اضافه می‌شوند.

- [x] مستندات Next.js 16 و راهنمای modern-web/frontend را پیش از تغییر کد بخوان.
- [x] توکن‌ها، Vazirmatn، dark/light، focus و motion را پیاده‌سازی کن.
- [x] primitives لازم را با API تایپ‌شده، TSDoc و حالت disabled/loading/error بساز.
- [x] صفحه تعاملی `/design-system` همه توکن‌ها و variants را نمایش دهد.
- [x] `pnpm --filter web type-check && pnpm --filter web lint` و smoke test مرورگر.
- [x] Commit/push `feat(phase-1): craft bespoke TechnoKhan RTL design system and reusable UI primitives`.

### Task 2: دارایی‌های بصری

**Files:** Create `apps/web/public/images/**`, `apps/web/src/content/media-assets.ts`; update visual references.

**Interfaces:** `MediaAsset { src, alt, width, height, kind, prompt? }` و مجموعه‌های `HERO_MEDIA`, `CATEGORY_MEDIA`, `PRODUCT_MEDIA`, `ARTICLE_MEDIA`.

- [x] مرورگر Chrome واقعی را به AI Studio وصل کن؛ مدل خطادار Imagen با Nano Banana 2 Lite جایگزین و خطا در ledger ثبت شد.
- [x] تصاویر جدول مانیفست را تولید/دانلود و به WebP بهینه کن.
- [x] مانیفست تایپ‌شده با alt سئوشده و ابعاد واقعی بساز.
- [x] وجود فایل‌ها، فرمت، ابعاد، contact sheet و یکتایی SHA-256 را بررسی کن.
- [ ] Typecheck/Lint سپس commit/push `feat(phase-2): generate and integrate studio-grade AI visual assets for TechnoKhan`.

### Task 3: کاتالوگ، Fastify و state

**Files:** Replace shared product/category/brand/article data; modify shared types/schemas and API product routes; create query tests; modify Zustand stores and add recently-viewed.

**Interfaces:** `filterProducts(products, query): Product[]`, `searchProducts(query)`, `getProductBySlug(slug)`, stores پایدار `useCart`, `useWishlist`, `useCompare`, `useRecentlyViewed`.

- [ ] مدل‌ها و حداقل ۱۲ محصول کامل فارسی، ۶ دسته، ۷ برند، ۴ مقاله و نظرات را بساز.
- [ ] فیلتر/جستجو/مرتب‌سازی خالص و تست‌های ترکیبی، بازه قیمت، خالی و موجودی بنویس.
- [ ] Fastify را برای slug و queryهای جدید سازگار و fallback محلی را به‌روز کن.
- [ ] سبد با کنترل موجودی، wishlist، compare حداکثر ۴ و recent items را پایدار کن و تست store اجرا کن.
- [ ] تست shared + Typecheck/Lint؛ commit/push `feat(phase-3): configure Fastify data services, Persian tech catalog, and client state stores`.

### Task 4: تجربه کامل فروشگاه

**Files:** Rewrite home sections/app shell/catalog/product/cart/checkout/compare routes and their focused components.

**Interfaces:** همه کارت‌ها از `Product` و `MediaAsset` استفاده می‌کنند؛ لینک canonical `/product/[slug]`؛ filter query از Task 3؛ checkout موجود را با اعتبارسنجی Zod حفظ کن.

- [ ] Header چسبان، MegaMenu تصویری، جستجوی Cmd/Ctrl+K، theme، wishlist، CartDrawer و bottom nav بساز.
- [ ] صفحه اصلی را با Hero، Bento، FlashDeals با تایمر، FeaturedTabs، برندها، GadgetFinder و مجله پیاده کن.
- [ ] `/shop` و `/category/[slug]` با فیلتر دسکتاپ/drawer موبایل، chips، sort، grid/list، pagination و skeleton بساز.
- [ ] `/product/[slug]` با gallery/zoom، رنگ و گارانتی، تب‌ها، نقد، نظرات، compare، recent، sticky CTA و مکمل‌ها بساز.
- [ ] `/compare`, `/wishlist`, `/cart`, `/checkout` و خلاصه سفارش/کد تخفیف/هزینه ارسال را کامل کن.
- [ ] جریان واقعی افزودن به سبد → reload → کوپن → فرم معتبر → سفارش دمو را در مرورگر دسکتاپ و موبایل آزمایش کن.
- [ ] Typecheck/Lint/build و commit/push `feat(phase-4): build complete TechnoKhan storefront pages, interactive gadget finder, and cart/checkout flows`.

### Task 5: مجله، صفحات اطلاعاتی، SEO و انتشار نهایی

**Files:** Rewrite blog/about/contact/faq/legal; update metadata, JSON-LD, sitemap, robots, manifest, icons, README/docs and brand/package names.

**Interfaces:** metadata canonical بر اساس `https://technokhan.com`; schemaهای Organization, WebSite/SearchAction, Product/Offer, BreadcrumbList, Article و FAQPage.

- [ ] `/blog` و `/blog/[slug]` با دسته‌بندی، جستجو، TOC، مطالب مرتبط و اشتراک‌گذاری کامل کن.
- [ ] صفحات درباره، تماس، سوالات متداول، حریم خصوصی، شرایط، رهگیری و ۴۰۴ را با برند تکنو خان نهایی کن.
- [ ] metadata/OG، canonical، sitemap، robots، JSON-LD، manifest و PWA را به‌روز کن.
- [ ] کدهای قدیمی خودرویی را از مسیرهای عمومی و bundle تجربه اصلی حذف و docs/package names را به TechnoKhan تغییر بده.
- [ ] Lighthouse/audit دسترسی و لینک‌ها، تست build production، تست API health و smoke همه مسیرهای اصلی را انجام بده.
- [ ] `git status` را بررسی و خروجی‌های موقت را پاک کن؛ commit/push `feat(phase-5): launch TechnoKhan magazine, informational pages, technical SEO, and final optimizations`.

## Definition of Done

- همه مسیرهای ذکرشده بدون خطای runtime در دسکتاپ و موبایل و بدون اورفلو RTL اجرا شوند.
- `pnpm test`, `pnpm type-check`, `pnpm lint`, `pnpm build` روی deliverable موفق باشند.
- جریان خرید دمو از کشف محصول تا ثبت سفارش واقعاً در مرورگر انجام شده باشد.
- تمام دارایی‌ها محلی، manifest دقیق و metadata/structured data معتبر باشند.
- پنج commit فاز روی `https://github.com/mohreztl/technokhan` قرار گیرند و هیچ push به autolounge انجام نشود.
- هر محدودیت باقی‌مانده، مخصوصاً اگر AI Studio یا سرویس خارجی در دسترس نباشد، شفاف در گزارش نهایی ذکر شود و به‌عنوان کار انجام‌شده اعلام نشود.
