import type {
  Address,
  AdminDashboardStats,
  AuthResponse,
  Booking,
  ContactInput,
  ContactMessage,
  Coupon,
  CouponResult,
  CreateBookingInput,
  CreateOrderInput,
  Order,
  Pagination,
  PaymentRequestResult,
  PaymentTransaction,
  PaymentVerifyResult,
  Product,
  ProductListQuery,
  Review,
  Service,
  ServiceListQuery,
  SiteSettings,
  TrackInput,
  TrackResult,
  User,
  VehicleSize,
} from '@technokhan/shared';
import {
  BOOKING_MAX_DAYS_AHEAD,
  BookingStatus,
  COUPONS,
  DEFAULT_SITE_SETTINGS,
  DEMO_ADMIN_PHONE,
  DEMO_OTP_CODE,
  OrderStatus,
  PaymentStatus,
  PRODUCTS,
  SERVICES,
  applyCoupon,
  computeOrderTotals,
  computeQuote,
  normalizePhoneNumber,
  normalizeTrackingCode,
  toEnglishDigits,
  trackingCodeFromId,
  trackingCodeKind,
} from '@technokhan/shared';
import type { ApiResult } from './client';
import {
  findLocalProduct,
  findLocalService,
  queryLocalProducts,
  queryLocalServices,
  relatedLocalProducts,
  relatedLocalServices,
} from '@/lib/data/local-query';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Demo transport: a localStorage-backed implementation of every
 * transactional endpoint in docs/API.md. Used when NEXT_PUBLIC_DEMO_MODE=true
 * or when the live API is unreachable. Data is scoped per browser.
 *
 * Every function returns the same `ApiResult<T>` shape as `apiFetch` so the
 * callers in `endpoints.ts` can switch transports transparently.
 */

const KEY = 'autolounge_demo';
const LATENCY: [number, number] = [180, 420];

interface DemoDb {
  users: User[];
  otps: Record<string, { code: string; expiresAt: number }>;
  bookings: Booking[];
  orders: Order[];
  transactions: PaymentTransaction[];
  addresses: (Address & { id: string; userId: string })[];
  messages: ContactMessage[];
  reviews: (Review & { targetType: 'product' | 'service'; targetId: string; approved: boolean })[];
  /** Seeded from the bundled COUPONS the first time the demo admin opens the page. */
  coupons: (Coupon & { id: string })[];
  settings: SiteSettings | null;
  catalog: {
    products: Record<string, Product>;
    services: Record<string, Service>;
    deletedProducts: string[];
    deletedServices: string[];
  };
}

const emptyDb = (): DemoDb => ({
  users: [],
  otps: {},
  bookings: [],
  orders: [],
  transactions: [],
  addresses: [],
  messages: [],
  reviews: [],
  coupons: [],
  settings: null,
  catalog: { products: {}, services: {}, deletedProducts: [], deletedServices: [] },
});

let memory: DemoDb | null = null;

function load(): DemoDb {
  if (memory) return memory;
  if (typeof window === 'undefined') return (memory = emptyDb());
  try {
    const raw = window.localStorage.getItem(KEY);
    memory = raw ? { ...emptyDb(), ...(JSON.parse(raw) as Partial<DemoDb>) } : emptyDb();
  } catch {
    memory = emptyDb();
  }
  return memory;
}

function save(db: DemoDb) {
  memory = db;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode: keep in memory only */
  }
}

function mutate<T>(fn: (db: DemoDb) => T): T {
  const db = load();
  const out = fn(db);
  save(db);
  return out;
}

/** Wipe all demo data (used by the demo banner "reset" action). */
export function resetDemoData() {
  memory = null;
  if (typeof window !== 'undefined') window.localStorage.removeItem(KEY);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const wait = () =>
  new Promise<void>((r) =>
    setTimeout(r, LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]))
  );

async function ok<T>(data: T, pagination?: Pagination): Promise<ApiResult<T>> {
  await wait();
  return { ok: true, data, pagination, status: 200 };
}

async function fail<T>(error: string, status = 400, code = 'VALIDATION_ERROR'): Promise<ApiResult<T>> {
  await wait();
  return { ok: false, error, status, code, offline: false };
}

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

function paginate<T>(items: T[], page = 1, limit = 12): { items: T[]; pagination: Pagination } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const p = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const l = Math.max(1, Number(limit) || 12);
  return {
    items: items.slice((p - 1) * l, p * l),
    pagination: { total, page: p, limit: l, totalPages, hasNext: p < totalPages, hasPrev: p > 1 },
  };
}

function currentUser(): User | null {
  return useAuthStore.getState().user;
}

function requireUser(): { user: User } | { error: ApiResult<never> } {
  const user = currentUser();
  if (!user) {
    return {
      error: {
        ok: false,
        error: 'لطفاً وارد حساب کاربری خود شوید',
        status: 401,
        code: 'UNAUTHORIZED',
        offline: false,
      },
    };
  }
  return { user };
}

function requireAdmin(): { user: User } | { error: ApiResult<never> } {
  const r = requireUser();
  if ('error' in r) return r;
  if (r.user.role !== 'admin') {
    return {
      error: { ok: false, error: 'شما دسترسی لازم را ندارید', status: 403, code: 'FORBIDDEN', offline: false },
    };
  }
  return r;
}

