'use client';

import Fuse, { type IFuseOptions } from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PRODUCTS, SERVICES } from '@autolounge/shared';
import type { Product, Service } from '@autolounge/shared';

// Search result types
export interface SearchResult {
  type: 'product' | 'service';
  item: Product | Service;
  score: number;
}

export type SearchableItem = Pick<Product, 'name' | 'nameEn' | 'description'> & {
  brand?: string;
  tags?: string[];
};

// Fuse.js options for Persian-friendly fuzzy search
const FUSE_OPTIONS: IFuseOptions<SearchableItem> = {
  includeScore: true,
  threshold: 0.4, // Lower = more strict matching
  distance: 100,
  minMatchCharLength: 2,
  ignoreLocation: true,
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'nameEn', weight: 0.2 },
    { name: 'brand', weight: 0.15 },
    { name: 'tags', weight: 0.15 },
    { name: 'description', weight: 0.1 },
  ],
};

const options = <T extends SearchableItem>() => FUSE_OPTIONS as IFuseOptions<T>;

// Hook for searching products
export function useProductSearch(products: Product[]) {
  const fuse = useMemo(() => new Fuse(products, options<Product>()), [products]);

  const search = useCallback(
    (query: string): Product[] => {
      if (!query.trim()) return products;
      return fuse.search(query).map((result) => result.item);
    },
    [fuse, products]
  );

  return { search };
}

// Hook for searching services
export function useServiceSearch(services: Service[]) {
  const fuse = useMemo(() => new Fuse(services, options<Service>()), [services]);

  const search = useCallback(
    (query: string): Service[] => {
      if (!query.trim()) return services;
      return fuse.search(query).map((result) => result.item);
    },
    [fuse, services]
  );

  return { search };
}

// Combined search hook for both products and services
export function useGlobalSearch(products: Product[], services: Service[], limit = 10) {
  const productFuse = useMemo(() => new Fuse(products, options<Product>()), [products]);
  const serviceFuse = useMemo(() => new Fuse(services, options<Service>()), [services]);

  const search = useCallback(
    (query: string): SearchResult[] => {
      const q = query.trim();
      if (!q) return [];

      const productResults = productFuse.search(q).map((result) => ({
        type: 'product' as const,
        item: result.item,
        score: result.score ?? 0,
      }));

      const serviceResults = serviceFuse.search(q).map((result) => ({
        type: 'service' as const,
        item: result.item,
        score: result.score ?? 0,
      }));

      // Combine and sort by score (lower is better)
      return [...productResults, ...serviceResults]
        .sort((a, b) => a.score - b.score)
        .slice(0, limit);
    },
    [productFuse, serviceFuse, limit]
  );

  return { search };
}

/** Global search over the shared catalog (`PRODUCTS` + `SERVICES`). */
export function useCatalogSearch(limit = 10) {
  return useGlobalSearch(PRODUCTS, SERVICES, limit);
}

// Standalone search function for server-side use
export function searchItems<T extends SearchableItem>(
  items: T[],
  query: string,
  overrides?: Partial<IFuseOptions<T>>
): T[] {
  if (!query.trim()) return items;
  const fuse = new Fuse(items, { ...options<T>(), ...overrides });
  return fuse.search(query).map((result) => result.item);
}

export const RECENT_SEARCHES_KEY = 'autolounge_recent_searches';
const RECENT_LIMIT = 6;

function readRecent(): string[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode / quota) */
  }
}

// Hook for managing search state (recent searches persist in localStorage, read after mount)
export function useSearchState() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(readRecent());
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, RECENT_LIMIT);
      writeRecent(updated);
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    writeRecent([]);
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      writeRecent(updated);
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
