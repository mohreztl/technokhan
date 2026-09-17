// Bundled catalog & content data for AutoLounge (used by the web app in demo
// mode, by the API seed script and as the fallback when the API is offline).
import type { Coupon, GalleryItem, Product, Service, WrapColor } from '../types';
import { PRODUCTS } from './products';
import { SERVICES } from './services';
import { GALLERY } from './gallery';
import { COUPONS } from './coupons';
import { WRAP_COLORS } from './wrap-colors';

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