const servicePick = (s: Service | undefined): Booking['service'] =>
  s ? { id: s.id, name: s.name, nameEn: s.nameEn, images: s.images, duration: s.duration, type: s.type } : undefined;

const productPick = (p: Product | undefined) =>
  p ? { id: p.id, name: p.name, nameEn: p.nameEn, images: p.images, brand: p.brand } : undefined;

function byDateDesc<T extends { createdAt: unknown }>(a: T, b: T) {
  return new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime();
}

function catalogProducts(): Product[] {
  const db = load();
  const deletedProducts = db.catalog?.deletedProducts ?? [];
  const catalog = db.catalog?.products ?? {};
  const base = PRODUCTS.filter((p) => !deletedProducts.includes(p.id)).map(
    (p) => catalog[p.id] ?? p
  );
  const created = Object.values(catalog).filter((p) => !PRODUCTS.some((b) => b.id === p.id));
  return [...created, ...base];
}

function catalogServices(): Service[] {
  const db = load();
  const deletedServices = db.catalog?.deletedServices ?? [];
  const catalog = db.catalog?.services ?? {};
  const base = SERVICES.filter((s) => !deletedServices.includes(s.id)).map(
    (s) => catalog[s.id] ?? s
  );
  const created = Object.values(catalog).filter((s) => !SERVICES.some((b) => b.id === s.id));
  return [...created, ...base];
}

// ---------------------------------------------------------------------------
// catalog (reads come from the bundled catalog)
// ---------------------------------------------------------------------------

export const demoProducts = {
  // reads the admin-overridden catalog, so a product created or edited in /admin shows up here
  list: (q: ProductListQuery = {}) => {
    const { items, pagination } = queryLocalProducts(q, catalogProducts());
    return ok(items, pagination);
  },
  get: (id: string) => {
    const p = findLocalProduct(id, catalogProducts());
    return p ? ok(p) : fail<Product>('محصول یافت نشد', 404, 'NOT_FOUND');
  },
  featured: (limit = 8) => ok(catalogProducts().filter((p) => p.featured && p.isActive !== false).slice(0, limit)),
  related: (id: string, limit = 4) => ok(relatedLocalProducts(id, limit, catalogProducts())),
  categories: () => ok(Array.from(new Set(catalogProducts().map((p) => p.category)))),
  addReview: (id: string, input: { rating: number; comment: string }) =>
    demoReview('product', id, input),
};

export const demoServices = {
  // reads the admin-overridden catalog, so a service created or edited in /admin shows up here
  list: (q: ServiceListQuery = {}) => {
    const { items, pagination } = queryLocalServices(q, catalogServices());
    return ok(items, pagination);
  },
  get: (id: string) => {
    const s = findLocalService(id, catalogServices());
    return s ? ok(s) : fail<Service>('خدمت یافت نشد', 404, 'NOT_FOUND');
  },
  featured: (limit = 6) => ok(catalogServices().filter((s) => s.featured && s.isActive !== false).slice(0, limit)),
  related: (id: string, limit = 3) => ok(relatedLocalServices(id, limit, catalogServices())),
  categories: () => ok(Array.from(new Set(catalogServices().map((s) => s.type)))),
  addReview: (id: string, input: { rating: number; comment: string }) =>
    demoReview('service', id, input),
};

function demoReview(
  targetType: 'product' | 'service',
  targetId: string,
  input: { rating: number; comment: string }
): Promise<ApiResult<Review>> {
  const auth = requireUser();
  if ('error' in auth) return Promise.resolve(auth.error);
  const review = mutate((db) => {
    const r = {
      id: uid('rv'),
      userId: auth.user.id,
      userName: auth.user.name || 'کاربر اتولانژ',
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      comment: input.comment.trim(),
      createdAt: nowIso(),
      helpfulCount: 0,
      targetType,
      targetId,
      approved: false,
    };
    db.reviews.unshift(r);
    return r;
  });
  const pub: Review = { id: review.id, userId: review.userId, userName: review.userName, rating: review.rating, comment: review.comment, createdAt: review.createdAt, helpfulCount: review.helpfulCount };
  return ok(pub);
}

// ---------------------------------------------------------------------------
// auth
// ---------------------------------------------------------------------------

function tokenFor(user: User): string {
  const payload = { id: user.id, phoneNumber: user.phoneNumber, role: user.role, demo: true };
  const b64 =
    typeof window === 'undefined'
      ? Buffer.from(JSON.stringify(payload)).toString('base64')
      : window.btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return `demo.${b64.replace(/=+$/, '')}`;
}

