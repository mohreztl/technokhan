import type { Product, ProductListQuery } from '../types';
import { effectivePrice } from './pricing';

/** Normalizes Arabic/Persian letter variants and whitespace for catalog search. */
export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[‌‏‎]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Requires every search term to occur in the normalized haystack. */
export function matchesSearchText(haystack: string[], needle?: string): boolean {
  if (!needle) return true;
  const terms = normalizeSearchText(needle).split(' ').filter(Boolean);
  const hay = normalizeSearchText(haystack.filter(Boolean).join(' '));
  return terms.every((term) => hay.includes(term));
}

function sortProducts(items: Product[], sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Product[] {
  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price': return (effectivePrice(a) - effectivePrice(b)) * direction;
      case 'rating': return ((a.rating ?? 0) - (b.rating ?? 0)) * direction;
      case 'name': return a.name.localeCompare(b.name, 'fa') * direction;
      case 'popular': return ((a.salesCount ?? 0) - (b.salesCount ?? 0)) * direction;
      default: return (new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime()) * direction;
    }
  });
}

/** Applies the complete storefront query to products without I/O. */
export function filterProducts(source: Product[], q: ProductListQuery = {}): Product[] {
  let items = source.filter((product) => product.isActive !== false);
  if (q.category) items = items.filter((product) => product.category === q.category);
  if (q.brands?.length) {
    const brands = q.brands.map((brand) => brand.toLowerCase());
    items = items.filter((product) => product.brand && brands.includes(product.brand.toLowerCase()));
  } else if (q.brand) {
    items = items.filter((product) => product.brand?.toLowerCase() === q.brand?.toLowerCase());
  }
  if (q.features?.length) {
    items = items.filter((product) => q.features!.every((feature) => matchesSearchText([...(product.features ?? []), ...(product.tags ?? [])], feature)));
  }
  if (q.featured !== undefined) items = items.filter((product) => product.featured === q.featured);
  if (q.deals) items = items.filter((product) => product.discountPrice !== undefined && product.discountPrice < product.price);
  if (q.inStock) items = items.filter((product) => product.stock > 0);
  if (q.minPrice !== undefined) items = items.filter((product) => effectivePrice(product) >= q.minPrice!);
  if (q.maxPrice !== undefined) items = items.filter((product) => effectivePrice(product) <= q.maxPrice!);
  if (q.search) {
    items = items.filter((product) => matchesSearchText([
      product.name,
      product.nameEn,
      product.brand ?? '',
      product.shortDescription ?? '',
      product.description,
      ...(product.tags ?? []),
      ...(product.features ?? []),
      ...(product.specifications ?? []).flatMap((specification) => [specification.label, specification.value]),
    ], q.search));
  }
  return sortProducts(items, q.sortBy, q.sortOrder);
}
