'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, PackageOpen, RefreshCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  ROUTES,
  toPersianDigits,
  type PagedList,
  type Product,
  type ProductListQuery,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useProducts } from '@/lib/hooks/use-products';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { ProductCard } from '@/components/molecules/product-card';
import { ActiveFilters } from '@/components/molecules/active-filters';
import { ProductCardSkeleton } from '@/components/molecules/loading-skeletons';
import { ProductFiltersPanel, SortOptions, type PriceBounds } from '@/components/organisms/product-filters';
import {
  PRODUCT_SORT_OPTIONS,
  applySort,
  clearFilters,
  countActiveFilters,
  isSameProductQuery,
  parseProductQuery,
  productQueryHref,
  removeFilter,
  sortIdOf,
  type ProductFilterKey,
  type ProductSortId,
} from './product-query';

export interface ProductListProps {
  /** Query the server rendered with (used to seed React Query). */
  initialQuery: ProductListQuery;
  initialData: PagedList<Product>;
  categories: Record<string, string>;
  brands: string[];
  priceBounds: PriceBounds;
  /** Page heading (varies by category/search). */
  title: string;
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Products catalogue. The URL is the single source of truth: every control
 * calls `router.replace` and the list re-queries from `useSearchParams`.
 */
export function ProductList({
  initialQuery,
  initialData,
  categories,
  brands,
  priceBounds,
  title,
}: ProductListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const query = React.useMemo(() => parseProductQuery(searchParams), [searchParams]);
  const seed = isSameProductQuery(query, initialQuery) ? initialData : undefined;

  const { products, pagination, total, pages, isFetching, isPlaceholderData, isError, refetch } =
    useProducts(query, { initialData: seed });

  const navigate = React.useCallback(
    (next: ProductListQuery) => {
      router.replace(productQueryHref(pathname, next), { scroll: false });
    },
    [router, pathname]
  );

  /* ---------------------------------------------------------------- search */
  const [searchText, setSearchText] = React.useState(query.search ?? '');
  React.useEffect(() => {
    setSearchText(query.search ?? '');
  }, [query.search]);

  React.useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === (query.search ?? '')) return;
    const timer = window.setTimeout(() => {
      const next: ProductListQuery = { ...query };
      delete next.page;
      if (trimmed) next.search = trimmed;
      else delete next.search;
      navigate(next);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchText, query, navigate]);

  /* --------------------------------------------------------- mobile sheets */
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ProductListQuery>(query);
  const [sortOpen, setSortOpen] = React.useState(false);

  const openFilters = () => {
    setDraft(query);
    setFiltersOpen(true);
  };
  const applyDraft = () => {
    navigate(draft);
    setFiltersOpen(false);
  };
  const chooseSort = (id: ProductSortId) => {
    navigate(applySort(query, id));
    setSortOpen(false);
  };

