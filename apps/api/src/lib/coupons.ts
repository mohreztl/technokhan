import type { Coupon } from '@technokhan/shared';

import { prisma } from './prisma';

/**
 * Coupons for `applyCoupon`. Only the codes an admin has left active are
 * loaded; the rules about expiry and usage limits are applied by the shared
 * pricing helper so the web and the API agree on every answer.
 */
export async function activeCoupons(): Promise<Coupon[]> {
  const rows = await prisma.coupon.findMany({ where: { isActive: true } });
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    description: row.description,
    minTotal: row.minTotal ?? undefined,
    maxDiscount: row.maxDiscount ?? undefined,
    expiresAt: row.expiresAt ?? undefined,
    isActive: row.isActive,
    usageLimit: row.usageLimit ?? undefined,
    usedCount: row.usedCount,
  }));
}
