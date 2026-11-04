// Demo coupons validated locally and again by Fastify when an order is placed.
import type { Coupon } from '../types';

export const COUPONS: Coupon[] = [
  { code: 'TECH10', type: 'percent', value: 10, description: '۱۰٪ تخفیف اولین خرید تکنو خان (تا سقف ۵۰۰ هزار تومان)', minTotal: 1_000_000, maxDiscount: 500_000, expiresAt: '2027-03-20T20:29:59.000Z' },
  { code: 'TECH300', type: 'fixed', value: 300_000, description: '۳۰۰ هزار تومان تخفیف برای سبد بالای ۳ میلیون', minTotal: 3_000_000, expiresAt: '2027-03-20T20:29:59.000Z' },
  { code: 'VIP20', type: 'percent', value: 20, description: '۲۰٪ تخفیف ویژه مشتریان VIP (تا سقف ۲ میلیون تومان)', minTotal: 5_000_000, maxDiscount: 2_000_000, expiresAt: '2027-03-20T20:29:59.000Z' },
  { code: 'EXPIRED', type: 'percent', value: 15, description: 'کد تست منقضی‌شده', minTotal: 500_000, expiresAt: '2026-03-20T20:29:59.000Z' },
];
