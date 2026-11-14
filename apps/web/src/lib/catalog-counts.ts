import type { Product } from '@technokhan/shared';

export type CatalogProduct = Pick<Product, 'category' | 'brand'>;

export interface CatalogCounts {
  categories: Record<string, number>;
  brands: Record<string, number>;
}

export function getCatalogCounts(products: CatalogProduct[]): CatalogCounts {
  const counts: CatalogCounts = { categories: {}, brands: {} };
  for (const product of products) {
    counts.categories[product.category] = (counts.categories[product.category] ?? 0) + 1;
    const brand = product.brand?.trim().toLocaleLowerCase('en');
    if (brand) counts.brands[brand] = (counts.brands[brand] ?? 0) + 1;
  }
  return counts;
}
