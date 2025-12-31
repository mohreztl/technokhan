'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@autolounge/shared';

interface UseProductsParams {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  refetch: () => Promise<void>;
}

export function useProducts(params: UseProductsParams = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getProducts(params);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setTotal(response.data.total);
        setPages(response.data.pages);
      } else {
        setError(response.error || 'خطا در دریافت محصولات');
      }
    } catch (err) {
      setError('خطا در دریافت محصولات');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.category, params.featured, params.search, params.page, params.limit, params.sortBy, params.sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, total, pages, refetch: fetchProducts };
}

interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProduct(id: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getProduct(id);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || 'خطا در دریافت محصول');
      }
    } catch (err) {
      setError('خطا در دریافت محصول');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
}
