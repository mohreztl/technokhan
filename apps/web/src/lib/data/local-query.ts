import type { GalleryItem, PagedList, Pagination, Product, ProductListQuery, Service, ServiceListQuery } from '@autolounge/shared';
import { PRODUCTS, SERVICES, GALLERY, effectivePrice } from '@autolounge/shared';

function paginate<T>(items: T[], page = 1, limit = 12): PagedList<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * limit;
  const pagination: Pagination = { total, page: current, limit, totalPages, hasNext: current < totalPages, hasPrev: current > 1 };
  return { items: items.slice(start, start + limit), pagination };
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[‌‏‎]/g, ' ').replace(/\s+/g, ' ').trim();
}

function matches(haystack: string[], needle?: string): boolean {
  if (!needle) return true;
  const terms = normalize(needle).split(' ').filter(Boolean);
  const hay = normalize(haystack.filter(Boolean).join(' '));
  return terms.every((term) => hay.includes(term));
}

function sortItems<T extends { createdAt: unknown; rating?: number; name: string; salesCount?: number }>(items: T[], price: (item: T) => number, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): T[] {
  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price': return (price(a) - price(b)) * direction;
      case 'rating': return ((a.rating ?? 0) - (b.rating ?? 0)) * direction;
      case 'name': return a.name.localeCompare(b.name, 'fa') * direction;
      case 'popular': return ((a.salesCount ?? 0) - (b.salesCount ?? 0)) * direction;
      default: return (new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime()) * direction;
    }
  });
}

/** Applies the complete storefront query to bundled products without I/O. */
export function filterProducts(source: Product[], q: ProductListQuery = {}): Product[] {
  let items = source.filter((product) => product.isActive !== false);
  if (q.category) items = items.filter((product) => product.category === q.category);
  if (q.brands?.length) {
    const brands = q.brands.map((brand) => brand.toLowerCase());
    items = items.filter((product) => product.brand && brands.includes(product.brand.toLowerCase()));
  } else if (q.brand) {
    items = items.filter((product) => product.brand?.toLowerCase() === q.brand?.toLowerCase());
  }
  if (q.features?.length) {
    items = items.filter((product) => q.features!.every((feature) => matches([...(product.features ?? []), ...(product.tags ?? [])], feature)));
  }
  if (q.featured !== undefined) items = items.filter((product) => product.featured === q.featured);
  if (q.inStock) items = items.filter((product) => product.stock > 0);
  if (q.minPrice !== undefined) items = items.filter((product) => effectivePrice(product) >= q.minPrice!);
  if (q.maxPrice !== undefined) items = items.filter((product) => effectivePrice(product) <= q.maxPrice!);
  if (q.search) {
    items = items.filter((product) => matches([
      product.name,
      product.nameEn,
      product.brand ?? '',
      product.shortDescription ?? '',
      product.description,
      ...(product.tags ?? []),
      ...(product.features ?? []),
      ...(product.specifications ?? []).flatMap((specification) => [specification.label, specification.value]),
    ], q.search));
  }
  return sortItems(items, effectivePrice, q.sortBy, q.sortOrder);
}

/** Local equivalent of the Fastify list endpoint, including pagination. */
export function queryLocalProducts(q: ProductListQuery = {}, source: Product[] = PRODUCTS): PagedList<Product> {
  return paginate(filterProducts(source, q), q.page, q.limit);
}

export function queryLocalServices(q: ServiceListQuery = {}, source: Service[] = SERVICES): PagedList<Service> {
  let items = source.filter((service) => service.isActive !== false);
  if (q.type) items = items.filter((service) => service.type === q.type);
  if (q.featured !== undefined) items = items.filter((service) => service.featured === q.featured);
  if (q.search) items = items.filter((service) => matches([service.name, service.nameEn, service.description, ...(service.tags ?? [])], q.search));
  items = sortItems(items, (service) => service.price, q.sortBy, q.sortOrder);
  return paginate(items, q.page, q.limit);
}

export function findLocalProduct(id: string, source: Product[] = PRODUCTS): Product | undefined {
  return source.find((product) => product.id === id);
}

export function findLocalService(id: string, source: Service[] = SERVICES): Service | undefined {
  return source.find((service) => service.id === id);
}

export function relatedLocalProducts(id: string, limit = 4, source: Product[] = PRODUCTS): Product[] {
  const base = findLocalProduct(id, source);
  if (!base) return [];
  const same = source.filter((product) => product.id !== id && product.category === base.category);
  const others = source.filter((product) => product.id !== id && product.category !== base.category);
  return [...same, ...others].slice(0, limit);
}

export function relatedLocalServices(id: string, limit = 3, source: Service[] = SERVICES): Service[] {
  const base = findLocalService(id, source);
  if (!base) return [];
  const same = source.filter((service) => service.id !== id && service.type === base.type);
  const others = source.filter((service) => service.id !== id && service.type !== base.type);
  return [...same, ...others].slice(0, limit);
}

export function localGallery(serviceType?: string): GalleryItem[] {
  return serviceType ? GALLERY.filter((item) => item.serviceType === serviceType) : GALLERY;
}

export const localProductBrands = (): string[] => Array.from(new Set(PRODUCTS.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)))).sort();

export const localPriceBounds = (): { min: number; max: number } => {
  const prices = PRODUCTS.map(effectivePrice);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
};
