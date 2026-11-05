import { toEnglishDigits, type ProductListQuery } from '@technokhan/shared';

/** `searchParams` as delivered to a page, or a `URLSearchParams` on the client. */
export type SearchParamsInput = Record<string, string | string[] | undefined> | URLSearchParams;

export const PRODUCT_PAGE_SIZE = 12;

export type ProductSortId = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export interface ProductSortOption {
  id: ProductSortId;
  label: string;
  sortBy: NonNullable<ProductListQuery['sortBy']>;
  sortOrder: NonNullable<ProductListQuery['sortOrder']>;
}

export const PRODUCT_SORT_OPTIONS: ProductSortOption[] = [
  { id: 'newest', label: 'جدیدترین', sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'rating', label: 'محبوب‌ترین', sortBy: 'rating', sortOrder: 'desc' },
  { id: 'price-asc', label: 'ارزان‌ترین', sortBy: 'price', sortOrder: 'asc' },
  { id: 'price-desc', label: 'گران‌ترین', sortBy: 'price', sortOrder: 'desc' },
  { id: 'name', label: 'بر اساس نام', sortBy: 'name', sortOrder: 'asc' },
];

/** Keys of `ProductListQuery` that are exposed as filters/params in the URL. */
export type ProductFilterKey =
  | 'category'
  | 'brand'
  | 'minPrice'
  | 'maxPrice'
  | 'inStock'
  | 'search'
  | 'sort';

const SORT_BY = new Set(['createdAt', 'price', 'rating', 'name']);

function read(input: SearchParamsInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const raw = input[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function readNumber(input: SearchParamsInput, key: string): number | undefined {
  const raw = read(input, key);
  if (raw === undefined || raw === '') return undefined;
  const n = Number(toEnglishDigits(raw));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

/**
 * Parses URL search params into a `ProductListQuery`. Only defined keys are
 * set so the object is structurally identical on server and client (React
 * Query keys depend on it).
 */
export function parseProductQuery(input: SearchParamsInput): ProductListQuery {
  const q: ProductListQuery = { limit: PRODUCT_PAGE_SIZE };

  const category = read(input, 'category');
  if (category) q.category = category;

  const brand = read(input, 'brand');
  if (brand) q.brand = brand;

  const search = read(input, 'search')?.trim();
  if (search) q.search = search;

  const minPrice = readNumber(input, 'minPrice');
  if (minPrice !== undefined) q.minPrice = minPrice;

  const maxPrice = readNumber(input, 'maxPrice');
  if (maxPrice !== undefined && (minPrice === undefined || maxPrice >= minPrice)) {
    q.maxPrice = maxPrice;
  }

  const inStock = read(input, 'inStock');
  if (inStock === 'true' || inStock === '1') q.inStock = true;

  const sortBy = read(input, 'sortBy');
  if (sortBy && SORT_BY.has(sortBy)) q.sortBy = sortBy as ProductListQuery['sortBy'];

  const sortOrder = read(input, 'sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') q.sortOrder = sortOrder;

  const page = readNumber(input, 'page');
  if (page && page > 1) q.page = page;

  return q;
}

/** Serialises a query back to URL params (page 1 and the fixed limit are omitted). */
export function productQueryToParams(q: ProductListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (q.category) params.set('category', q.category);
  if (q.brand) params.set('brand', q.brand);
  if (q.search) params.set('search', q.search);
  if (q.minPrice !== undefined) params.set('minPrice', String(q.minPrice));
  if (q.maxPrice !== undefined) params.set('maxPrice', String(q.maxPrice));
  if (q.inStock) params.set('inStock', 'true');
  if (q.sortBy) params.set('sortBy', q.sortBy);
  if (q.sortOrder) params.set('sortOrder', q.sortOrder);
  if (q.page && q.page > 1) params.set('page', String(q.page));
  return params;
}

export function productQueryHref(pathname: string, q: ProductListQuery): string {
  const s = productQueryToParams(q).toString();
  return s ? `${pathname}?${s}` : pathname;
}

export function sortIdOf(q: ProductListQuery): ProductSortId {
  const match = PRODUCT_SORT_OPTIONS.find(
    (o) => o.sortBy === (q.sortBy ?? 'createdAt') && o.sortOrder === (q.sortOrder ?? 'desc')
  );
  return match?.id ?? 'newest';
}

export function applySort(q: ProductListQuery, id: ProductSortId): ProductListQuery {
  const option = PRODUCT_SORT_OPTIONS.find((o) => o.id === id) ?? PRODUCT_SORT_OPTIONS[0];
  const next: ProductListQuery = { ...q };
  delete next.page;
  if (option.id === 'newest') {
    delete next.sortBy;
    delete next.sortOrder;
  } else {
    next.sortBy = option.sortBy;
    next.sortOrder = option.sortOrder;
  }
  return next;
}

/** Number of "panel" filters in effect (search and sort are shown elsewhere). */
export function countActiveFilters(q: ProductListQuery): number {
  let n = 0;
  if (q.category) n += 1;
  if (q.brand) n += 1;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) n += 1;
  if (q.inStock) n += 1;
  return n;
}

/** Drops every filter (and the search) but keeps the chosen sort. */
export function clearFilters(q: ProductListQuery): ProductListQuery {
  const next: ProductListQuery = { limit: q.limit ?? PRODUCT_PAGE_SIZE };
  if (q.sortBy) next.sortBy = q.sortBy;
  if (q.sortOrder) next.sortOrder = q.sortOrder;
  return next;
}

export function removeFilter(q: ProductListQuery, key: ProductFilterKey): ProductListQuery {
  const next: ProductListQuery = { ...q };
  delete next.page;
  switch (key) {
    case 'minPrice':
    case 'maxPrice':
      delete next.minPrice;
      delete next.maxPrice;
      break;
    case 'sort':
      delete next.sortBy;
      delete next.sortOrder;
      break;
    default:
      delete next[key];
  }
  return next;
}

function stableKey(q: ProductListQuery): string {
  return JSON.stringify(
    Object.keys(q)
      .sort()
      .map((k) => [k, (q as Record<string, unknown>)[k]])
  );
}

export function isSameProductQuery(a: ProductListQuery, b: ProductListQuery): boolean {
  return stableKey(a) === stableKey(b);
}