export const demoAuth = {
  sendOtp: (phoneNumber: string) => {
    const phone = normalizePhoneNumber(phoneNumber);
    if (!/^09\d{9}$/.test(phone)) return fail<{ message: string; expiresIn: number; demoCode?: string }>('شماره موبایل معتبر نیست');
    mutate((db) => {
      db.otps[phone] = { code: DEMO_OTP_CODE, expiresAt: Date.now() + 120_000 };
    });
    return ok({ message: 'کد تأیید ارسال شد (حالت نمایشی)', expiresIn: 120, demoCode: DEMO_OTP_CODE });
  },

  verifyOtp: (phoneNumber: string, code: string) => {
    const phone = normalizePhoneNumber(phoneNumber);
    const entry = load().otps[phone];
    const normalizedCode = toEnglishDigits(code).replace(/[^0-9]/g, '');
    const valid = normalizedCode === DEMO_OTP_CODE || (entry && entry.code === normalizedCode && entry.expiresAt > Date.now());
    if (!valid) return fail<AuthResponse>('کد تأیید نادرست یا منقضی شده است', 400, 'VALIDATION_ERROR');
    const user = mutate((db) => {
      delete db.otps[phone];
      let u = db.users.find((x) => x.phoneNumber === phone);
      if (!u) {
        u = {
          id: uid('usr'),
          phoneNumber: phone,
          phone,
          role: phone === DEMO_ADMIN_PHONE ? 'admin' : 'customer',
          name: phone === DEMO_ADMIN_PHONE ? 'مدیر تکنو خان' : undefined,
          isActive: true,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        db.users.push(u);
      }
      return u;
    });
    return ok<AuthResponse>({ token: tokenFor(user), user });
  },

  me: () => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const stored = load().users.find((u) => u.id === auth.user.id) ?? auth.user;
    return ok(stored);
  },

  updateProfile: (patch: { name?: string; email?: string }) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const user = mutate((db) => {
      const idx = db.users.findIndex((u) => u.id === auth.user.id);
      const next: User = { ...(idx >= 0 ? db.users[idx] : auth.user), ...patch, updatedAt: nowIso() };
      if (idx >= 0) db.users[idx] = next;
      else db.users.push(next);
      return next;
    });
    return ok(user);
  },

  logout: () => ok({ message: 'خروج انجام شد' }),
};

// ---------------------------------------------------------------------------
// bookings
// ---------------------------------------------------------------------------

function slotHour(slot: string): number {
  // normalizePhoneNumber strips the colon, so the localized digits are parsed directly here
  const m = /^(\d{1,2}):(\d{2})/.exec(toEnglishDigits(slot));
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
}

// ---------------------------------------------------------------------------
// settings and coupons
// ---------------------------------------------------------------------------

/** The demo's settings row, created from the bundled defaults on first read. */
function settingsRow(): SiteSettings {
  return mutate((db) => (db.settings ??= structuredClone(DEFAULT_SITE_SETTINGS)));
}

/** Same for coupons — the bundled list is the demo's starting catalogue. */
function couponRows(): (Coupon & { id: string })[] {
  return mutate((db) => {
    if (db.coupons.length === 0) {
      db.coupons = COUPONS.map((c, i) => ({ ...c, id: `cpn_${i + 1}`, isActive: true, usedCount: 0 }));
    }
    return db.coupons;
  });
}

export const demoSettings = {
  get: () => ok(settingsRow()),
};

export const demoBookings = {
  availableSlots: (serviceId: string, date: string) => {
    const day = new Date(`${date}T00:00:00`);
    if (Number.isNaN(day.getTime())) return fail<never>('تاریخ معتبر نیست');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((day.getTime() - today.getTime()) / 86_400_000);
    const settings = settingsRow();
    const closed =
      settings.closedWeekdays.includes(day.getDay()) ||
      settings.closedDates.includes(date) ||
      diffDays < 0 ||
      diffDays > BOOKING_MAX_DAYS_AHEAD;
    const booked = load()
      .bookings.filter(
        (b) => b.serviceId === serviceId && String(b.date).slice(0, 10) === date && b.status !== BookingStatus.CANCELLED
      )
      .map((b) => b.timeSlot);
    const nowHour = new Date().getHours() + new Date().getMinutes() / 60;
    const availableSlots = closed
      ? []
      : settings.timeSlots.filter((s) => !booked.includes(s) && (diffDays > 0 || slotHour(s) > nowHour + 1));
    return ok({ date, serviceId, availableSlots, bookedSlots: booked });
  },

  create: (input: CreateBookingInput) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const service = findLocalService(input.serviceId, catalogServices());
    if (!service) return fail<Booking>('خدمت یافت نشد', 404, 'NOT_FOUND');
    const taken = load().bookings.some(
      (b) =>
        b.serviceId === input.serviceId &&
        String(b.date).slice(0, 10) === input.date &&
        b.timeSlot === input.timeSlot &&
        b.status !== BookingStatus.CANCELLED
    );
    if (taken) return fail<Booking>('این زمان قبلاً رزرو شده است', 409, 'CONFLICT');
    const quote = computeQuote(service, (input.vehicleSize ?? 'medium') as VehicleSize, input.addonIds ?? []);
    const booking = mutate((db) => {
      const id = uid('bk');
      const b: Booking = {
        id,
        userId: auth.user.id,
        serviceId: input.serviceId,
        service: servicePick(service),
        date: `${input.date}T00:00:00.000Z`,
        timeSlot: input.timeSlot,
        location: input.location,
        carModel: input.carModel,
        carYear: input.carYear,
        carColor: input.carColor,
        carPlate: input.carPlate,
        vehicleSize: input.vehicleSize,
        addonIds: input.addonIds ?? [],
        notes: input.notes,
        status: BookingStatus.PENDING,
        totalPrice: quote.total,
        trackingCode: trackingCodeFromId('BK', id),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.bookings.unshift(b);
      return b;
    });
    return ok(booking);
  },

  mine: (status?: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const list = load()
      .bookings.filter((b) => b.userId === auth.user.id && (!status || b.status === status))
      .sort(byDateDesc);
    return ok(list);
  },

  get: (id: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const b = load().bookings.find((x) => x.id === id && (x.userId === auth.user.id || auth.user.role === 'admin'));
    return b ? ok(b) : fail<Booking>('رزرو یافت نشد', 404, 'NOT_FOUND');
  },

  cancel: (id: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const result = mutate((db): { error: string; status: number } | { booking: Booking } => {
      const b = db.bookings.find((x) => x.id === id && x.userId === auth.user.id);
      if (!b) return { error: 'رزرو یافت نشد', status: 404 };
      if (b.status !== BookingStatus.PENDING && b.status !== BookingStatus.CONFIRMED) {
        return { error: 'این رزرو قابل لغو نیست', status: 409 };
      }
      b.status = BookingStatus.CANCELLED;
      b.updatedAt = nowIso();
      return { booking: b };
    });
    return 'booking' in result
      ? ok(result.booking)
      : fail<Booking>(result.error, result.status, result.status === 404 ? 'NOT_FOUND' : 'CONFLICT');
  },
};

