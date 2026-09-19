import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ServiceType, type Coupon, type Service } from '../types';
import { SHIPPING } from '../constants';
import {
  applyCoupon,
  basePriceFor,
  computeOrderTotals,
  computeQuote,
  computeShipping,
  discountPercent,
  effectivePrice,
} from './pricing';

// ---------------------------------------------------------------------------
// Fixtures (inline — never depend on the data arrays)
// ---------------------------------------------------------------------------

function makeService(over: Partial<Service> = {}): Service {
  return {
    id: 'svc',
    name: 'خدمت تست',
    nameEn: 'Test service',
    description: '',
    descriptionEn: '',
    price: 1_000_000,
    duration: 120,
    type: ServiceType.DETAILING,
    images: [],
    featured: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...over,
  };
}

const ADDONS = [
  { id: 'a', name: 'افزودنی الف', price: 200_000 },
  { id: 'b', name: 'افزودنی ب', price: 350_000 },
  { id: 'c', name: 'افزودنی پ', price: 100_000 },
];

const COUPONS: Coupon[] = [
  {
    code: 'PERCENT10',
    type: 'percent',
    value: 10,
    description: 'ده درصد تخفیف',
    maxDiscount: 150_000,
  },
  { code: 'FIXED50', type: 'fixed', value: 50_000, description: 'پنجاه هزار تومان', minTotal: 500_000 },
  { code: 'FIXEDBIG', type: 'fixed', value: 100_000, description: 'صد هزار تومان' },
  { code: 'SUSPENDED', type: 'fixed', value: 50_000, description: 'غیرفعال', isActive: false },
  { code: 'USEDUP', type: 'fixed', value: 50_000, description: 'تکمیل', usageLimit: 3, usedCount: 3 },
  { code: 'HASROOM', type: 'fixed', value: 50_000, description: 'ظرفیت دارد', usageLimit: 3, usedCount: 2 },
  {
    code: 'EXPIRED',
    type: 'percent',
    value: 20,
    description: 'منقضی',
    expiresAt: '2020-01-01T00:00:00.000Z',
  },
  {
    code: 'FUTURE',
    type: 'percent',
    value: 5,
    description: 'آینده',
    expiresAt: '2999-01-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// effectivePrice / discountPercent
// ---------------------------------------------------------------------------

describe('effectivePrice / discountPercent', () => {
  it('uses the discount price only when it is lower than the list price', () => {
    assert.equal(effectivePrice({ price: 1_000_000, discountPrice: 800_000 }), 800_000);
    assert.equal(effectivePrice({ price: 1_000_000 }), 1_000_000);
    assert.equal(effectivePrice({ price: 100_000, discountPrice: 120_000 }), 100_000);
    assert.equal(effectivePrice({ price: 100_000, discountPrice: 100_000 }), 100_000);
  });

  it('computes a rounded discount percent', () => {
    assert.equal(discountPercent({ price: 1_000_000, discountPrice: 800_000 }), 20);
    assert.equal(discountPercent({ price: 300_000, discountPrice: 200_000 }), 33);
    assert.equal(discountPercent({ price: 100_000 }), 0);
    assert.equal(discountPercent({ price: 100_000, discountPrice: 120_000 }), 0);
  });
});

// ---------------------------------------------------------------------------
// basePriceFor / computeQuote
// ---------------------------------------------------------------------------

describe('basePriceFor', () => {
  it('prefers the explicit pricing table', () => {
    const svc = makeService({
      price: 1_000_000,
      pricing: { small: 900_000, medium: 1_400_000, large: 1_900_000 },
    });
    assert.equal(basePriceFor(svc, 'small'), 900_000);
    assert.equal(basePriceFor(svc, 'medium'), 1_400_000);
    assert.equal(basePriceFor(svc, 'large'), 1_900_000);
  });

  it('falls back to size factors (0.85 / 1 / 1.3) rounded to 10,000', () => {
    const svc = makeService({ price: 1_000_000 });
    assert.equal(basePriceFor(svc, 'small'), 850_000);
    assert.equal(basePriceFor(svc, 'medium'), 1_000_000);
    assert.equal(basePriceFor(svc, 'large'), 1_300_000);

    const odd = makeService({ price: 1_234_567 });
    assert.equal(basePriceFor(odd, 'small'), 1_050_000); // 1,049,381.95 -> 1,050,000
    assert.equal(basePriceFor(odd, 'medium'), 1_230_000); // 1,234,567 -> 1,230,000
    assert.equal(basePriceFor(odd, 'large'), 1_600_000); // 1,604,937.1 -> 1,600,000
  });
});

describe('computeQuote', () => {
  it('returns the base price for each size from the pricing table', () => {
    const svc = makeService({
      pricing: { small: 900_000, medium: 1_400_000, large: 1_900_000 },
      duration: 90,
    });
    const q = computeQuote(svc, 'large');
    assert.deepEqual(q, {
      base: 1_900_000,
      addons: [],
      total: 1_900_000,
      durationMinutes: 90,
      currency: 'IRT',
    });
    assert.equal(computeQuote(svc, 'small').base, 900_000);
    assert.equal(computeQuote(svc, 'medium').base, 1_400_000);
  });

  it('uses the fallback factors when no pricing table exists', () => {
    const svc = makeService({ price: 2_000_000 });
    assert.equal(computeQuote(svc, 'small').total, 1_700_000);
    assert.equal(computeQuote(svc, 'medium').total, 2_000_000);
    assert.equal(computeQuote(svc, 'large').total, 2_600_000);
  });

  it('adds selected add-ons in catalog order, ignores unknown ids, +30 min each', () => {
    const svc = makeService({ price: 1_000_000, duration: 120, addons: ADDONS });
    const q = computeQuote(svc, 'medium', ['c', 'a', 'does-not-exist']);
    assert.deepEqual(q.addons, [
      { id: 'a', name: 'افزودنی الف', price: 200_000 },
      { id: 'c', name: 'افزودنی پ', price: 100_000 },
    ]);
    assert.equal(q.base, 1_000_000);
    assert.equal(q.total, 1_300_000);
    assert.equal(q.durationMinutes, 180);
    assert.equal(q.currency, 'IRT');
  });

  it('handles no add-ons / services without an addons list', () => {
    const svc = makeService({ price: 1_000_000, duration: 60, addons: ADDONS });
    const none = computeQuote(svc, 'medium', []);
    assert.equal(none.total, 1_000_000);
    assert.equal(none.durationMinutes, 60);
    assert.deepEqual(none.addons, []);

    const bare = makeService({ price: 500_000, duration: 45 });
    const q = computeQuote(bare, 'small', ['a']);
    assert.deepEqual(q.addons, []);
    assert.equal(q.total, 430_000); // 425,000 -> 430,000
    assert.equal(q.durationMinutes, 45);
  });

  it('combines the pricing table with add-ons', () => {
    const svc = makeService({
      pricing: { small: 1_000_000, medium: 1_500_000, large: 2_000_000 },
      duration: 240,
      addons: ADDONS,
    });
    const q = computeQuote(svc, 'small', ['a', 'b', 'c']);
    assert.equal(q.total, 1_650_000);
    assert.equal(q.durationMinutes, 330);
  });
});

// ---------------------------------------------------------------------------
// computeShipping
// ---------------------------------------------------------------------------

describe('computeShipping', () => {
  it('is free for empty / non-positive subtotals', () => {
    assert.equal(computeShipping(0), 0);
    assert.equal(computeShipping(-5_000), 0);
  });

  it('charges the flat cost below the threshold and nothing at or above it', () => {
    assert.equal(computeShipping(1), SHIPPING.cost);
    assert.equal(computeShipping(SHIPPING.freeThreshold - 1), SHIPPING.cost);
    assert.equal(computeShipping(SHIPPING.freeThreshold), 0);
    assert.equal(computeShipping(SHIPPING.freeThreshold * 3), 0);
  });

  it('matches the documented constants', () => {
    assert.equal(computeShipping(2_999_999), 120_000);
    assert.equal(computeShipping(3_000_000), 0);
  });
});

// ---------------------------------------------------------------------------
// applyCoupon
// ---------------------------------------------------------------------------

describe('applyCoupon', () => {
  it('returns an empty invalid result when no code is given', () => {
    const expected = { valid: false, discount: 0, message: '' };
    assert.deepEqual(applyCoupon(undefined, 1_000_000, COUPONS), expected);
    assert.deepEqual(applyCoupon(null, 1_000_000, COUPONS), expected);
    assert.deepEqual(applyCoupon('', 1_000_000, COUPONS), expected);
  });

  it('rejects unknown codes', () => {
    const r = applyCoupon('NOPE', 1_000_000, COUPONS);
    assert.equal(r.valid, false);
    assert.equal(r.discount, 0);
    assert.equal(r.message, 'کد تخفیف معتبر نیست');
    assert.equal(r.code, undefined);
  });

  it('matches codes case-insensitively and trims whitespace', () => {
    const r = applyCoupon('  percent10 ', 1_000_000, COUPONS);
    assert.equal(r.valid, true);
    assert.equal(r.code, 'PERCENT10');
    assert.equal(r.discount, 100_000);
    assert.equal(r.message, 'ده درصد تخفیف');
  });

  it('percent coupons round and respect maxDiscount', () => {
    assert.equal(applyCoupon('PERCENT10', 123_456, COUPONS).discount, 12_346);
    assert.equal(applyCoupon('PERCENT10', 5_000_000, COUPONS).discount, 150_000);
    assert.equal(applyCoupon('PERCENT10', 1_500_000, COUPONS).discount, 150_000);
    assert.equal(applyCoupon('PERCENT10', 1_499_990, COUPONS).discount, 149_999);
  });

  it('fixed coupons deduct their value but never more than the subtotal', () => {
    assert.equal(applyCoupon('FIXEDBIG', 600_000, COUPONS).discount, 100_000);
    const capped = applyCoupon('FIXEDBIG', 30_000, COUPONS);
    assert.equal(capped.valid, true);
    assert.equal(capped.discount, 30_000);
  });

  it('enforces minTotal (inclusive)', () => {
    const tooSmall = applyCoupon('FIXED50', 400_000, COUPONS);
    assert.equal(tooSmall.valid, false);
    assert.equal(tooSmall.discount, 0);
    assert.match(tooSmall.message, /حداقل مبلغ/);

    const exact = applyCoupon('FIXED50', 500_000, COUPONS);
    assert.equal(exact.valid, true);
    assert.equal(exact.discount, 50_000);
  });

  it('treats a suspended code as unknown, so its existence does not leak', () => {
    const r = applyCoupon('SUSPENDED', 1_000_000, COUPONS);
    assert.equal(r.valid, false);
    assert.equal(r.discount, 0);
    assert.equal(r.message, 'کد تخفیف معتبر نیست');
    assert.equal(r.code, undefined);
  });

  it('rejects a code that has reached its usage limit, and accepts one below it', () => {
    const spent = applyCoupon('USEDUP', 1_000_000, COUPONS);
    assert.equal(spent.valid, false);
    assert.equal(spent.discount, 0);
    assert.equal(spent.message, 'ظرفیت استفاده از این کد تکمیل شده است');

    const room = applyCoupon('HASROOM', 1_000_000, COUPONS);
    assert.equal(room.valid, true);
    assert.equal(room.discount, 50_000);
  });

  it('treats an absent usage limit as unlimited', () => {
    const r = applyCoupon('FIXEDBIG', 1_000_000, [{ ...COUPONS[2], usedCount: 999 }]);
    assert.equal(r.valid, true);
    assert.equal(r.discount, 100_000);
  });

  it('rejects expired coupons and honours the injected clock', () => {
    const expired = applyCoupon('EXPIRED', 1_000_000, COUPONS);
    assert.equal(expired.valid, false);
    assert.equal(expired.discount, 0);
    assert.equal(expired.message, 'مهلت استفاده از این کد به پایان رسیده است');

    const backThen = applyCoupon('EXPIRED', 1_000_000, COUPONS, new Date('2019-06-01T00:00:00.000Z'));
    assert.equal(backThen.valid, true);
    assert.equal(backThen.discount, 200_000);

    const future = applyCoupon('FUTURE', 1_000_000, COUPONS);
    assert.equal(future.valid, true);
    assert.equal(future.discount, 50_000);
  });

  it('works with an empty coupon list', () => {
    assert.equal(applyCoupon('PERCENT10', 1_000_000, []).valid, false);
  });
});

// ---------------------------------------------------------------------------
// computeOrderTotals (end-to-end)
// ---------------------------------------------------------------------------

describe('computeOrderTotals', () => {
  const lines = [
    { product: { price: 1_000_000, discountPrice: 800_000 }, quantity: 2 },
    { product: { price: 500_000 }, quantity: 1 },
  ];

  it('sums quantities, list and effective prices, and adds shipping below the threshold', () => {
    const t = computeOrderTotals(lines);
    assert.equal(t.count, 3);
    assert.equal(t.listTotal, 2_500_000);
    assert.equal(t.subtotal, 2_100_000);
    assert.equal(t.productDiscount, 400_000);
    assert.equal(t.couponDiscount, 0);
    assert.equal(t.shipping, SHIPPING.cost);
    assert.equal(t.total, 2_100_000 + SHIPPING.cost);
    assert.equal(t.coupon.valid, false);
    assert.equal(t.coupon.message, '');
  });

  it('applies a valid coupon before shipping', () => {
    const t = computeOrderTotals(lines, 'percent10', COUPONS);
    assert.equal(t.couponDiscount, 150_000); // 210,000 capped by maxDiscount
    assert.equal(t.coupon.valid, true);
    assert.equal(t.coupon.code, 'PERCENT10');
    assert.equal(t.shipping, SHIPPING.cost);
    assert.equal(t.total, 2_100_000 - 150_000 + SHIPPING.cost);
  });

  it('decides free shipping on the post-coupon amount', () => {
    const big = [{ product: { price: 3_100_000 }, quantity: 1 }];
    const free = computeOrderTotals(big);
    assert.equal(free.shipping, 0);
    assert.equal(free.total, 3_100_000);

    const withCoupon = computeOrderTotals(big, 'FIXEDBIG', COUPONS);
    assert.equal(withCoupon.couponDiscount, 100_000);
    assert.equal(withCoupon.shipping, 0); // 3,000,000 is still at the threshold

    const dropped = computeOrderTotals(
      [{ product: { price: 3_050_000 }, quantity: 1 }],
      'FIXEDBIG',
      COUPONS
    );
    assert.equal(dropped.shipping, SHIPPING.cost); // 2,950,000 < threshold
    assert.equal(dropped.total, 2_950_000 + SHIPPING.cost);
  });

  it('reports invalid coupons without changing the totals', () => {
    const t = computeOrderTotals(lines, 'NOPE', COUPONS);
    assert.equal(t.couponDiscount, 0);
    assert.equal(t.coupon.valid, false);
    assert.equal(t.coupon.message, 'کد تخفیف معتبر نیست');
    assert.equal(t.total, 2_100_000 + SHIPPING.cost);
  });

  it('returns zeros for an empty cart', () => {
    const t = computeOrderTotals([]);
    assert.equal(t.count, 0);
    assert.equal(t.listTotal, 0);
    assert.equal(t.subtotal, 0);
    assert.equal(t.productDiscount, 0);
    assert.equal(t.couponDiscount, 0);
    assert.equal(t.shipping, 0);
    assert.equal(t.total, 0);
  });

  it('never lets a coupon push the total below zero', () => {
    const tiny = [{ product: { price: 20_000 }, quantity: 1 }];
    const t = computeOrderTotals(tiny, 'FIXEDBIG', COUPONS);
    assert.equal(t.couponDiscount, 20_000);
    assert.equal(t.total, 0);
  });
});
