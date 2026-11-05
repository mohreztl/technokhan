import 'server-only';
import type {
  Article,
  Brand,
  Category,
  GalleryItem,
  PagedList,
  Product,
  ProductListQuery,
  Service,
  ServiceListQuery,
} from '@technokhan/shared';
import { BRANDS, CATEGORIES, findArticle, sortedArticles } from '@technokhan/shared';
import { apiFetch, buildQuery, isDemoMode } from '@/lib/api/client';
import {
  findLocalProduct,
  findLocalService,
  localGallery,
  queryLocalProducts,
  queryLocalServices,
  relatedLocalProducts,
  relatedLocalServices,
} from './local-query';

/**
 * Server-side catalog repository: API first, bundled catalog as fallback.
 * Used by page.tsx files, generateMetadata, generateStaticParams and the sitemap.
 * Reads are cached with ISR (5 minutes) so a build without a running API
 * still succeeds and self-heals once the API is reachable.
 */

export type DataSource = 'api' | 'local';
export interface Sourced<T> {
  data: T;
  source: DataSource;
}

const REVALIDATE = 300;
const SERVER_TIMEOUT = 2500;

function pagedFromApi<T>(items: T[], pagination: PagedList<T>['pagination'] | undefined, q: {
  page?: number;
  limit?: number;
}): PagedList<T> {
  return {
    items,
    pagination: pagination ?? {
      total: items.length,
      page: q.page ?? 1,
      limit: q.limit ?? items.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function getProducts(q: ProductListQuery = {}): Promise<Sourced<PagedList<Product>>> {
  if (!isDemoMode()) {
    const r = await apiFetch<Product[]>(`/products${buildQuery(q as Record<string, unknown>)}`, {
      auth: false,
      timeoutMs: SERVER_TIMEOUT,
      next: { revalidate: REVALIDATE, tags: ['products'] },
    });
    if (r.ok && Array.isArray(r.data)) {
      return { data: pagedFromApi(r.data, r.pagination, q), source: 'api' };
    }
  }
  return { data: queryLocalProducts(q), source: 'local' };
}

export async function getProduct(id: string): Promise<Sourced<Product> | null> {
  if (!isDemoMode()) {
    const r = await apiFetch<Product>(`/products/${encodeURIComponent(id)}`, {
      auth: false,
      timeoutMs: SERVER_TIMEOUT,
      next: { revalidate: REVALIDATE, tags: ['products', `product:${id}`] },
    });
    if (r.ok && r.data?.id) return { data: r.data, source: 'api' };
    if (!r.ok && !r.offline && r.status !== 404) {
      // API reachable but errored: fall through to local
    }
  }
  const local = findLocalProduct(id);
  return local ? { data: local, source: 'local' } : null;
}

export async function getRelatedProducts(id: string, limit = 4): Promise<Product[]> {
  if (!isDemoMode()) {
    const r = await apiFetch<Product[]>(`/products/${encodeURIComponent(id)}/related?limit=${limit}`, {
      auth: false,
      timeoutMs: SERVER_TIMEOUT,
      next: { revalidate: REVALIDATE, tags: ['products'] },
    });
    if (r.ok && Array.isArray(r.data) && r.data.length) return r.data;
  }
  return relatedLocalProducts(id, limit);
}

export async function getServices(q: ServiceListQuery = {}): Promise<Sourced<PagedList<Service>>> {
  if (!isDemoMode()) {
    const r = await apiFetch<Service[]>(`/services${buildQuery(q as Record<string, unknown>)}`, {
      auth: false,
      timeoutMs: SERVER_TIMEOUT,
      next: { revalidate: REVALIDATE, tags: ['services'] },
    });
    if (r.ok && Array.isArray(r.data)) {
      return { data: pagedFromApi(r.data, r.pagination, q), source: 'api' };
    }
  }
  return { data: queryLocalServices(q), source: 'local' };
}

export async function getService(id: string): Promise<Sourced<Service> | null> {
  if (!isDemoMode()) {
    const r = await apiFetch<Service>(`/services/${encodeURIComponent(id)}`, {
      auth: false,
      timeoutMs: SERVER_TIMEOUT,
      next: { revalidate: REVALIDATE, tags: ['services', `service:${id}`] },
    });
    if (r.ok && r.data?.id) return { data: r.data, source: 'api' };
  }
  const local = findLocalService(id);
  return local ? { data: local, source: 'local' } : null;
}

export async function getRelatedServices(id: string, limit = 3): Promise<Service[]> {
  if (!isDemoMode()) {
    const r = await apiFetch<Service[]>(`/services/${encodeURIComponent(id)}/related?limit=${limit}`, {
      auth: false,
      timeoutMs: SERVER_TIMEOUT,
      next: { revalidate: REVALIDATE, tags: ['services'] },
    });
    if (r.ok && Array.isArray(r.data) && r.data.length) return r.data;
  }
  return relatedLocalServices(id, limit);
}

export async function getFeatured(): Promise<
  Sourced<{ products: Product[]; services: Service[] }>
> {
  const [p, s] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getServices({ featured: true, limit: 6 }),
  ]);
  return {
    data: { products: p.data.items, services: s.data.items },
    source: p.source === 'api' && s.source === 'api' ? 'api' : 'local',
  };
}

export async function getGallery(serviceType?: string): Promise<GalleryItem[]> {
  // Gallery is editorial content shipped with the app (no API endpoint yet)
  return localGallery(serviceType);
}


/** Returns category metadata from Fastify or the bundled fallback. */
export async function getCategories(): Promise<Category[]> {
  if (!isDemoMode()) {
    const result = await apiFetch<Category[]>('/products/categories/details', { auth: false, timeoutMs: SERVER_TIMEOUT, next: { revalidate: REVALIDATE, tags: ['categories'] } });
    if (result.ok && Array.isArray(result.data)) return result.data;
  }
  return CATEGORIES;
}

/** Returns original brand metadata used by filters and brand showcases. */
export async function getBrands(): Promise<Brand[]> {
  if (!isDemoMode()) {
    const result = await apiFetch<Brand[]>('/products/brands/list', { auth: false, timeoutMs: SERVER_TIMEOUT, next: { revalidate: REVALIDATE, tags: ['brands'] } });
    if (result.ok && Array.isArray(result.data)) return result.data;
  }
  return BRANDS;
}

/** Lists magazine articles newest-first with optional category/search filtering. */
export async function getArticles(options: { category?: string; search?: string; limit?: number } = {}): Promise<Article[]> {
  if (!isDemoMode()) {
    const result = await apiFetch<Article[]>(`/articles${buildQuery(options as Record<string, unknown>)}`, { auth: false, timeoutMs: SERVER_TIMEOUT, next: { revalidate: REVALIDATE, tags: ['articles'] } });
    if (result.ok && Array.isArray(result.data)) return result.data;
  }
  const search = options.search?.toLocaleLowerCase('fa');
  return sortedArticles()
    .filter((article) => !options.category || article.category === options.category)
    .filter((article) => !search || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLocaleLowerCase('fa').includes(search))
    .slice(0, options.limit ?? 12);
}

/** Finds one article by its canonical slug. */
export async function getArticle(slug: string): Promise<Article | null> {
  if (!isDemoMode()) {
    const result = await apiFetch<Article>(`/articles/${encodeURIComponent(slug)}`, { auth: false, timeoutMs: SERVER_TIMEOUT, next: { revalidate: REVALIDATE, tags: ['articles', `article:${slug}`] } });
    if (result.ok && result.data?.slug) return result.data;
  }
  return findArticle(slug) ?? null;
}
