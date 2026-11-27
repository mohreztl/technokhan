import type { Article, Coupon, Product } from '../types';
import { ARTICLES } from './articles';
import { PRODUCTS } from './products';
import { COUPONS } from './coupons';

export { CATEGORIES, BRANDS, findCategory } from './categories';
export {
  STORE_CATEGORIES,
  STORE_BRANDS,
  normalizeTaxonomyText,
  findStoreCategory,
  categoryForRawName,
  categoryQueryValues,
  findStoreBrand,
  detectBrandId,
} from './taxonomy';
export type { StoreCategory, StoreBrand } from './taxonomy';
export { ARTICLES } from './articles';
export { PRODUCTS, PRODUCT_BRANDS } from './products';
export { FAQ } from './faq';
export { LEGAL_DOCS } from './legal';
export { COUPONS } from './coupons';

export const findProduct = (id: string): Product | undefined => PRODUCTS.find((product) => product.id === id);

export const findCoupon = (code: string): Coupon | undefined => {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((coupon) => coupon.code.toUpperCase() === normalized);
};

export const findArticle = (slug: string): Article | undefined => ARTICLES.find((article) => article.slug === slug);

export const sortedArticles = (): Article[] => [...ARTICLES].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export const ARTICLE_CATEGORIES = Array.from(new Set(ARTICLES.map((article) => article.category)));

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const base = findArticle(slug);
  if (!base) return [];
  const others = sortedArticles().filter((article) => article.slug !== slug);
  const score = (article: Article) => article.tags.filter((tag) => base.tags.includes(tag)).length * 2 + (article.category === base.category ? 1 : 0);
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return PRODUCTS.filter((product) => product.featured && product.isActive !== false).slice(0, limit);
}

export function getRelatedProducts(id: string, limit = 4): Product[] {
  const base = findProduct(id);
  if (!base) return [];
  const active = PRODUCTS.filter((product) => product.id !== id && product.isActive !== false);
  const same = active.filter((product) => product.category === base.category);
  const others = active.filter((product) => product.category !== base.category);
  return [...same, ...others].slice(0, limit);
}
