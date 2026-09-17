import { Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient | Prisma.TransactionClient;

/** Public review shape (matches shared `Review`) */
export const reviewSelect = {
  id: true,
  userId: true,
  userName: true,
  rating: true,
  comment: true,
  helpfulCount: true,
  createdAt: true,
} satisfies Prisma.ReviewSelect;

/** `include: { reviews: approvedReviews }` on Product / Service reads */
export const approvedReviews = {
  where: { isApproved: true },
  orderBy: { createdAt: 'desc' as const },
  select: reviewSelect,
};

export const productSummarySelect = {
  id: true,
  name: true,
  nameEn: true,
  images: true,
  brand: true,
} satisfies Prisma.ProductSelect;

export const serviceSummarySelect = {
  id: true,
  name: true,
  nameEn: true,
  images: true,
  duration: true,
  type: true,
} satisfies Prisma.ServiceSelect;

export const userSummarySelect = {
  id: true,
  phoneNumber: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

export const orderInclude = {
  items: { include: { product: { select: productSummarySelect } } },
  transactions: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.OrderInclude;

export const bookingInclude = {
  service: { select: serviceSummarySelect },
} satisfies Prisma.BookingInclude;

/** case-insensitive `contains` across several text columns */
export function searchFilter(search: string, fields: string[]): Record<string, unknown>[] {
  return fields.map((field) => ({ [field]: { contains: search, mode: 'insensitive' } }));
}

/** Display name for a review author (never exposes the full phone number) */
export function displayName(user: { name?: string | null; phoneNumber: string }): string {
  const name = user.name?.trim();
  if (name) return name;
  const p = user.phoneNumber;
  return `کاربر ${p.slice(0, 4)}***${p.slice(-2)}`;
}

/** Recompute `rating` / `reviewCount` from approved reviews */
export async function recomputeRating(
  db: Db,
  target: { productId?: string | null; serviceId?: string | null }
): Promise<void> {
  if (target.productId) {
    const agg = await db.review.aggregate({
      where: { productId: target.productId, isApproved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await db.product.update({
      where: { id: target.productId },
      data: { rating: round1(agg._avg.rating ?? 0), reviewCount: agg._count._all },
    });
  }
  if (target.serviceId) {
    const agg = await db.review.aggregate({
      where: { serviceId: target.serviceId, isApproved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await db.service.update({
      where: { id: target.serviceId },
      data: { rating: round1(agg._avg.rating ?? 0), reviewCount: agg._count._all },
    });
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Drop `undefined` keys so partial updates don't touch untouched columns */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as T;
}

export function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}
