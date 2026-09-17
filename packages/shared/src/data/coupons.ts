// Demo coupon codes (validated by applyCoupon in utils/pricing)
import type { Coupon } from '../types';

export const COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    description: '۱۰٪ تخفیف اولین خرید (تا سقف ۵۰۰ هزار تومان)',
    minTotal: 1_000_000,
    maxDiscount: 500_000,
    expiresAt: '2027-03-20T20:29:59.000Z',
  },
  {
    code: 'SUMMER1405',
    type: 'fixed',
    value: 300_000,
    description: '۳۰۰ هزار تومان تخفیف جشنواره‌ی تابستان ۱۴۰۵',
    minTotal: 2_000_000,
    expiresAt: '2026-09-22T20:29:59.000Z',
  },
  {
    code: 'VIP20',
    type: 'percent',
    value: 20,
    description: '۲۰٪ تخفیف ویژه‌ی مشتریان VIP (تا سقف ۲ میلیون تومان)',
    minTotal: 5_000_000,
    maxDiscount: 2_000_000,
    expiresAt: '2027-03-20T20:29:59.000Z',
  },
  {
    code: 'EXPIRED',
    type: 'percent',
    value: 15,
    description: 'کد تست منقضی‌شده',
    minTotal: 500_000,
    expiresAt: '2026-03-20T20:29:59.000Z',
  },
];
