import type { PagedList, Pagination, Product, ProductListQuery } from '@technokhan/shared';
import { PRODUCTS, effectivePrice, filterProducts, matchesSearchText } from '@technokhan/shared';

export { filterProducts } from '@technokhan/shared';

function paginate<T>(items: T[], page = 1, limit = 12): PagedList<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * limit;
  const pagination: Pagination = { total, page: current, limit, totalPages, hasNext: current < totalPages, hasPrev: current > 1 };
  return { items: items.slice(start, start + limit), pagination };
}

/** Local equivalent of the Fastify list endpoint, including pagination. */
export function queryLocalProducts(q: ProductListQuery = {}, source: Product[] = PRODUCTS): PagedList<Product> {
  return paginate(filterProducts(source, q), q.page, q.limit);
}

export function findLocalProduct(id: string, source: Product[] = PRODUCTS): Product | undefined {
  return source.find((product) => product.id === id);
}

export function relatedLocalProducts(id: string, limit = 4, source: Product[] = PRODUCTS): Product[] {
  const base = findLocalProduct(id, source);
  if (!base) return [];
  const same = source.filter((product) => product.id !== id && product.category === base.category);
  const others = source.filter((product) => product.id !== id && product.category !== base.category);
  return [...same, ...others].slice(0, limit);
}

export const localProductBrands = (): string[] => Array.from(new Set(PRODUCTS.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)))).sort();

export const localPriceBounds = (): { min: number; max: number } => {
  const prices = PRODUCTS.map(effectivePrice);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
};