// ---------------------------------------------------------------------------
// orders
// ---------------------------------------------------------------------------

export const demoOrders = {
  validateCoupon: (code: string, subtotal: number) =>
    ok<CouponResult>(applyCoupon(code, subtotal, couponRows())),

  create: (input: CreateOrderInput) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    if (!input.items?.length) return fail<Order>('سبد خرید خالی است');
    const lines = input.items.map((it) => {
      const base = findLocalProduct(it.productId, catalogProducts());
      const warranty = base?.warranties?.find((option) => option.id === it.selection?.warrantyId);
      const delta = warranty?.priceDelta ?? 0;
      const product = base ? { ...base, price: it.unitPrice ?? base.price + delta, discountPrice: it.unitPrice === undefined && base.discountPrice ? base.discountPrice + delta : undefined } : base;
      return { product, quantity: it.quantity, selection: it.selection };
    });
    const missing = lines.find((l) => !l.product);
    if (missing) return fail<Order>('یکی از محصولات موجود نیست', 404, 'NOT_FOUND');
    const quantities = lines.reduce((totals, line) => {
      const id = line.product!.id;
      totals.set(id, (totals.get(id) ?? 0) + line.quantity);
      return totals;
    }, new Map<string, number>());
    const outOfStock = lines.find((line) => line.product!.stock < (quantities.get(line.product!.id) ?? 0));
    if (outOfStock) return fail<Order>(`موجودی «${outOfStock.product!.name}» کافی نیست`, 409, 'CONFLICT');
    const totals = computeOrderTotals(
      lines.map((l) => ({ product: l.product!, quantity: l.quantity })),
      input.couponCode,
      couponRows()
    );
    const order = mutate((db) => {
      // Mirrors the API: placing the order spends one redemption.
      if (totals.coupon.valid && totals.coupon.code) {
        const spent = db.coupons.find((c) => c.code === totals.coupon.code);
        if (spent) spent.usedCount = (spent.usedCount ?? 0) + 1;
      }
      const id = uid('ord');
      const o: Order = {
        id,
        userId: auth.user.id,
        items: lines.map((l) => ({
          id: uid('oi'),
          productId: l.product!.id,
          quantity: l.quantity,
          price: l.product!.discountPrice ?? l.product!.price,
          selection: l.selection,
          product: productPick(l.product),
        })),
        subtotal: totals.subtotal,
        discount: totals.couponDiscount,
        shippingCost: totals.shipping,
        totalPrice: totals.total,
        shippingAddress: input.shippingAddress,
        status: input.paymentMethod === 'cod' ? OrderStatus.PROCESSING : OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: input.paymentMethod,
        couponCode: totals.coupon.valid ? totals.coupon.code : undefined,
        trackingCode: trackingCodeFromId('OR', id),
        notes: input.notes,
        transactions: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.orders.unshift(o);
      return o;
    });
    return ok(order);
  },

  mine: (status?: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const list = load()
      .orders.filter((o) => o.userId === auth.user.id && (!status || o.status === status))
      .sort(byDateDesc);
    return ok(list);
  },

  get: (id: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const db = load();
    const o = db.orders.find((x) => x.id === id && (x.userId === auth.user.id || auth.user.role === 'admin'));
    if (!o) return fail<Order>('سفارش یافت نشد', 404, 'NOT_FOUND');
    return ok({ ...o, transactions: db.transactions.filter((t) => t.orderId === id) });
  },

  cancel: (id: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const result = mutate((db): { error: string; status: number } | { order: Order } => {
      const o = db.orders.find((x) => x.id === id && x.userId === auth.user.id);
      if (!o) return { error: 'سفارش یافت نشد', status: 404 };
      if (o.status !== OrderStatus.PENDING) return { error: 'فقط سفارش‌های در انتظار پرداخت قابل لغو هستند', status: 409 };
      o.status = OrderStatus.CANCELLED;
      o.updatedAt = nowIso();
      return { order: o };
    });
    return 'order' in result
      ? ok(result.order)
      : fail<Order>(result.error, result.status, result.status === 404 ? 'NOT_FOUND' : 'CONFLICT');
  },

  updateAddress: (id: string, address: Address) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const o = mutate((db) => {
      const found = db.orders.find((x) => x.id === id && x.userId === auth.user.id);
      if (found) {
        found.shippingAddress = address;
        found.updatedAt = nowIso();
      }
      return found;
    });
    return o ? ok(o) : fail<Order>('سفارش یافت نشد', 404, 'NOT_FOUND');
  },
};

