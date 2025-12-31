'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Service } from '@autolounge/shared';

interface UseServicesParams {
  type?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseServicesReturn {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  refetch: () => Promise<void>;
}

export function useServices(params: UseServicesParams = {}): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getServices(params);
      if (response.success && response.data) {
        setServices(response.data.services);
        setTotal(response.data.total);
        setPages(response.data.pages);
      } else {
        setError(response.error || 'خطا در دریافت خدمات');
      }
    } catch (err) {
      setError('خطا در دریافت خدمات');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.type, params.featured, params.search, params.page, params.limit]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, error, total, pages, refetch: fetchServices };
}

interface UseServiceReturn {
  service: Service | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useService(id: string): UseServiceReturn {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchService = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getService(id);
      if (response.success && response.data) {
        setService(response.data);
      } else {
        setError(response.error || 'خطا در دریافت خدمت');
      }
    } catch (err) {
      setError('خطا در دریافت خدمت');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  return { service, isLoading, error, refetch: fetchService };
}
