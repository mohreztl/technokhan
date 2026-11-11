import type { GalleryItem, PagedList, Pagination, Product, ProductListQuery, Service, ServiceListQuery } from '@technokhan/shared';
import { PRODUCTS, SERVICES, GALLERY, effectivePrice, filterProducts, matchesSearchText } from '@technokhan/shared';

export { filterProducts } from '@technokhan/shared';

function paginate<T>(items: T[], page = 1, limit = 12): PagedList<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * limit;
  const pagination: Pagination = { total, page: current, limit, totalPages, hasNext: current < totalPages, hasPrev: current > 1 };
  return { items: items.slice(start, start + limit), pagination };
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

/** Local equivalent of the Fastify list endpoint, including pagination. */
export function queryLocalProducts(q: ProductListQuery = {}, source: Product[] = PRODUCTS): PagedList<Product> {
  return paginate(filterProducts(source, q), q.page, q.limit);
}

export function queryLocalServices(q: ServiceListQuery = {}, source: Service[] = SERVICES): PagedList<Service> {
  let items = source.filter((service) => service.isActive !== false);
  if (q.type) items = items.filter((service) => service.type === q.type);
  if (q.featured !== undefined) items = items.filter((service) => service.featured === q.featured);
  if (q.search) items = items.filter((service) => matchesSearchText([service.name, service.nameEn, service.description, ...(service.tags ?? [])], q.search));
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
