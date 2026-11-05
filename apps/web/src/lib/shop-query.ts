import type { ProductListQuery } from '@technokhan/shared';

export type ShopSearchParams = Record<string, string | string[] | undefined>;

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
    sortBy: !sort || sort === 'popular' ? 'popular' : sort === 'newest' ? 'newest' : sort === 'rating' ? 'rating' : 'price',
    sortOrder: !sort ? 'desc' : sort === 'priceDesc' ? 'desc' : sort === 'priceAsc' ? 'asc' : 'desc',
    page: positiveNumber(first(params.page), 1),
    limit: 12,
  };
}
