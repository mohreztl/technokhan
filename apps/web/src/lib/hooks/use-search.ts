'use client';

import Fuse, { type IFuseOptions } from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PRODUCTS } from '@technokhan/shared';
import type { Product } from '@technokhan/shared';

export interface SearchResult {
  type: 'product';
  item: Product;
  score: number;
}

export type SearchableItem = Pick<Product, 'name' | 'nameEn' | 'description'> & {
  brand?: string;
  tags?: string[];
};

const FUSE_OPTIONS: IFuseOptions<SearchableItem> = {
  includeScore: true,
  threshold: 0.4,
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

export function useProductSearch(products: Product[]) {
  const fuse = useMemo(() => new Fuse(products, options<Product>()), [products]);
  const search = useCallback((query: string): Product[] => {
    if (!query.trim()) return products;
    return fuse.search(query).map((result) => result.item);
  }, [fuse, products]);
  return { search };
}

export function useGlobalSearch(products: Product[], limit = 10) {
  const fuse = useMemo(() => new Fuse(products, options<Product>()), [products]);
  const search = useCallback((query: string): SearchResult[] => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q).map((result) => ({ type: 'product' as const, item: result.item, score: result.score ?? 0 })).slice(0, limit);
  }, [fuse, limit]);
  return { search };
}

export function useCatalogSearch(limit = 10) {
  return useGlobalSearch(PRODUCTS, limit);
}

export function searchItems<T extends SearchableItem>(items: T[], query: string, overrides?: Partial<IFuseOptions<T>>): T[] {
  if (!query.trim()) return items;
  const fuse = new Fuse(items, { ...options<T>(), ...overrides });
  return fuse.search(query).map((result) => result.item);
}

export const RECENT_SEARCHES_KEY = 'technokhan_recent_searches';
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
