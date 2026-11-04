// Bundled TechnoKhan catalog used by demo mode, API seeding and offline fallback.
import type { Article, Coupon, GalleryItem, Product, Service, WrapColor } from '../types';
import { ARTICLES } from './articles';
import { PRODUCTS } from './products';
export { CATEGORIES, BRANDS, findCategory } from './categories';
import { SERVICES } from './services';
import { GALLERY } from './gallery';
import { COUPONS } from './coupons';
import { WRAP_COLORS } from './wrap-colors';

export { ARTICLES } from './articles';
export { PRODUCTS, PRODUCT_BRANDS } from './products';
export { SERVICES } from './services';
export { TESTIMONIALS } from './testimonials';
export { TEAM } from './team';
export { CERTIFICATIONS } from './certifications';
export { FAQ } from './faq';
export { GALLERY } from './gallery';
export { LEGAL_DOCS } from './legal';
export { COUPONS } from './coupons';
export { WRAP_COLORS } from './wrap-colors';
export { VEHICLE_CATALOG } from './vehicles';

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export const findProduct = (id: string): Product | undefined => PRODUCTS.find((p) => p.id === id);

export const findService = (id: string): Service | undefined => SERVICES.find((s) => s.id === id);

export const findCoupon = (code: string): Coupon | undefined => {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code.toUpperCase() === normalized);
};

export const findWrapColor = (id: string): WrapColor | undefined =>
  WRAP_COLORS.find((c) => c.id === id);

export const findArticle = (slug: string): Article | undefined =>
  ARTICLES.find((a) => a.slug === slug);

/** Newest first — the order the magazine index and the homepage rail use. */
export const sortedArticles = (): Article[] =>
  [...ARTICLES].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export const ARTICLE_CATEGORIES = Array.from(new Set(ARTICLES.map((a) => a.category)));

/** Shared tags first, then same category, then whatever is newest. */
export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const base = findArticle(slug);
  if (!base) return [];
  const others = sortedArticles().filter((a) => a.slug !== slug);
  const score = (a: Article) =>
    a.tags.filter((t) => base.tags.includes(t)).length * 2 + (a.category === base.category ? 1 : 0);
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export const findGalleryByService = (serviceId: string): GalleryItem[] =>
  GALLERY.filter((g) => g.serviceId === serviceId);

export function getFeaturedProducts(limit = 8): Product[] {
  return PRODUCTS.filter((p) => p.featured && p.isActive !== false).slice(0, limit);
}

export function getFeaturedServices(limit = 6): Service[] {
  return SERVICES.filter((s) => s.featured && s.isActive !== false).slice(0, limit);
}

/** Same-category products first, then the rest of the catalog. */
export function getRelatedProducts(id: string, limit = 4): Product[] {
  const base = findProduct(id);
  if (!base) return [];
  const active = PRODUCTS.filter((p) => p.id !== id && p.isActive !== false);
  const same = active.filter((p) => p.category === base.category);
  const others = active.filter((p) => p.category !== base.category);
  return [...same, ...others].slice(0, limit);
}

/** Same-type services first, then featured ones, then the rest. */
export function getRelatedServices(id: string, limit = 3): Service[] {
  const base = findService(id);
  if (!base) return [];
  const active = SERVICES.filter((s) => s.id !== id && s.isActive !== false);
  const same = active.filter((s) => s.type === base.type);
  const others = active
    .filter((s) => s.type !== base.type)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  return [...same, ...others].slice(0, limit);
}
