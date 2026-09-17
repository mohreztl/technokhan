'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Loader2,
  Package,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react';
import {
  ROUTES,
  effectivePrice,
  formatToman,
  toPersianDigits,
  type Product,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useCatalogSearch, useSearchState, type SearchResult } from '@/lib/hooks/use-search';
import { useUIStore } from '@/lib/store/ui-store';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { useBodyScrollLock } from '@/lib/hooks/use-body-scroll-lock';
import { useFocusTrap } from '@/components/ui/bottom-sheet';
import { IconButton } from '@/components/ui/icon-button';
import { Button } from '@/components/ui/button';
import { springSheet } from '@/lib/animation-variants';

const POPULAR_SEARCHES = [
  'سرامیک کوتینگ',
  'واکس خودرو',
  'دیتیلینگ',
  'PPF',
  'شامپو خودرو',
  'پولیش',
  'میکروفایبر',
];

const QUICK_LINKS = [
  { title: 'خدمات', href: ROUTES.SERVICES, icon: Wrench },
  { title: 'محصولات', href: ROUTES.PRODUCTS, icon: Package },
  { title: 'رزرو آنلاین', href: ROUTES.BOOKING, icon: Sparkles },
  { title: 'نمونه کارها', href: ROUTES.GALLERY, icon: Star },
];

const resultHref = (r: SearchResult) =>
  r.type === 'product' ? `${ROUTES.PRODUCTS}/${r.item.id}` : `${ROUTES.SERVICES}/${r.item.id}`;

const searchHref = (q: string) => `${ROUTES.PRODUCTS}?search=${encodeURIComponent(q.trim())}`;

/**
 * Global search: full-screen sheet on mobile, centered command palette on
 * desktop. Open state lives in `useUIStore.searchOpen` (navbar, Ctrl/Cmd+K).
 */