  /* ------------------------------------------------------------ pagination */
  const gridRef = React.useRef<HTMLDivElement>(null);
  const currentPage = pagination?.page ?? query.page ?? 1;
  const goToPage = (page: number) => {
    navigate({ ...query, page });
    gridRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const activeCount = countActiveFilters(query);
  const sortId = sortIdOf(query);
  const sortLabel = PRODUCT_SORT_OPTIONS.find((o) => o.id === sortId)?.label ?? '';
  const showEmpty = !isFetching && !isError && products.length === 0;
  const showError = isError && products.length === 0;

  return (
    <div className="container-custom pb-12 pt-4 lg:pb-20 lg:pt-8">
      {/* Header */}
      <header className="mb-4 lg:mb-8">
        <Breadcrumb
          items={[
            { label: 'خانه', href: ROUTES.HOME },
            { label: 'فروشگاه', href: ROUTES.PRODUCTS },
            ...(query.category
              ? [{ label: categories[query.category] ?? query.category }]
              : []),
          ]}
        />
        <p className="mt-2 text-xs font-bold tracking-[0.2em] text-secondary">فروشگاه اتولانژ</p>
        <h1 className="mt-1 text-balance text-2xl font-black text-foreground sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          محصولات اورجینال دیتیلینگ با ضمانت اصالت؛ همان‌هایی که تیم اتولانژ در سالن استفاده می‌کند.
        </p>
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0" aria-label="فیلترها">
          <div className="sticky top-[calc(6rem+env(safe-area-inset-top))] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5">
            <ProductFiltersPanel
              value={query}
              onChange={navigate}
              categories={categories}
              brands={brands}
              priceBounds={priceBounds}
              showSort
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Search */}
          <div className="mb-3">
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="جستجوی محصول، برند یا ویژگی…"
              aria-label="جستجوی محصولات"
              startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              endIcon={
                searchText ? (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    aria-label="پاک کردن جستجو"
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : undefined
              }
              className="min-h-12 rounded-xl"
            />
          </div>

          {/* Mobile toolbar */}
          <div className="sticky top-[calc(5rem+env(safe-area-inset-top))] z-30 -mx-4 mb-3 border-b border-border/70 bg-background/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={activeCount > 0 ? 'primary' : 'outline'}
                onClick={openFilters}
                className="min-h-11 gap-2 px-3.5"
                aria-haspopup="dialog"
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                فیلترها
                {activeCount > 0 && (
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[11px] font-bold leading-none text-primary">
                    {toPersianDigits(activeCount)}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSortOpen(true)}
                className="min-h-11 gap-2 px-3.5"
                aria-haspopup="dialog"
                aria-expanded={sortOpen}
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{sortLabel}</span>
              </Button>
              <p className="ms-auto shrink-0 text-xs font-semibold text-muted-foreground tabular-nums" aria-live="polite">
                {toPersianDigits(total)} محصول
              </p>
            </div>
          </div>

          {/* Desktop toolbar */}
          <div className="mb-4 hidden items-center justify-between gap-4 lg:flex">
            <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {toPersianDigits(total)} محصول
              {pages > 1 ? ` · صفحهٔ ${toPersianDigits(currentPage)} از ${toPersianDigits(pages)}` : null}
            </p>
            <Select
              aria-label="مرتب‌سازی"
              value={sortId}
              onChange={(e) => navigate(applySort(query, e.target.value as ProductSortId))}
              options={PRODUCT_SORT_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              containerClassName="w-48"
            />
          </div>

          <ActiveFilters
            filters={query}
            categoryLabels={categories}
            priceBounds={priceBounds}
            onRemove={(key: ProductFilterKey) => navigate(removeFilter(query, key))}
            onClearAll={() => navigate(clearFilters(query))}
            className="mb-4"
          />

          {/* Results */}
          <div ref={gridRef} className="relative scroll-mt-[calc(9rem+env(safe-area-inset-top))]">
            <AnimatePresence>
              {isFetching && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-x-0 -top-2 z-10 h-0.5 overflow-hidden rounded-full bg-secondary/20"
                  role="progressbar"
                  aria-label="در حال به‌روزرسانی نتایج"
                >
                  <span className="block h-full w-1/3 animate-pulse bg-secondary/70" />
                </motion.div>
              )}
            </AnimatePresence>

            {showError ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="text-base font-bold text-foreground">خطا در دریافت محصولات</p>
                <p className="mt-1 text-sm text-muted-foreground">اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.</p>
                <Button type="button" variant="outline" onClick={() => refetch()} className="mt-4 min-h-11 gap-2">
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  تلاش مجدد
                </Button>
              </div>
            ) : showEmpty ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <PackageOpen className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                </span>
                <p className="mt-4 text-base font-bold text-foreground">محصولی با این مشخصات پیدا نشد</p>
                <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
                  عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید.
                </p>
                <Button type="button" variant="primary" onClick={() => navigate(clearFilters(query))} className="mt-5 min-h-11">
                  پاک کردن فیلترها
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'grid grid-cols-2 gap-3 transition-opacity duration-300 sm:gap-4 md:grid-cols-3 xl:grid-cols-4',
                  isPlaceholderData && 'pointer-events-none opacity-60'
                )}
                aria-busy={isFetching}
              >
                {products.length === 0 && isFetching ? (
                  <ProductCardSkeleton count={8} />
                ) : (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} className="h-full" />
                  ))
                )}
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={pages}
            onPageChange={goToPage}
            hrefFor={(page) => productQueryHref(pathname, { ...query, page })}
            className="mt-8 lg:mt-12"
          />
        </div>
      </div>

      {/* Mobile filters sheet */}
      <ResponsiveDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="فیلتر محصولات"
        snapPoints={[0.92]}
        desktopClassName="max-w-lg"
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDraft(clearFilters(draft))}
              className="min-h-12"
            >
              پاک کردن
            </Button>
            <Button type="button" variant="primary" onClick={applyDraft} className="min-h-12 flex-1">
              اعمال فیلتر
            </Button>
          </div>
        }
      >
        <ProductFiltersPanel
          value={draft}
          onChange={setDraft}
          categories={categories}
          brands={brands}
          priceBounds={priceBounds}
        />
      </ResponsiveDialog>

      {/* Mobile sort sheet */}
      <ResponsiveDialog
        open={sortOpen}
        onOpenChange={setSortOpen}
        title="مرتب‌سازی بر اساس"
        snapPoints={[0.55]}
        desktopClassName="max-w-sm"
      >
        <SortOptions value={sortId} onChange={chooseSort} />
      </ResponsiveDialog>
    </div>
  );
}
