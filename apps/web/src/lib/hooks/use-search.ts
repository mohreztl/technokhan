'use client';

import Fuse from 'fuse.js';
import { useMemo, useState, useCallback } from 'react';
import type { Product, Service } from '@autolounge/shared';

// Search result types
export interface SearchResult {
  type: 'product' | 'service';
  item: Product | Service;
  score: number;
}

// Fuse.js options for Persian-friendly fuzzy search
const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4, // Lower = more strict matching
  distance: 100,
  minMatchCharLength: 2,
  useExtendedSearch: true,
  ignoreLocation: true,
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'nameEn', weight: 0.3 },
    { name: 'description', weight: 0.2 },
    { name: 'descriptionEn', weight: 0.1 },
  ],
};

// Hook for searching products
export function useProductSearch(products: Product[]) {
  const fuse = useMemo(
    () => new Fuse(products, FUSE_OPTIONS),
    [products]
  );

  const search = useCallback(
    (query: string): Product[] => {
      if (!query.trim()) return products;
      
      const results = fuse.search(query);
      return results.map((result) => result.item);
    },
    [fuse, products]
  );

  return { search };
}

// Hook for searching services
export function useServiceSearch(services: Service[]) {
  const fuse = useMemo(
    () => new Fuse(services, FUSE_OPTIONS),
    [services]
  );

  const search = useCallback(
    (query: string): Service[] => {
      if (!query.trim()) return services;
      
      const results = fuse.search(query);
      return results.map((result) => result.item);
    },
    [fuse, services]
  );

  return { search };
}

// Combined search hook for both products and services
export function useGlobalSearch(products: Product[], services: Service[]) {
  const productFuse = useMemo(
    () => new Fuse(products, FUSE_OPTIONS),
    [products]
  );

  const serviceFuse = useMemo(
    () => new Fuse(services, FUSE_OPTIONS),
    [services]
  );

  const search = useCallback(
    (query: string): SearchResult[] => {
      if (!query.trim()) return [];

      const productResults = productFuse.search(query).map((result) => ({
        type: 'product' as const,
        item: result.item,
        score: result.score || 0,
      }));

      const serviceResults = serviceFuse.search(query).map((result) => ({
        type: 'service' as const,
        item: result.item,
        score: result.score || 0,
      }));

      // Combine and sort by score (lower is better)
      return [...productResults, ...serviceResults]
        .sort((a, b) => a.score - b.score)
        .slice(0, 10); // Limit to 10 results
    },
    [productFuse, serviceFuse]
  );

  return { search };
}

// Standalone search function for server-side use
export function searchItems<T extends { name: string; nameEn?: string; description: string }>(
  items: T[],
  query: string,
  options?: Partial<typeof FUSE_OPTIONS>
): T[] {
  if (!query.trim()) return items;
  
  const fuse = new Fuse(items, { ...FUSE_OPTIONS, ...options });
  const results = fuse.search(query);
  
  return results.map((result) => result.item);
}

// Hook for managing search state
export function useSearchState() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('autolounge_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('autolounge_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('autolounge_recent_searches');
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      localStorage.setItem('autolounge_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  };
}
