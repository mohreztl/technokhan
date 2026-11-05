'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Product, ProductListQuery, PagedList } from '@technokhan/shared';
import { productsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';

async function fetchProductPage(q: ProductListQuery): Promise<PagedList<Product>> {
  const r = await productsApi.list(q);
  if (!r.ok) throw new Error(r.error);
  return {
    items: r.data,
    pagination: r.pagination ?? {
      total: r.data.length,
      page: q.page ?? 1,
      limit: q.limit ?? r.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

/** Paginated, filterable product list (URL-synced pages keep previous data while loading). */
export function useProducts(q: ProductListQuery = {}, options: { enabled?: boolean; initialData?: PagedList<Product> } = {}) {
  const query = useQuery({
    queryKey: qk.products(q),
    queryFn: () => fetchProductPage(q),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
    initialData: options.initialData,
    staleTime: 60_000,
  });
  return {
    ...query,
    products: query.data?.items ?? [],
    pagination: query.data?.pagination,
    total: query.data?.pagination.total ?? 0,
    pages: query.data?.pagination.totalPages ?? 0,
  };
}

export function useProduct(id: string | undefined, initialData?: Product) {
  return useQuery({
    queryKey: qk.product(id ?? ''),
    queryFn: () => unwrap(productsApi.get(id!)),
    enabled: !!id,
    initialData,
    staleTime: 60_000,
  });
}

export function useFeaturedProducts(limit = 8, initialData?: Product[]) {
  return useQuery({
    queryKey: qk.featuredProducts(),
    queryFn: () => unwrap(productsApi.featured(limit)),
    initialData,
    staleTime: 5 * 60_000,
  });
}

export function useRelatedProducts(id: string | undefined, limit = 4, initialData?: Product[]) {
  return useQuery({
    queryKey: qk.relatedProducts(id ?? ''),
    queryFn: () => unwrap(productsApi.related(id!, limit)),
    enabled: !!id,
    initialData,
    staleTime: 5 * 60_000,
  });
}
