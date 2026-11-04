/* eslint-disable no-console */
/**
 * Idempotent seed: catalog (PRODUCTS / SERVICES from @autolounge/shared, slug ids),
 * their reviews (approved, attached to synthetic "system" customer users) and the admin user.
 *
 * Run with `pnpm --filter api db:seed` (prisma db seed → tsx prisma/seed.ts).
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  BOOKING_TIME_SLOTS,
  CLOSED_WEEKDAYS,
  CONTACT,
  COUPONS,
  DEMO_ADMIN_PHONE,
  PRODUCTS,
  SERVICES,
  SOCIAL_MEDIA,
} from '@autolounge/shared';
import type { Product, Review, Service } from '@autolounge/shared';

dotenv.config({ quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ADMIN_PHONE = process.env.ADMIN_PHONE || DEMO_ADMIN_PHONE || '09120000000';

type JsonField = Prisma.InputJsonValue | typeof Prisma.DbNull;

function json(value: unknown): JsonField {
  return value === undefined || value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Deterministic synthetic phone for a reviewer name: 0900 + 7 digits */
function reviewerPhone(name: string): string {
  let h = 7;
  for (const ch of name) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return `0900${String(h % 10_000_000).padStart(7, '0')}`;
}

function productData(p: Product): Omit<Prisma.ProductUncheckedCreateInput, 'id'> {
  return {
    name: p.name,
    nameEn: p.nameEn,
    description: p.description,
    descriptionEn: p.descriptionEn,
    shortDescription: p.shortDescription ?? null,
    price: p.price,
    discountPrice: p.discountPrice ?? null,
    category: p.category,
    images: p.images ?? [],
    stock: p.stock ?? 0,
    featured: Boolean(p.featured),
    isActive: p.isActive ?? true,
    brand: p.brand ?? null,
    sku: p.sku ?? null,
    specifications: json(p.specifications),
    features: p.features ?? [],
    tags: p.tags ?? [],
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? p.reviews?.length ?? 0,
    colors: json(p.colors),
    warranties: json(p.warranties),
    salesCount: p.salesCount ?? 0,
    editorChoice: p.editorChoice ?? false,
    dealEndsAt: toDate(p.dealEndsAt) ?? null,
  };
}

function serviceData(s: Service): Omit<Prisma.ServiceUncheckedCreateInput, 'id'> {
  return {
    name: s.name,
    nameEn: s.nameEn,
    description: s.description,
    descriptionEn: s.descriptionEn,
    shortDescription: s.shortDescription ?? null,
    price: s.price,
    duration: s.duration,
    type: s.type,
    images: s.images ?? [],
    featured: Boolean(s.featured),
    isActive: s.isActive ?? true,
    features: s.features ?? [],
    steps: json(s.steps),
    faq: json(s.faq),
    pricing: json(s.pricing),
    addons: json(s.addons),
    gallery: s.gallery ?? [],
    beforeAfter: json(s.beforeAfter),
    warrantyMonths: s.warrantyMonths ?? null,
    tags: s.tags ?? [],
    rating: s.rating ?? 0,
    reviewCount: s.reviewCount ?? s.reviews?.length ?? 0,
  };
}

const reviewerCache = new Map<string, string>();

async function reviewerUserId(userName: string): Promise<string> {
  const name = userName.trim() || 'کاربر اتولانژ';
  const cached = reviewerCache.get(name);
  if (cached) return cached;
  const phoneNumber = reviewerPhone(name);
  const user = await prisma.user.upsert({
    where: { phoneNumber },
    create: { phoneNumber, name, role: 'customer' },
    update: { name },
    select: { id: true },
  });
  reviewerCache.set(name, user.id);
  return user.id;
}

