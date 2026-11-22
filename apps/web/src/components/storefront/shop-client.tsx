'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, Check, ChevronLeft, Filter, Grid2X2, List, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { toPersianDigits, type Brand, type Category, type PagedList, type Product, type ProductListQuery } from '@technokhan/shared';
import { useProducts } from '@/lib/hooks/use-products';
import { parseShopQuery, shopQueryToSearchParams, SHOP_PRICE_LIMIT } from '@/lib/shop-query';
import { cn } from '@/lib/utils';
import { ProductGrid } from './product-grid';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RangeSlider } from '@/components/ui/range-slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export interface ShopClientProps {
  initialProducts: PagedList<Product>;
  categories: Category[];
  brands: Brand[];
  initialQuery: ProductListQuery;
  lockedCategory?: Category;
}

const CATEGORY_CONTENT: Record<string, { headline: string; description: string; points: string[] }> = {
  chargers: {
    headline: 'شارژ سریع، خنک و مطمئن',
    description: 'شارژر و تجهیزات شارژ با توان واقعی، محافظت دمایی و سازگاری روشن با دستگاه شما.',
    points: ['توان و پروتکل شارژ مشخص', 'محافظت در برابر نوسان و دما', 'گارانتی قابل بررسی'],
  },
  headphones: {
    headline: 'صدای دقیق، انتخاب شخصی',
    description: 'هدفون، ایرباد و اسپیکر برای تمرکز، تماس و موسیقی؛ با توضیح صریح تفاوت مدل‌ها.',
    points: ['نویزکنسلینگ و کیفیت تماس', 'بررسی باتری و راحتی', 'اتصال پایدار بی‌سیم'],
  },
  powerbanks: {
    headline: 'انرژی همراه برای تمام روز',
    description: 'پاوربانک و مگ‌سیف با ظرفیت واقعی، شارژ امن و ابعاد مناسب استفاده روزمره یا سفر.',
    points: ['ظرفیت و توان خروجی واقعی', 'شارژ مغناطیسی و سیمی', 'مدار محافظ دستگاه'],
  },
  gaming: {
    headline: 'میز کار دقیق و مرتب',
    description: 'کیبورد، ماوس و تجهیزات دسکتاپ برای کار طولانی و بازی، با ارگونومی و اتصال قابل اعتماد.',
    points: ['اتصال کم‌تأخیر', 'ساخت ارگونومیک و بادوام', 'سازگاری با میز کار شما'],
  },
  wearables: {
    headline: 'سلامت و اعلان‌ها روی مچ',
    description: 'گجت پوشیدنی با سنجش دقیق، باتری قابل اتکا و امکاناتی که واقعاً به سبک روزمره اضافه می‌شود.',
    points: ['پایش سلامت و تمرین', 'GPS و اتصال مستقل', 'بدنه مقاوم و راحت'],
  },
  cables: {
    headline: 'اتصال پایدار، بدون افت سرعت',
    description: 'کابل، هاب و مبدل برای شارژ و انتقال داده با مشخصات فنی شفاف و ساخت مقاوم.',
    points: ['توان شارژ و سرعت داده', 'سازگاری پورت‌ها', 'روکش و کانکتور بادوام'],
  },
};

const FEATURE_GROUPS = [
  { label: 'اتصال و سازگاری', options: ['USB-C', 'بلوتوث', 'بی‌سیم', 'Qi2', 'مگ‌سیف', 'GPS', 'HDMI 4K', '۲.۴ گیگاهرتز'] },
  { label: 'قابلیت و کاربرد', options: ['GaN', 'شارژ سریع', 'Power Delivery', 'نویزکنسلینگ', 'ضدآب', 'مکانیکال', 'ارگونومیک', 'پایش سلامت'] },
];