export const SearchModal: React.FC = () => {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = React.useId();

  const {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useSearchState();

  const { search } = useCatalogSearch(10);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [open, setQuery]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setResults(search(query));
      setActiveIndex(-1);
      setIsSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, search, setIsSearching]);

  const go = useCallback(
    (href: string, term?: string) => {
      if (term) addRecentSearch(term);
      close();
      router.push(href);
    },
    [addRecentSearch, close, router]
  );

  const submit = useCallback(() => {
    if (!query.trim()) return;
    go(searchHref(query), query);
  }, [query, go]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (results.length === 0) return;
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      const next = (activeIndex + delta + results.length) % results.length;
      setActiveIndex(next);
      const el = listRef.current?.children[next] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        const r = results[activeIndex];
        go(resultHref(r), query);
      } else {
        submit();
      }
    }
  };

  const activeId = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;
  const hasQuery = query.trim().length > 0;

  const panelClass = useMemo(
    () =>
      isMobile
        ? 'fixed inset-0 flex flex-col bg-background pt-safe'
        : 'fixed left-1/2 top-[8vh] flex max-h-[80vh] w-[min(95vw,42rem)] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-luxury',
    [isMobile]
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" dir="rtl">
          {!isMobile && (
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              aria-hidden="true"
            />
          )}

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="جستجو در محصولات و خدمات"
            tabIndex={-1}
            className={cn(panelClass, 'outline-none')}
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: -16, scale: 0.98 }}
            transition={springSheet}
          >
            {/* Input row */}
            <div className="flex shrink-0 items-center gap-2 border-b border-border/40 px-3 py-3 sm:px-4">
              <IconButton label="بستن جستجو" icon={<X />} onClick={close} />
              <div className="relative flex-1">
                <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                  ) : (
                    <Search className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <input
                  ref={inputRef}
                  data-autofocus
                  type="search" data-native-clear="off"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="جستجوی محصولات و خدمات..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls={listboxId}
                  aria-activedescendant={activeId}
                  aria-autocomplete="list"
                  className="h-12 w-full rounded-xl border-0 bg-muted ps-11 pe-10 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {hasQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="absolute end-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="پاک کردن جستجو"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-safe sm:px-5">
              {hasQuery ? (
                <div className="space-y-4">
                  {isSearching && results.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                      در حال جستجو...
                    </div>
                  ) : results.length > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground" aria-live="polite">
                        {toPersianDigits(results.length)} نتیجه برای «{query}»
                      </p>
                      <ul
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        aria-label="نتایج جستجو"
                        className="space-y-2"
                      >
                        {results.map((result, index) => {
                          const isProduct = result.type === 'product';
                          const price = isProduct
                            ? effectivePrice(result.item as Product)
                            : result.item.price;
                          const active = index === activeIndex;
                          return (
                            <li
                              key={`${result.type}-${result.item.id}`}
                              id={`${listboxId}-opt-${index}`}
                              role="option"
                              aria-selected={active}
                            >
                              <Link
                                href={resultHref(result)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  go(resultHref(result), query);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                                tabIndex={-1}
                                className={cn(
                                  'group flex min-h-[4rem] items-center gap-3 rounded-xl p-2 transition-colors',
                                  active ? 'bg-primary/10' : 'bg-muted/40 hover:bg-muted'
                                )}
                              >
                                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                  {result.item.images[0] ? (
                                    <Image
                                      src={result.item.images[0]}
                                      alt=""
                                      fill
                                      sizes="56px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                                      {isProduct ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                                    </span>
                                  )}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="mb-0.5 flex items-center gap-2">
                                    <span className="rounded-full bg-secondary/20 px-2 py-px text-[10px] font-bold text-foreground">
                                      {isProduct ? 'محصول' : 'خدمت'}
                                    </span>
                                    {result.item.rating ? (
                                      <span className="flex items-center gap-0.5 text-[11px] text-secondary">
                                        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                                        {toPersianDigits(result.item.rating)}
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="block truncate text-sm font-bold text-foreground group-hover:text-primary">
                                    {result.item.name}
                                  </span>
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {result.item.shortDescription ?? result.item.description}
                                  </span>
                                </span>
                                <span className="shrink-0 text-end text-xs font-bold text-primary dark:text-secondary tabular-nums">
                                  {!isProduct && (
                                    <span className="block text-[10px] font-normal text-muted-foreground">
                                      شروع از
                                    </span>
                                  )}
                                  {formatToman(price)}
                                </span>
                                <ArrowLeft
                                  className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                                  aria-hidden="true"
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                      <Button variant="outline" className="h-12 w-full gap-2" onClick={submit}>
                        مشاهده همه نتایج
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
                      <p className="mb-1 text-base font-medium text-foreground">نتیجه‌ای یافت نشد</p>
                      <p className="mb-5 text-sm text-muted-foreground">
                        برای «{query}» هیچ محصول یا خدمتی پیدا نشد.
                      </p>
                      <Button variant="outline" className="h-11" onClick={submit}>
                        جستجو در فروشگاه
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {recentSearches.length > 0 && (
                    <section aria-labelledby={`${listboxId}-recent`}>
                      <div className="mb-3 flex items-center justify-between">
                        <h3
                          id={`${listboxId}-recent`}
                          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                        >
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          جستجوهای اخیر
                        </h3>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="min-h-[44px] px-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                          پاک کردن همه
                        </button>
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <li
                            key={term}
                            className="flex h-11 items-center rounded-full border border-border/50 bg-muted/40 ps-3 pe-1"
                          >
                            <button
                              type="button"
                              onClick={() => setQuery(term)}
                              className="max-w-[10rem] truncate text-sm text-foreground"
                            >
                              {term}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRecentSearch(term)}
                              className="ms-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
                              aria-label={`حذف «${term}» از جستجوهای اخیر`}
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section aria-labelledby={`${listboxId}-popular`}>
                    <h3
                      id={`${listboxId}-popular`}
                      className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                    >
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                      جستجوهای محبوب
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => setQuery(term)}
                            className="flex h-11 items-center rounded-full border border-border/50 px-4 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10"
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-labelledby={`${listboxId}-quick`}>
                    <h3
                      id={`${listboxId}-quick`}
                      className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      دسترسی سریع
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {QUICK_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={close}
                              className="group flex min-h-[3.25rem] items-center gap-3 rounded-xl bg-muted/50 px-3 py-2 transition-colors hover:bg-muted"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-secondary">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary">
                                {link.title}
                              </span>
                              <ArrowLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </div>
              )}
            </div>

            {!isMobile && (
              <div className="flex shrink-0 items-center justify-between border-t border-border/40 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd> انتخاب
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↑↓</kbd> پیمایش
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Esc</kbd> بستن
                  </span>
                </div>
                <span>جستجوی هوشمند فارسی</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchModal;
