// Pure pricing helpers used by the web UI (configurator, cart, checkout) and the API (validation)
import type {
  Coupon,
  CouponResult,
  Product,
  QuoteResult,
  Service,
  VehicleSize,
} from '../types';
import { SHIPPING } from '../constants';

export function effectivePrice(product: Pick<Product, 'price' | 'discountPrice'>): number {
  return product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
}

export function discountPercent(product: Pick<Product, 'price' | 'discountPrice'>): number {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
}

export function basePriceFor(service: Pick<Service, 'price' | 'pricing'>, size: VehicleSize): number {
  if (service.pricing) return service.pricing[size];
  const factor = size === 'small' ? 0.85 : size === 'large' ? 1.3 : 1;
  return Math.round((service.price * factor) / 10_000) * 10_000;
}

export function computeQuote(
  service: Pick<Service, 'price' | 'pricing' | 'addons' | 'duration'>,
  size: VehicleSize,
  addonIds: string[] = []
): QuoteResult {
  const base = basePriceFor(service, size);
  const addons = (service.addons ?? [])
    .filter((a) => addonIds.includes(a.id))
    .map((a) => ({ id: a.id, name: a.name, price: a.price }));
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  const extraMinutes = addons.length * 30;
  return {
    base,
    addons,
    total: base + addonsTotal,
    durationMinutes: service.duration + extraMinutes,
    currency: 'IRT',
  };
}

export function computeShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.cost;
}

export function applyCoupon(
  code: string | undefined | null,
  subtotal: number,
  coupons: Coupon[],
  now: Date = new Date()
): CouponResult {
  if (!code) return { valid: false, discount: 0, message: '' };
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);
  if (!coupon) return { valid: false, discount: 0, message: 'کد تخفیف معتبر نیست' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { valid: false, discount: 0, message: 'مهلت استفاده از این کد به پایان رسیده است' };
  }
  if (coupon.minTotal && subtotal < coupon.minTotal) {
    return {
      valid: false,
      discount: 0,
      message: `حداقل مبلغ سفارش برای این کد ${coupon.minTotal.toLocaleString('fa-IR')} تومان است`,
    };
  }
  let discount =
    coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { valid: true, code: coupon.code, discount, message: coupon.description };
}

export interface CartLine {
  product: Pick<Product, 'price' | 'discountPrice'>;
  quantity: number;
}

export interface OrderTotals {
  count: number;
  /** sum of list prices */
  listTotal: number;
  /** sum of effective prices */
  subtotal: number;
  /** product-level discounts (list - effective) */
  productDiscount: number;
  /** coupon discount */
  couponDiscount: number;
  shipping: number;
  total: number;
}

export function computeOrderTotals(
  lines: CartLine[],
  couponCode?: string | null,
  coupons: Coupon[] = []
): OrderTotals & { coupon: CouponResult } {
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const listTotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + effectivePrice(l.product) * l.quantity, 0);
  const coupon = applyCoupon(couponCode, subtotal, coupons);
  const afterCoupon = Math.max(0, subtotal - coupon.discount);
  const shipping = computeShipping(afterCoupon);
  return {
    count,
    listTotal,
    subtotal,
    productDiscount: listTotal - subtotal,
    couponDiscount: coupon.discount,
    shipping,
    total: afterCoupon + shipping,
    coupon,
  };
}
