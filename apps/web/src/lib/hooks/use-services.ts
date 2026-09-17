'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PagedList, Service, ServiceListQuery } from '@autolounge/shared';
import { servicesApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';

async function fetchServicePage(q: ServiceListQuery): Promise<PagedList<Service>> {
  const r = await servicesApi.list(q);
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

export function useServices(q: ServiceListQuery = {}, options: { enabled?: boolean; initialData?: PagedList<Service> } = {}) {
  const query = useQuery({
    queryKey: qk.services(q),
    queryFn: () => fetchServicePage(q),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
    initialData: options.initialData,
    staleTime: 60_000,
  });
  return {
    ...query,
    services: query.data?.items ?? [],
    pagination: query.data?.pagination,
    total: query.data?.pagination.total ?? 0,
    pages: query.data?.pagination.totalPages ?? 0,
  };
}

export function useService(id: string | undefined, initialData?: Service) {
  return useQuery({
    queryKey: qk.service(id ?? ''),
    queryFn: () => unwrap(servicesApi.get(id!)),
    enabled: !!id,
    initialData,
    staleTime: 60_000,
  });
}

export function useFeaturedServices(limit = 6, initialData?: Service[]) {
  return useQuery({
    queryKey: qk.featuredServices(),
    queryFn: () => unwrap(servicesApi.featured(limit)),
    initialData,
    staleTime: 5 * 60_000,
  });
}

export function useRelatedServices(id: string | undefined, limit = 3, initialData?: Service[]) {
  return useQuery({
    queryKey: qk.relatedServices(id ?? ''),
    queryFn: () => unwrap(servicesApi.related(id!, limit)),
    enabled: !!id,
    initialData,
    staleTime: 5 * 60_000,
  });
}