async function seedReviews(
  owner: { productId?: string; serviceId?: string },
  reviews: Review[] | undefined
): Promise<number> {
  if (!reviews?.length) return 0;
  const ownerId = owner.productId ?? owner.serviceId ?? '';
  let count = 0;

  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    const id = `${ownerId}--${r.id || `r${i + 1}`}`;
    const userId = await reviewerUserId(r.userName);
    const data = {
      userId,
      userName: r.userName,
      productId: owner.productId ?? null,
      serviceId: owner.serviceId ?? null,
      rating: Math.min(5, Math.max(1, Math.round(r.rating))),
      comment: r.comment,
      helpfulCount: r.helpfulCount ?? 0,
      isApproved: true,
    };
    await prisma.review.upsert({
      where: { id },
      create: { id, ...data, createdAt: toDate(r.createdAt) },
      update: data,
    });
    count++;
  }

  // keep the denormalised rating in sync with the approved reviews
  const agg = await prisma.review.aggregate({
    where: { ...(owner.productId ? { productId: owner.productId } : { serviceId: owner.serviceId }), isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const rating = Math.round((agg._avg.rating ?? 0) * 10) / 10;
  if (owner.productId) {
    await prisma.product.update({ where: { id: owner.productId }, data: { rating, reviewCount: agg._count._all } });
  } else if (owner.serviceId) {
    await prisma.service.update({ where: { id: owner.serviceId }, data: { rating, reviewCount: agg._count._all } });
  }
  return count;
}

async function main() {
  console.log(`Seeding TechnoKhan (${PRODUCTS.length} products)…`);

  await prisma.product.updateMany({
    where: { id: { notIn: PRODUCTS.map((product) => product.id) } },
    data: { isActive: false },
  });

  let productCount = 0;
  let serviceCount = 0;
  let reviewCount = 0;

  for (const p of PRODUCTS) {
    const data = productData(p);
    await prisma.product.upsert({
      where: { id: p.id },
      create: { id: p.id, ...data, createdAt: toDate(p.createdAt) },
      update: data,
    });
    productCount++;
    reviewCount += await seedReviews({ productId: p.id }, p.reviews);
  }

  for (const s of SERVICES) {
    const data = serviceData(s);
    await prisma.service.upsert({
      where: { id: s.id },
      create: { id: s.id, ...data, createdAt: toDate(s.createdAt) },
      update: data,
    });
    serviceCount++;
    reviewCount += await seedReviews({ serviceId: s.id }, s.reviews);
  }

  // Coupons and settings used to be constants. Seeding them from those same
  // constants means a fresh database behaves exactly as the hard-coded values
  // did, and an admin can take it from there.
  for (const c of COUPONS) {
    const data = {
      type: c.type,
      value: c.value,
      description: c.description,
      minTotal: c.minTotal ?? null,
      maxDiscount: c.maxDiscount ?? null,
      expiresAt: c.expiresAt ? new Date(c.expiresAt) : null,
    };
    await prisma.coupon.upsert({
      where: { code: c.code },
      create: { code: c.code, ...data },
      // `isActive`, `usageLimit` and `usedCount` are the admin's to manage; re-seeding must not undo that.
      update: data,
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      closedWeekdays: [...CLOSED_WEEKDAYS],
      timeSlots: [...BOOKING_TIME_SLOTS],
      phone: CONTACT.phoneEn,
      mobile: CONTACT.mobileEn,
      email: CONTACT.email,
      address: CONTACT.address,
      workingHours: CONTACT.workingHours,
      instagram: SOCIAL_MEDIA.instagram,
      telegram: SOCIAL_MEDIA.telegram,
      whatsapp: SOCIAL_MEDIA.whatsapp,
    },
    update: {},
  });

  const admin = await prisma.user.upsert({
    where: { phoneNumber: ADMIN_PHONE },
    create: { phoneNumber: ADMIN_PHONE, role: 'admin', name: 'مدیر اتولانژ', isActive: true },
    update: { role: 'admin', isActive: true },
    select: { id: true, phoneNumber: true },
  });

  console.log(
    [
      `products: ${productCount}`,
      `services: ${serviceCount}`,
      `reviews: ${reviewCount}`,
      `reviewer users: ${reviewerCache.size}`,
      `coupons: ${COUPONS.length}`,
      `admin: ${admin.phoneNumber} (${admin.id})`,
    ].join('\n')
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
