import type { ProductListQuery } from '@technokhan/shared';

export type ShopSearchParams = Record<string, string | string[] | undefined>;

export const SHOP_PRICE_LIMIT = 100_000_000;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined, fallback?: number): number | undefined {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Parses and sanitizes every public shop filter without trusting URL input. */
export function parseShopQuery(params: ShopSearchParams): ProductListQuery {
  const brandsValue = first(params.brands);
  const sort = first(params.sort);
  return {
    category: first(params.category) || undefined,
    search: first(params.search)?.trim() || undefined,
    brands: brandsValue ? brandsValue.split(',').map((brand) => brand.trim()).filter(Boolean) : undefined,
    features: first(params.features)?.split(',').filter(Boolean),
    minPrice: positiveNumber(first(params.minPrice)),
    maxPrice: positiveNumber(first(params.maxPrice)),
    inStock: first(params.inStock) === 'true' ? true : undefined,
    deals: first(params.deals) === 'true' ? true : undefined,
    sortBy: !sort || sort === 'popular' ? 'popular' : sort === 'newest' ? 'newest' : sort === 'rating' ? 'rating' : 'price',
    sortOrder: !sort ? 'desc' : sort === 'priceDesc' ? 'desc' : sort === 'priceAsc' ? 'asc' : 'desc',
    page: positiveNumber(first(params.page), 1),
    limit: 12,
  };
}

/** Serializes active filters into the same public query format parseShopQuery reads. */
export function shopQueryToSearchParams(query: ProductListQuery, options: { skipCategory?: boolean } = {}): string {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (!options.skipCategory && query.category) params.set('category', query.category);
  if (query.brands?.length) params.set('brands', query.brands.join(','));
  if (query.features?.length) params.set('features', query.features.join(','));
  if (query.minPrice) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice && query.maxPrice < SHOP_PRICE_LIMIT) params.set('maxPrice', String(query.maxPrice));
  if (query.inStock) params.set('inStock', 'true');
  if (query.deals) params.set('deals', 'true');
  if (query.sortBy === 'price') params.set('sort', query.sortOrder === 'asc' ? 'priceAsc' : 'priceDesc');
  else if (query.sortBy && query.sortBy !== 'popular') params.set('sort', query.sortBy);
  if ((query.page ?? 1) > 1) params.set('page', String(query.page));
  const search = params.toString();
  return search ? `?${search}` : '';
}