// ---------------------------------------------------------------------------
// payment (simulated gateway)
// ---------------------------------------------------------------------------

/** In-app mock gateway page; it redirects back to `/checkout/callback`. */
export const DEMO_GATEWAY_PATH = '/payment/demo';

function createTransaction(target: { orderId?: string; bookingId?: string }, amount: number, callbackUrl?: string) {
  const tx = mutate((db) => {
    const id = uid('tx');
    const t: PaymentTransaction = {
      id,
      ...target,
      amount,
      authority: `DEMO-${id}`,
      status: 'pending',
      gateway: 'demo',
      createdAt: nowIso(),
    };
    db.transactions.unshift(t);
    return t;
  });
  const cb = callbackUrl ?? '/checkout/callback';
  const params = new URLSearchParams({ Authority: tx.authority!, amount: String(amount), callback: cb });
  const result: PaymentRequestResult = {
    authority: tx.authority!,
    paymentUrl: `${DEMO_GATEWAY_PATH}?${params.toString()}`,
    amount,
    demo: true,
  };
  return result;
}

export const demoPayment = {
  request: (orderId: string, callbackUrl?: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const o = load().orders.find((x) => x.id === orderId && x.userId === auth.user.id);
    if (!o) return fail<PaymentRequestResult>('سفارش یافت نشد', 404, 'NOT_FOUND');
    if (o.paymentStatus === PaymentStatus.PAID) return fail<PaymentRequestResult>('این سفارش قبلاً پرداخت شده است', 409, 'CONFLICT');
    return ok(createTransaction({ orderId }, o.totalPrice, callbackUrl));
  },

  requestBooking: (bookingId: string, callbackUrl?: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const b = load().bookings.find((x) => x.id === bookingId && x.userId === auth.user.id);
    if (!b) return fail<PaymentRequestResult>('رزرو یافت نشد', 404, 'NOT_FOUND');
    return ok(createTransaction({ bookingId }, b.totalPrice, callbackUrl));
  },

  /** Whether this authority belongs to a transaction stored in the browser. */
  has: (authority: string): boolean => load().transactions.some((t) => t.authority === authority),

  verify: (authority: string, status: 'OK' | 'NOK') => {
    const result = mutate((db): PaymentVerifyResult => {
      const tx = db.transactions.find((t) => t.authority === authority);
      if (!tx) return { success: false, message: 'تراکنش یافت نشد' };
      if (tx.status === 'success') {
        return { success: true, refId: tx.refId, cardNumber: tx.cardNumber, amount: tx.amount, orderId: tx.orderId, bookingId: tx.bookingId, message: 'این تراکنش قبلاً تأیید شده است' };
      }
      if (status !== 'OK') {
        tx.status = 'failed';
        tx.errorCode = 'CANCELLED';
        tx.errorMessage = 'پرداخت توسط کاربر لغو شد';
        const o = db.orders.find((x) => x.id === tx.orderId);
        if (o) o.paymentStatus = PaymentStatus.FAILED;
        return { success: false, orderId: tx.orderId, bookingId: tx.bookingId, amount: tx.amount, message: 'پرداخت لغو شد' };
      }
      const cancelledOrder = db.orders.find((x) => x.id === tx.orderId && x.status === OrderStatus.CANCELLED);
      const cancelledBooking = db.bookings.find((x) => x.id === tx.bookingId && x.status === BookingStatus.CANCELLED);
      if (cancelledOrder || cancelledBooking) {
        tx.status = 'failed';
        tx.errorCode = 'CANCELLED';
        tx.errorMessage = 'سفارش یا رزرو پیش از پرداخت لغو شده بود';
        return {
          success: false,
          orderId: tx.orderId,
          bookingId: tx.bookingId,
          amount: tx.amount,
          message: 'این سفارش پیش از تکمیل پرداخت لغو شده بود و مبلغی کسر نشد',
        };
      }
      tx.status = 'success';
      tx.refId = String(100000000000 + Math.floor(Math.random() * 899999999999));
      tx.cardNumber = '6037-99**-****-4812';
      const o = db.orders.find((x) => x.id === tx.orderId);
      if (o) {
        o.paymentStatus = PaymentStatus.PAID;
        if (o.status === OrderStatus.PENDING) o.status = OrderStatus.PROCESSING;
        o.updatedAt = nowIso();
      }
      const b = db.bookings.find((x) => x.id === tx.bookingId);
      if (b) {
        if (b.status === BookingStatus.PENDING) b.status = BookingStatus.CONFIRMED;
        b.updatedAt = nowIso();
      }
      return { success: true, refId: tx.refId, cardNumber: tx.cardNumber, amount: tx.amount, orderId: tx.orderId, bookingId: tx.bookingId, message: 'پرداخت با موفقیت انجام شد' };
    });
    return ok(result);
  },

  status: (orderId: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const db = load();
    const o = db.orders.find((x) => x.id === orderId && x.userId === auth.user.id);
    if (!o) return fail<{ paymentStatus: PaymentStatus; transactions: PaymentTransaction[] }>('سفارش یافت نشد', 404, 'NOT_FOUND');
    return ok({ paymentStatus: o.paymentStatus, transactions: db.transactions.filter((t) => t.orderId === orderId) });
  },

  history: () => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const db = load();
    const mineOrders = new Set(db.orders.filter((o) => o.userId === auth.user.id).map((o) => o.id));
    const mineBookings = new Set(db.bookings.filter((b) => b.userId === auth.user.id).map((b) => b.id));
    return ok(db.transactions.filter((t) => (t.orderId && mineOrders.has(t.orderId)) || (t.bookingId && mineBookings.has(t.bookingId))));
  },
};

