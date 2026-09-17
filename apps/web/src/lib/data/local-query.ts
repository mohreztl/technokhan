import type {
  GalleryItem,
  PagedList,
  Pagination,
  Product,
  ProductListQuery,
  Service,
  ServiceListQuery,
} from '@autolounge/shared';
import { PRODUCTS, SERVICES, GALLERY, effectivePrice } from '@autolounge/shared';

/**
 * Local (demo-mode) implementation of the catalog list endpoints.
 * Mirrors the API's filtering, sorting and pagination so the same query
 * params work whether the data came from the API or from the bundle.
 */

function paginate<T>(items: T[], page = 1, limit = 12): PagedList<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * limit;
  const pagination: Pagination = {
    total,
    page: p,
    limit,
    totalPages,
    hasNext: p < totalPages,
    hasPrev: p > 1,
  };
  return { items: items.slice(start, start + limit), pagination };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‏‎]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matches(haystack: string[], needle?: string): boolean {
  if (!needle) return true;
  const n = normalize(needle);
  const terms = n.split(' ').filter(Boolean);
  const hay = normalize(haystack.filter(Boolean).join(' '));
  return terms.every((t) => hay.includes(t));
}

function sortItems<T extends { createdAt: unknown; rating?: number; name: string }>(
  items: T[],
  price: (t: T) => number,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  const dir = sortOrder === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (price(a) - price(b)) * dir;
      case 'rating':
        return ((a.rating ?? 0) - (b.rating ?? 0)) * dir;
      case 'name':
        return a.name.localeCompare(b.name, 'fa') * dir;
      default:
        return (
          (new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime()) *
          dir
        );
    }
  });
}

export function queryLocalProducts(q: ProductListQuery = {}): PagedList<Product> {
  let items = PRODUCTS.filter((p) => p.isActive !== false);
  if (q.category) items = items.filter((p) => p.category === q.category);
  if (q.brand) items = items.filter((p) => p.brand === q.brand);
  if (q.featured !== undefined) items = items.filter((p) => p.featured === q.featured);
  if (q.inStock) items = items.filter((p) => p.stock > 0);
  if (q.minPrice !== undefined) items = items.filter((p) => effectivePrice(p) >= q.minPrice!);
  if (q.maxPrice !== undefined) items = items.filter((p) => effectivePrice(p) <= q.maxPrice!);
  if (q.search) {
    items = items.filter((p) =>
      matches([p.name, p.nameEn, p.brand ?? '', p.description, ...(p.tags ?? [])], q.search)
    );
  }
  items = sortItems(items, effectivePrice, q.sortBy, q.sortOrder);
  return paginate(items, q.page, q.limit);
}

export function queryLocalServices(q: ServiceListQuery = {}): PagedList<Service> {
  let items = SERVICES.filter((s) => s.isActive !== false);
  if (q.type) items = items.filter((s) => s.type === q.type);
  if (q.featured !== undefined) items = items.filter((s) => s.featured === q.featured);
  if (q.search) {
    items = items.filter((s) =>
      matches([s.name, s.nameEn, s.description, ...(s.tags ?? [])], q.search)
    );
  }
  items = sortItems(items, (s) => s.price, q.sortBy, q.sortOrder);
  return paginate(items, q.page, q.limit);
}

export function findLocalProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function findLocalService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function relatedLocalProducts(id: string, limit = 4): Product[] {
  const base = findLocalProduct(id);
  if (!base) return [];
  const same = PRODUCTS.filter((p) => p.id !== id && p.category === base.category);
  const others = PRODUCTS.filter((p) => p.id !== id && p.category !== base.category);
  return [...same, ...others].slice(0, limit);
}

export function relatedLocalServices(id: string, limit = 3): Service[] {
  const base = findLocalService(id);
  if (!base) return [];
  const same = SERVICES.filter((s) => s.id !== id && s.type === base.type);
  const others = SERVICES.filter((s) => s.id !== id && s.type !== base.type);
  return [...same, ...others].slice(0, limit);
}

export function localGallery(serviceType?: string): GalleryItem[] {
  return serviceType ? GALLERY.filter((g) => g.serviceType === serviceType) : GALLERY;
}

export const localProductBrands = (): string[] =>
  Array.from(new Set(PRODUCTS.map((p) => p.brand).filter((b): b is string => !!b))).sort();

export const localPriceBounds = (): { min: number; max: number } => {
  const prices = PRODUCTS.map(effectivePrice);
  return prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : { min: 0, max: 0 };
};
