import 'server-only';
import type {
  Article,
  PagedList,
  Product,
  ProductListQuery,
  StoreBrandInfo,
  StoreCategoryInfo,
} from '@technokhan/shared';
import { BRANDS, CATEGORIES, findArticle, sortedArticles } from '@technokhan/shared';
import { apiFetch, buildQuery, isDemoMode } from '@/lib/api/client';
import {
  findLocalProduct,
  queryLocalProducts,
  relatedLocalProducts,
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

/** Returns taxonomy categories with live product counts (bundled fallback). */
export async function getStoreCategories(): Promise<StoreCategoryInfo[]> {
  if (!isDemoMode()) {
    const result = await apiFetch<StoreCategoryInfo[]>('/products/categories/details', { auth: false, timeoutMs: SERVER_TIMEOUT, next: { revalidate: REVALIDATE, tags: ['categories'] } });
    if (result.ok && Array.isArray(result.data) && result.data.length) return result.data;
  }
  return CATEGORIES.map((category) => ({
    slug: category.id as string,
    name: category.name,
    description: category.description,
    image: category.image,
    productCount: 0,
  }));
}

/** Returns brands present in the catalog with counts (bundled fallback). */
export async function getStoreBrands(): Promise<StoreBrandInfo[]> {
  if (!isDemoMode()) {
    const result = await apiFetch<StoreBrandInfo[]>('/products/brands/list', { auth: false, timeoutMs: SERVER_TIMEOUT, next: { revalidate: REVALIDATE, tags: ['brands'] } });
    if (result.ok && Array.isArray(result.data) && result.data.length) return result.data;
  }
  return BRANDS.map((brand) => ({ ...brand, productCount: 0 }));
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