// ---------------------------------------------------------------------------
// addresses
// ---------------------------------------------------------------------------

const MAX_ADDRESSES = 5;
const stripUser = (a: Address & { id: string; userId: string }): Address => ({ id: a.id, fullName: a.fullName, phoneNumber: a.phoneNumber, province: a.province, city: a.city, address: a.address, postalCode: a.postalCode, isDefault: a.isDefault });

export const demoAddresses = {
  list: () => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    return ok(load().addresses.filter((a) => a.userId === auth.user.id).map(stripUser));
  },
  create: (input: Address) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const mine = load().addresses.filter((a) => a.userId === auth.user.id);
    if (mine.length >= MAX_ADDRESSES) return fail<Address>(`حداکثر ${MAX_ADDRESSES} آدرس می‌توانید ذخیره کنید`, 409, 'CONFLICT');
    const created = mutate((db) => {
      const a = { ...input, id: uid('adr'), userId: auth.user.id, isDefault: input.isDefault || mine.length === 0 };
      if (a.isDefault) db.addresses.forEach((x) => { if (x.userId === auth.user.id) x.isDefault = false; });
      db.addresses.push(a);
      return a;
    });
    return ok(stripUser(created));
  },
  update: (id: string, patch: Partial<Address>) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const updated = mutate((db) => {
      const a = db.addresses.find((x) => x.id === id && x.userId === auth.user.id);
      if (!a) return undefined;
      Object.assign(a, patch, { id });
      if (patch.isDefault) db.addresses.forEach((x) => { if (x.userId === auth.user.id && x.id !== id) x.isDefault = false; });
      return a;
    });
    return updated ? ok(stripUser(updated)) : fail<Address>('آدرس یافت نشد', 404, 'NOT_FOUND');
  },
  remove: (id: string) => {
    const auth = requireUser();
    if ('error' in auth) return Promise.resolve(auth.error);
    const removed = mutate((db) => {
      const idx = db.addresses.findIndex((x) => x.id === id && x.userId === auth.user.id);
      if (idx < 0) return false;
      const [gone] = db.addresses.splice(idx, 1);
      if (gone.isDefault) {
        const next = db.addresses.find((x) => x.userId === auth.user.id);
        if (next) next.isDefault = true;
      }
      return true;
    });
    return removed ? ok({ id }) : fail<{ id: string }>('آدرس یافت نشد', 404, 'NOT_FOUND');
  },
  setDefault: (id: string) => demoAddresses.update(id, { isDefault: true }),
};

// ---------------------------------------------------------------------------
// contact
// ---------------------------------------------------------------------------

export const demoContact = {
  send: (input: ContactInput) => {
    const msg = mutate((db) => {
      const m: ContactMessage = { id: uid('msg'), ...input, isRead: false, createdAt: nowIso() };
      db.messages.unshift(m);
      return m;
    });
    return ok({ id: msg.id, message: 'پیام شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم' });
  },
};

// ---------------------------------------------------------------------------
// public tracking
// ---------------------------------------------------------------------------

export const demoTrack = {
  lookup: (input: TrackInput) => {
    const code = normalizeTrackingCode(input.code);
    const phone = normalizePhoneNumber(input.phoneNumber);
    const db = load();
    // Same wording for a bad code and a mismatched phone, as the API does, so
    // neither can be used to probe for the other.
    const missing = () => fail<TrackResult>('سفارش یا رزروی با این کد و شمارهٔ موبایل پیدا نشد', 404, 'NOT_FOUND');
    const owner = (userId: string) => db.users.find((u) => u.id === userId)?.phoneNumber ?? '';

    if (trackingCodeKind(code) === 'booking') {
      const booking = db.bookings.find((b) => (b.trackingCode ?? trackingCodeFromId('BK', b.id)) === code);
      if (!booking || normalizePhoneNumber(owner(booking.userId)) !== phone) return missing();
      return ok<TrackResult>({
        kind: 'booking',
        code,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        totalPrice: booking.totalPrice,
        serviceName: booking.service?.name ?? findLocalService(booking.serviceId, catalogServices())?.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
      });
    }

    const order = db.orders.find((o) => (o.trackingCode ?? trackingCodeFromId('OR', o.id)) === code);
    const shipTo = order?.shippingAddress?.phoneNumber ?? '';
    if (!order || ![owner(order.userId), shipTo].map((p) => normalizePhoneNumber(p)).includes(phone)) return missing();
    return ok<TrackResult>({
      kind: 'order',
      code,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      totalPrice: order.totalPrice,
      itemCount: order.items.length,
      shipmentCode: order.shipmentCode,
      destination: [order.shippingAddress?.province, order.shippingAddress?.city].filter(Boolean).join('، ') || undefined,
    });
  },
};