/** URL-seeded catalog with composable filters, sorting, grid/list views and mobile filter sheet. */
export function ShopClient({ initialProducts, categories, brands, initialQuery, lockedCategory }: ShopClientProps) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [layout, setLayout] = React.useState<'grid' | 'list'>('grid');
  const [initialSignature] = React.useState(() => JSON.stringify(initialQuery));
  const firstUrlSync = React.useRef(true);
  const deferredQuery = React.useDeferredValue(query);
  const signature = JSON.stringify(deferredQuery);
  const result = useProducts(deferredQuery, { initialData: signature === initialSignature ? initialProducts : undefined });
  const content = lockedCategory ? CATEGORY_CONTENT[lockedCategory.id] : undefined;
  const update = React.useCallback((patch: Partial<ProductListQuery>) => setQuery((current) => {
    const next = { ...current, ...patch, page: patch.page ?? 1 };
    if (next.minPrice === 0) next.minPrice = undefined;
    if (next.maxPrice === SHOP_PRICE_LIMIT) next.maxPrice = undefined;
    return next;
  }), []);
  const clear = () => setQuery({ category: lockedCategory?.id, sortBy: 'popular', sortOrder: 'desc', page: 1, limit: 12 });
  const filterPanel = <FilterPanel categories={categories} brands={brands} query={query} lockedCategory={lockedCategory} update={update} clear={clear} />;
  const activeCount = [query.search, query.brands?.length, query.inStock, query.deals, query.featured, query.editorChoice, query.minRating, query.minDiscount, query.minReviews, query.minPrice !== undefined || query.maxPrice !== undefined, query.features?.length, !lockedCategory && query.category].filter(Boolean).length;

  React.useEffect(() => {
    if (firstUrlSync.current) {
      firstUrlSync.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const nextUrl = `${pathname}${shopQueryToSearchParams(deferredQuery, { skipCategory: Boolean(lockedCategory) })}`;
      if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.pushState(window.history.state, '', nextUrl);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [deferredQuery, lockedCategory, pathname]);

  React.useEffect(() => {
    const onPopState = () => {
      const params = Object.fromEntries(new URLSearchParams(window.location.search));
      const next = parseShopQuery(params);
      setQuery({ ...next, category: lockedCategory?.id ?? next.category });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [lockedCategory?.id]);

  return (
    <div className="pb-16">
      <header className="bg-[#111516] text-[#f3f5ee]">
        <div className="container-custom py-7 sm:py-10">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/55" aria-label="مسیر صفحه">
            <Link href="/" className="hover:text-white">خانه</Link><ChevronLeft className="size-3" aria-hidden="true" />
            {!lockedCategory ? <span>فروشگاه</span> : <><Link href="/shop" className="hover:text-white">فروشگاه</Link><ChevronLeft className="size-3" aria-hidden="true" /><span>{lockedCategory.name}</span></>}
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <h1 className="text-balance text-3xl font-black sm:text-5xl">{content?.headline ?? 'گجت درست را سریع‌تر پیدا کنید'}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{content?.description ?? 'فروشگاه تکنو خان؛ جستجو و مقایسه گجت‌های اورجینال بر اساس برند، بودجه، امتیاز و مشخصات واقعی.'}</p>
            </div>
            <Badge variant="original" className="border-white/15 bg-white/10 px-4 py-2 text-white tabular-nums" aria-live="polite" aria-atomic="true">{toPersianDigits(result.total)} محصول</Badge>
          </div>
          {content && <ul className="mt-6 grid gap-2 border-t border-white/10 pt-5 text-xs text-white/75 sm:grid-cols-3">{content.points.map((point) => <li key={point} className="flex items-center gap-2"><Check className="size-4 text-[#c8f45a]" aria-hidden="true" />{point}</li>)}</ul>}
        </div>
      </header>

      <nav className="border-b border-border bg-card" aria-label="دسته‌بندی محصولات">
        <div className="container-custom hide-scrollbar flex gap-2 overflow-x-auto py-3">
          <Link href="/shop" className={cn('flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold', !lockedCategory ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>همه</Link>
          {categories.map((category) => <Link key={category.id} href={`/category/${category.id}`} aria-current={lockedCategory?.id === category.id ? 'page' : undefined} className={cn('flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors', lockedCategory?.id === category.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-secondary')}>{category.name}</Link>)}
        </div>
      </nav>

      <div className="container-custom grid gap-7 py-7 lg:grid-cols-[270px_1fr] lg:py-10">
        <aside className="hidden lg:block"><div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5">{filterPanel}</div></aside>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
            <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}><Filter className="size-4" aria-hidden="true" /> فیلترها {activeCount > 0 && <Badge variant="secondary" size="sm">{toPersianDigits(activeCount)}</Badge>}</Button>
            <p className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><ShieldCheck className="size-4 text-secondary" aria-hidden="true" />همه محصولات با ضمانت اصالت</p>
            <Select aria-label="مرتب‌سازی محصولات" value={query.sortBy === 'price' ? query.sortOrder === 'asc' ? 'priceAsc' : 'priceDesc' : query.sortBy} onChange={(event) => {
              const value = event.target.value;
              update(value === 'priceAsc' || value === 'priceDesc' ? { sortBy: 'price', sortOrder: value === 'priceAsc' ? 'asc' : 'desc' } : { sortBy: value as ProductListQuery['sortBy'], sortOrder: 'desc' });
            }} containerClassName="ms-auto w-44" options={[{ value: 'popular', label: 'پرفروش‌ترین' }, { value: 'newest', label: 'جدیدترین' }, { value: 'rating', label: 'بالاترین امتیاز' }, { value: 'discount', label: 'بیشترین تخفیف' }, { value: 'priceAsc', label: 'ارزان‌ترین' }, { value: 'priceDesc', label: 'گران‌ترین' }]} />
            <div className="flex rounded-xl border border-border p-1" role="group" aria-label="چیدمان محصولات">
              <Button size="icon-sm" variant={layout === 'grid' ? 'primary' : 'ghost'} aria-label="نمایش شبکه‌ای" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')}><Grid2X2 className="size-4" aria-hidden="true" /></Button>
              <Button size="icon-sm" variant={layout === 'list' ? 'primary' : 'ghost'} aria-label="نمایش فهرستی" aria-pressed={layout === 'list'} onClick={() => setLayout('list')}><List className="size-4" aria-hidden="true" /></Button>
            </div>
          </div>
          <ActiveChips categories={categories} query={query} update={update} lockedCategory={lockedCategory} />
          {result.isLoading ? <ProductSkeletons /> : result.isError ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center"><AlertCircle className="mb-4 size-8 text-destructive" aria-hidden="true" /><h2 className="text-xl font-black">دریافت محصولات ناموفق بود</h2><p className="mt-2 text-sm text-muted-foreground">اتصال را بررسی کنید و دوباره تلاش کنید؛ فیلترهای شما حفظ شده‌اند.</p><Button className="mt-5" variant="outline" onClick={() => result.refetch()}><RotateCcw className="size-4" aria-hidden="true" />تلاش دوباره</Button></div>
          ) : result.products.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center"><h2 className="text-xl font-black">محصولی با این فیلترها پیدا نشد</h2><p className="mt-2 text-sm text-muted-foreground">بازه قیمت یا برندها را تغییر دهید، یا همه فیلترها را پاک کنید.</p><Button className="mt-5" variant="outline" onClick={clear}><RotateCcw className="size-4" aria-hidden="true" /> پاک کردن فیلترها</Button></div>
          ) : (
            <div className={cn('transition-opacity', result.isFetching && 'opacity-55')} aria-busy={result.isFetching}><ProductGrid products={result.products} layout={layout} priorityCount={2} /></div>
          )}
          {result.pagination && result.pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="صفحه‌بندی محصولات">
              <Button variant="outline" disabled={!result.pagination.hasPrev} onClick={() => update({ page: (query.page ?? 1) - 1 })}>قبلی</Button>
              <span className="px-4 text-sm tabular-nums">صفحه {toPersianDigits(result.pagination.page)} از {toPersianDigits(result.pagination.totalPages)}</span>
              <Button variant="outline" disabled={!result.pagination.hasNext} onClick={() => update({ page: (query.page ?? 1) + 1 })}>بعدی</Button>
            </nav>
          )}
        </div>
      </div>
      <BottomSheet open={filtersOpen} onOpenChange={setFiltersOpen} title="فیلتر محصولات" description={`${toPersianDigits(result.total)} محصول با فیلترهای فعلی`}><div className="py-3">{filterPanel}<Button className="mt-5 w-full" onClick={() => setFiltersOpen(false)}>نمایش نتایج</Button></div></BottomSheet>
    </div>
  );
}

interface FilterPanelProps {
  categories: Category[];
  brands: Brand[];
  query: ProductListQuery;
  lockedCategory?: Category;
  update: (patch: Partial<ProductListQuery>) => void;
  clear: () => void;
}

/** Controlled filter form shared by the desktop sidebar and mobile sheet. */
function FilterPanel({ categories, brands, query, lockedCategory, update, clear }: FilterPanelProps) {
  const toggleFeature = (feature: string, checked: boolean) => {
    const current = query.features ?? [];
    update({ features: checked ? [...current, feature] : current.filter((item) => item !== feature) });
  };

  return (
    <search aria-label="فیلتر محصولات">
      <div className="space-y-5">
        <div className="flex items-center justify-between"><h2 className="font-black">فیلترهای دقیق</h2><Button variant="ghost" size="sm" onClick={clear}><RotateCcw className="size-3.5" aria-hidden="true" /> پاک کردن</Button></div>
        <Input name="search" label="جستجو" type="search" value={query.search ?? ''} maxLength={100} enterKeyHint="search" onChange={(event) => update({ search: event.target.value || undefined })} placeholder="نام یا مشخصه محصول" />
        {!lockedCategory && <Select name="category" label="دسته‌بندی" value={query.category ?? ''} onChange={(event) => update({ category: event.target.value || undefined })} options={[{ value: '', label: 'همه دسته‌ها' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]} />}
        <fieldset><legend className="mb-2 text-sm font-semibold">برند</legend><div className="space-y-1">{brands.map((brand) => <Checkbox key={brand.id} label={brand.nameFa} checked={query.brands?.includes(brand.name) ?? false} onChange={(event) => {
          const current = query.brands ?? [];
          update({ brands: event.target.checked ? [...current, brand.name] : current.filter((item) => item !== brand.name) });
        }} />)}</div></fieldset>
        <div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <Input name="minPrice" label="حداقل قیمت" type="number" inputMode="numeric" min={0} max={SHOP_PRICE_LIMIT} step={500_000} value={query.minPrice ?? ''} onChange={(event) => {
              if (!event.target.value) return update({ minPrice: undefined });
              update({ minPrice: Math.max(0, Math.min(Number(event.target.value), query.maxPrice ?? SHOP_PRICE_LIMIT)) });
            }} />
            <Input name="maxPrice" label="حداکثر قیمت" type="number" inputMode="numeric" min={0} max={SHOP_PRICE_LIMIT} step={500_000} value={query.maxPrice ?? ''} onChange={(event) => {
              if (!event.target.value) return update({ maxPrice: undefined });
              update({ maxPrice: Math.max(query.minPrice ?? 0, Math.min(Number(event.target.value), SHOP_PRICE_LIMIT)) });
            }} />
          </div>
          <RangeSlider label="بازه قیمت (تومان)" min={0} max={SHOP_PRICE_LIMIT} step={500_000} minGap={500_000} value={[query.minPrice ?? 0, query.maxPrice ?? SHOP_PRICE_LIMIT]} onValueChange={([minPrice, maxPrice]) => update({ minPrice, maxPrice })} />
        </div>
        <Select name="minRating" label="حداقل امتیاز خریداران" value={String(query.minRating ?? '')} onChange={(event) => update({ minRating: event.target.value ? Number(event.target.value) : undefined })} options={[{ value: '', label: 'همه امتیازها' }, { value: '4', label: '۴ ستاره و بیشتر' }, { value: '4.5', label: '۴٫۵ ستاره و بیشتر' }]} />
        <Select name="minDiscount" label="حداقل درصد تخفیف" value={String(query.minDiscount ?? '')} onChange={(event) => update({ minDiscount: event.target.value ? Number(event.target.value) : undefined })} options={[{ value: '', label: 'همه تخفیف‌ها' }, { value: '5', label: '۵٪ و بیشتر' }, { value: '10', label: '۱۰٪ و بیشتر' }, { value: '15', label: '۱۵٪ و بیشتر' }]} />
        <Select name="minReviews" label="حداقل نظر خریداران" value={String(query.minReviews ?? '')} onChange={(event) => update({ minReviews: event.target.value ? Number(event.target.value) : undefined })} options={[{ value: '', label: 'هر تعداد نظر' }, { value: '50', label: '۵۰ نظر و بیشتر' }, { value: '100', label: '۱۰۰ نظر و بیشتر' }, { value: '150', label: '۱۵۰ نظر و بیشتر' }, { value: '200', label: '۲۰۰ نظر و بیشتر' }]} />
        {FEATURE_GROUPS.map((group) => (
          <fieldset key={group.label}><legend className="mb-2 text-sm font-semibold">{group.label}</legend><div className="space-y-1">{group.options.map((feature) => <Checkbox key={feature} label={feature} checked={query.features?.includes(feature) ?? false} onChange={(event) => toggleFeature(feature, event.target.checked)} />)}</div></fieldset>
        ))}
        <div className="flex min-h-11 items-center justify-between border-t border-border pt-4"><span className="text-sm font-semibold">فقط کالاهای موجود</span><Switch checked={query.inStock ?? false} onCheckedChange={(inStock) => update({ inStock: inStock || undefined })} label="فقط کالاهای موجود" /></div>
        <div className="flex min-h-11 items-center justify-between"><span className="text-sm font-semibold">فقط تخفیف‌دار</span><Switch checked={query.deals ?? false} onCheckedChange={(deals) => update({ deals: deals || undefined })} label="فقط تخفیف‌دار" /></div>
        <div className="flex min-h-11 items-center justify-between"><span className="text-sm font-semibold">محصولات ویژه</span><Switch checked={query.featured ?? false} onCheckedChange={(featured) => update({ featured: featured || undefined })} label="فقط محصولات ویژه فروشگاه" /></div>
        <div className="flex min-h-11 items-center justify-between"><span className="text-sm font-semibold">انتخاب سردبیر</span><Switch checked={query.editorChoice ?? false} onCheckedChange={(editorChoice) => update({ editorChoice: editorChoice || undefined })} label="فقط محصولات منتخب سردبیر" /></div>
      </div>
    </search>
  );
}

/** Removable summary of the currently active filter state. */
function ActiveChips({ categories, query, update, lockedCategory }: Pick<FilterPanelProps, 'categories' | 'query' | 'update' | 'lockedCategory'>) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" aria-label="فیلترهای فعال">
      {!lockedCategory && query.category && <Chip label={categories.find((category) => category.id === query.category)?.name ?? query.category} onRemove={() => update({ category: undefined })} />}
      {query.search && <Chip label={`جستجو: ${query.search}`} onRemove={() => update({ search: undefined })} />}
      {query.brands?.map((brand) => <Chip key={brand} label={brand} onRemove={() => update({ brands: query.brands?.filter((item) => item !== brand) })} />)}
      {(query.minPrice !== undefined || query.maxPrice !== undefined) && <Chip label="بازه قیمت" onRemove={() => update({ minPrice: undefined, maxPrice: undefined })} />}
      {query.minRating !== undefined && <Chip label={`امتیاز ${toPersianDigits(query.minRating)}+`} onRemove={() => update({ minRating: undefined })} />}
      {query.minDiscount !== undefined && <Chip label={`تخفیف ${toPersianDigits(query.minDiscount)}٪+`} onRemove={() => update({ minDiscount: undefined })} />}
      {query.minReviews !== undefined && <Chip label={`${toPersianDigits(query.minReviews)} نظر و بیشتر`} onRemove={() => update({ minReviews: undefined })} />}
      {query.inStock && <Chip label="فقط موجود" onRemove={() => update({ inStock: undefined })} />}
      {query.deals && <Chip label="فقط تخفیف‌دار" onRemove={() => update({ deals: undefined })} />}
      {query.featured && <Chip label="محصولات ویژه" onRemove={() => update({ featured: undefined })} />}
      {query.editorChoice && <Chip label="انتخاب سردبیر" onRemove={() => update({ editorChoice: undefined })} />}
      {query.features?.map((feature) => <Chip key={feature} label={feature} onRemove={() => update({ features: query.features?.filter((item) => item !== feature) })} />)}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <Badge variant="outline" className="gap-1 py-1.5">{label}<button type="button" onClick={onRemove} className="-m-2 flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-muted" aria-label={`حذف فیلتر ${label}`}><X className="size-3" aria-hidden="true" /></button></Badge>;
}

function ProductSkeletons() {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" aria-label="در حال بارگذاری محصولات">{Array.from({ length: 8 }, (_, index) => <div key={index} className="rounded-2xl border border-border p-3"><Skeleton className="aspect-square w-full rounded-xl" /><Skeleton className="mt-4 h-4 w-2/3" /><Skeleton className="mt-3 h-4 w-1/3" /><Skeleton className="mt-4 h-10 w-full" /></div>)}</div>;
}