// ---------------------------------------------------------------------------
// admin
// ---------------------------------------------------------------------------

type Q = Record<string, unknown>;
const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
const num = (v: unknown, d: number) => (v === undefined || v === null || v === '' ? d : Number(v));
const includesFa = (hay: string, needle: string) => hay.toLowerCase().includes(needle.toLowerCase());

export const demoAdmin = {
  dashboard: () => {
    const auth = requireAdmin();
    if ('error' in auth) return Promise.resolve(auth.error);
    const db = load();
    const stats: AdminDashboardStats = {
      users: db.users.length,
      orders: db.orders.length,
      bookings: db.bookings.length,
      products: catalogProducts().length,
      services: catalogServices().length,
      revenue: db.orders.filter((o) => o.paymentStatus === PaymentStatus.PAID).reduce((s, o) => s + o.totalPrice, 0),
      pendingOrders: db.orders.filter((o) => o.status === OrderStatus.PENDING).length,
      pendingBookings: db.bookings.filter((b) => b.status === BookingStatus.PENDING).length,
      unreadMessages: db.messages.filter((m) => !m.isRead).length,
      recentOrders: [...db.orders].sort(byDateDesc).slice(0, 5),
      recentBookings: [...db.bookings].sort(byDateDesc).slice(0, 5),
    };
    return ok(stats);
  },

  products: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      let items = catalogProducts();
      const search = str(q.search);
      if (search) items = items.filter((p) => includesFa(`${p.name} ${p.nameEn} ${p.brand ?? ''}`, search));
      if (q.category) items = items.filter((p) => p.category === q.category);
      if (q.isActive !== undefined && q.isActive !== '') items = items.filter((p) => (p.isActive !== false) === (String(q.isActive) === 'true'));
      const { items: page, pagination } = paginate(items, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    create: (input: Partial<Product>) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const id = input.id || uid('prd');
      const product = mutate((db) => {
        const p = {
          rating: 0,
          reviewCount: 0,
          reviews: [],
          images: [],
          stock: 0,
          featured: false,
          isActive: true,
          ...input,
          id,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        } as Product;
        db.catalog.products[id] = p;
        db.catalog.deletedProducts = db.catalog.deletedProducts.filter((x) => x !== id);
        return p;
      });
      return ok(product);
    },
    update: (id: string, patch: Partial<Product>) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const base = catalogProducts().find((p) => p.id === id);
      if (!base) return fail<Product>('محصول یافت نشد', 404, 'NOT_FOUND');
      const product = mutate((db) => (db.catalog.products[id] = { ...base, ...patch, id, updatedAt: nowIso() }));
      return ok(product);
    },
    remove: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      mutate((db) => {
        delete db.catalog.products[id];
        if (!db.catalog.deletedProducts.includes(id)) db.catalog.deletedProducts.push(id);
      });
      return ok({ id });
    },
  },

  services: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      let items = catalogServices();
      const search = str(q.search);
      if (search) items = items.filter((s) => includesFa(`${s.name} ${s.nameEn}`, search));
      if (q.type) items = items.filter((s) => s.type === q.type);
      const { items: page, pagination } = paginate(items, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    create: (input: Partial<Service>) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const id = input.id || uid('svc');
      const service = mutate((db) => {
        const s = {
          rating: 0,
          reviewCount: 0,
          reviews: [],
          images: [],
          featured: false,
          isActive: true,
          ...input,
          id,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        } as Service;
        db.catalog.services[id] = s;
        db.catalog.deletedServices = db.catalog.deletedServices.filter((x) => x !== id);
        return s;
      });
      return ok(service);
    },
    update: (id: string, patch: Partial<Service>) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const base = catalogServices().find((s) => s.id === id);
      if (!base) return fail<Service>('خدمت یافت نشد', 404, 'NOT_FOUND');
      const service = mutate((db) => (db.catalog.services[id] = { ...base, ...patch, id, updatedAt: nowIso() }));
      return ok(service);
    },
    remove: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      mutate((db) => {
        delete db.catalog.services[id];
        if (!db.catalog.deletedServices.includes(id)) db.catalog.deletedServices.push(id);
      });
      return ok({ id });
    },
  },

  orders: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const db = load();
      let items = [...db.orders].sort(byDateDesc);
      if (q.status) items = items.filter((o) => o.status === q.status);
      const search = str(q.search);
      if (search)
        items = items.filter((o) =>
          includesFa(
            `${o.id} ${o.trackingCode ?? ''} ${o.shipmentCode ?? ''} ${o.shippingAddress?.fullName ?? ''} ${o.shippingAddress?.phoneNumber ?? ''}`,
            search
          )
        );
      const { items: page, pagination } = paginate(items, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    get: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const db = load();
      const o = db.orders.find((x) => x.id === id);
      return o ? ok({ ...o, transactions: db.transactions.filter((t) => t.orderId === id) }) : fail<Order>('سفارش یافت نشد', 404, 'NOT_FOUND');
    },
    updateStatus: (id: string, input: { status: OrderStatus; shipmentCode?: string }) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const o = mutate((db) => {
        const found = db.orders.find((x) => x.id === id);
        if (found) {
          found.status = input.status;
          if (input.shipmentCode !== undefined) found.shipmentCode = input.shipmentCode || undefined;
          if (input.status === OrderStatus.DELIVERED && found.paymentMethod === 'cod') found.paymentStatus = PaymentStatus.PAID;
          found.updatedAt = nowIso();
        }
        return found;
      });
      return o ? ok(o) : fail<Order>('سفارش یافت نشد', 404, 'NOT_FOUND');
    },
  },

  bookings: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      let items = [...load().bookings].sort(byDateDesc);
      if (q.status) items = items.filter((b) => b.status === q.status);
      if (q.date) items = items.filter((b) => String(b.date).slice(0, 10) === String(q.date));
      const { items: page, pagination } = paginate(items, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    get: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const b = load().bookings.find((x) => x.id === id);
      return b ? ok(b) : fail<Booking>('رزرو یافت نشد', 404, 'NOT_FOUND');
    },
    updateStatus: (id: string, input: { status: BookingStatus }) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const b = mutate((db) => {
        const found = db.bookings.find((x) => x.id === id);
        if (found) {
          found.status = input.status;
          found.updatedAt = nowIso();
        }
        return found;
      });
      return b ? ok(b) : fail<Booking>('رزرو یافت نشد', 404, 'NOT_FOUND');
    },
  },

  users: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const db = load();
      let items = [...db.users].sort(byDateDesc);
      const search = str(q.search);
      if (search) items = items.filter((u) => includesFa(`${u.name ?? ''} ${u.phoneNumber} ${u.email ?? ''}`, search));
      const withCounts = items.map((u) => ({
        ...u,
        _count: {
          orders: db.orders.filter((o) => o.userId === u.id).length,
          bookings: db.bookings.filter((b) => b.userId === u.id).length,
        },
      }));
      const { items: page, pagination } = paginate(withCounts, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    get: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const db = load();
      const u = db.users.find((x) => x.id === id);
      if (!u) return fail<User>('کاربر یافت نشد', 404, 'NOT_FOUND');
      return ok({
        ...u,
        orders: db.orders.filter((o) => o.userId === id),
        bookings: db.bookings.filter((b) => b.userId === id),
      });
    },
  },

  messages: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      let items = [...load().messages].sort(byDateDesc);
      if (q.unread !== undefined && q.unread !== '') items = items.filter((m) => !m.isRead === (String(q.unread) === 'true'));
      const { items: page, pagination } = paginate(items, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    markRead: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const m = mutate((db) => {
        const found = db.messages.find((x) => x.id === id);
        if (found) found.isRead = true;
        return found;
      });
      return m ? ok(m) : fail<ContactMessage>('پیام یافت نشد', 404, 'NOT_FOUND');
    },
  },

  coupons: {
    list: () => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      return ok([...couponRows()].reverse());
    },
    create: (input: Partial<Coupon>) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const code = String(input.code ?? '').trim().toUpperCase();
      if (couponRows().some((c) => c.code === code)) {
        return fail<Coupon>('کد تخفیف با این عنوان از قبل وجود دارد', 409, 'CONFLICT');
      }
      const coupon = mutate((db) => {
        const c = {
          type: 'percent',
          value: 0,
          description: '',
          ...input,
          code,
          id: uid('cpn'),
          isActive: input.isActive ?? true,
          usedCount: 0,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        } as Coupon & { id: string };
        db.coupons.push(c);
        return c;
      });
      return ok(coupon);
    },
    update: (id: string, patch: Partial<Coupon>) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const rows = couponRows();
      const current = rows.find((c) => c.id === id);
      if (!current) return fail<Coupon>('کد تخفیف پیدا نشد', 404, 'NOT_FOUND');
      const code = patch.code ? patch.code.trim().toUpperCase() : current.code;
      if (rows.some((c) => c.code === code && c.id !== id)) {
        return fail<Coupon>('کد تخفیف با این عنوان از قبل وجود دارد', 409, 'CONFLICT');
      }
      const coupon = mutate((db) => {
        const row = db.coupons.find((c) => c.id === id)!;
        Object.assign(row, patch, { code, id, updatedAt: nowIso() });
        return row;
      });
      return ok(coupon);
    },
    remove: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      couponRows();
      mutate((db) => {
        db.coupons = db.coupons.filter((c) => c.id !== id);
      });
      return ok({ id });
    },
  },

  settings: {
    get: () => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      return ok(settingsRow());
    },
    update: (input: SiteSettings) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const next = mutate((db) => (db.settings = { ...input, updatedAt: nowIso() }));
      return ok(next);
    },
  },

  reviews: {
    list: (q: Q = {}) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      let items = [...load().reviews].sort(byDateDesc);
      if (q.approved !== undefined && q.approved !== '') items = items.filter((r) => r.approved === (String(q.approved) === 'true'));
      const { items: page, pagination } = paginate(items, num(q.page, 1), num(q.limit, 20));
      return ok(page, pagination);
    },
    approve: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      const r = mutate((db) => {
        const found = db.reviews.find((x) => x.id === id);
        if (found) found.approved = true;
        return found;
      });
      return r ? ok(r) : fail<Review>('نظر یافت نشد', 404, 'NOT_FOUND');
    },
    remove: (id: string) => {
      const auth = requireAdmin();
      if ('error' in auth) return Promise.resolve(auth.error);
      mutate((db) => {
        db.reviews = db.reviews.filter((x) => x.id !== id);
      });
      return ok({ id });
    },
  },
};
