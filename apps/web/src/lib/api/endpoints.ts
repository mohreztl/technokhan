import type {
  Address,
  AdminDashboardStats,
  AuthResponse,
  Booking,
  BookingStatus,
  ContactInput,
  ContactMessage,
  CouponResult,
  CreateBookingInput,
  CreateOrderInput,
  Order,
  OrderStatus,
  PaymentRequestResult,
  PaymentStatus,
  PaymentTransaction,
  PaymentVerifyResult,
  Product,
  ProductListQuery,
  Review,
  Service,
  ServiceListQuery,
  User,
} from '@autolounge/shared';
import { apiDelete, apiGet, apiPost, apiPut, buildQuery, isDemoMode } from './client';
import type { ApiResult } from './client';
import {
  demoAddresses,
  demoAdmin,
  demoAuth,
  demoBookings,
  demoContact,
  demoOrders,
  demoPayment,
  demoProducts,
  demoServices,
} from './demo';
import { useUIStore } from '@/lib/store/ui-store';

/**
 * Typed endpoint clients (docs/API.md). Each call tries the live API first;
 * when NEXT_PUBLIC_DEMO_MODE=true, or the API is unreachable (network error /
 * timeout), the localStorage demo transport answers instead and the UI store
 * flips `demoActive` so the "حالت نمایشی" banner appears.
 *
 * Demo mode is sticky for the session once triggered so a user never sees a
 * mix of live and local data.
 */

export interface OtpSendResult {
  message: string;
  expiresIn: number;
  demoCode?: string;
}

export interface AvailableSlots {
  date: string;
  serviceId: string;
  availableSlots: string[];
  bookedSlots: string[];
}

export interface PaymentStatusResult {
  paymentStatus: PaymentStatus;
  transactions: PaymentTransaction[];
}

export type AdminQuery = Record<string, unknown>;

const isBrowser = typeof window !== 'undefined';

const DEMO_SESSION_KEY = 'autolounge_demo_active';

/** Survives full reloads within the tab so we do not re-probe a dead API on every page. */
export function demoSessionFlag(): boolean {
  try {
    return isBrowser && window.sessionStorage.getItem(DEMO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function demoActive(): boolean {
  return isDemoMode() || (isBrowser && (useUIStore.getState().demoActive || demoSessionFlag()));
}

function activateDemo() {
  try {
    window.sessionStorage.setItem(DEMO_SESSION_KEY, '1');
  } catch {
    /* private mode */
  }
  if (isBrowser) useUIStore.getState().setDemoActive(true);
}

/** Leave demo mode and retry the live API on the next call. */
export function retryLiveApi() {
  try {
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* ignore */
  }
  if (isBrowser && !isDemoMode()) useUIStore.getState().setDemoActive(false);
}

export async function withDemoFallback<T>(
  live: () => Promise<ApiResult<T>>,
  demo: () => Promise<ApiResult<T>>
): Promise<ApiResult<T>> {
  if (demoActive() && isBrowser) return demo();
  const result = await live();
  if (!result.ok && result.offline && isBrowser) {
    activateDemo();
    return demo();
  }
  return result;
}

const pub = { auth: false } as const;

// ---------------------------------------------------------------------------
// catalog
// ---------------------------------------------------------------------------

export const productsApi = {
  list: (q: ProductListQuery = {}) =>
    withDemoFallback<Product[]>(
      () => apiGet(`/products${buildQuery(q as Record<string, unknown>)}`, pub),
      () => demoProducts.list(q)
    ),
  get: (id: string) =>
    withDemoFallback<Product>(
      () => apiGet(`/products/${encodeURIComponent(id)}`, pub),
      () => demoProducts.get(id)
    ),
  featured: (limit = 8) =>
    withDemoFallback<Product[]>(
      () => apiGet(`/products/featured/list?limit=${limit}`, pub),
      () => demoProducts.featured(limit)
    ),
  related: (id: string, limit = 4) =>
    withDemoFallback<Product[]>(
      () => apiGet(`/products/${encodeURIComponent(id)}/related?limit=${limit}`, pub),
      () => demoProducts.related(id, limit)
    ),
  categories: () =>
    withDemoFallback<string[]>(
      () => apiGet('/products/categories/list', pub),
      () => demoProducts.categories()
    ),
  addReview: (id: string, input: { rating: number; comment: string }) =>
    withDemoFallback<Review>(
      () => apiPost(`/products/${encodeURIComponent(id)}/reviews`, input),
      () => demoProducts.addReview(id, input)
    ),
};

export const servicesApi = {
  list: (q: ServiceListQuery = {}) =>
    withDemoFallback<Service[]>(
      () => apiGet(`/services${buildQuery(q as Record<string, unknown>)}`, pub),
      () => demoServices.list(q)
    ),
  get: (id: string) =>
    withDemoFallback<Service>(
      () => apiGet(`/services/${encodeURIComponent(id)}`, pub),
      () => demoServices.get(id)
    ),
  featured: (limit = 6) =>
    withDemoFallback<Service[]>(
      () => apiGet(`/services/featured/list?limit=${limit}`, pub),
      () => demoServices.featured(limit)
    ),
  related: (id: string, limit = 3) =>
    withDemoFallback<Service[]>(
      () => apiGet(`/services/${encodeURIComponent(id)}/related?limit=${limit}`, pub),
      () => demoServices.related(id, limit)
    ),
  categories: () =>
    withDemoFallback<string[]>(
      () => apiGet('/services/categories/list', pub),
      () => demoServices.categories()
    ),
  addReview: (id: string, input: { rating: number; comment: string }) =>
    withDemoFallback<Review>(
      () => apiPost(`/services/${encodeURIComponent(id)}/reviews`, input),
      () => demoServices.addReview(id, input)
    ),
};

// ---------------------------------------------------------------------------
// auth
// ---------------------------------------------------------------------------

export const authApi = {
  sendOtp: (phoneNumber: string) =>
    withDemoFallback<OtpSendResult>(
      () => apiPost('/auth/send-otp', { phoneNumber }, pub),
      () => demoAuth.sendOtp(phoneNumber)
    ),
  verifyOtp: (phoneNumber: string, code: string) =>
    withDemoFallback<AuthResponse>(
      () => apiPost('/auth/verify-otp', { phoneNumber, code }, pub),
      () => demoAuth.verifyOtp(phoneNumber, code)
    ),
  me: () => withDemoFallback<User>(() => apiGet('/auth/me'), () => demoAuth.me()),
  updateProfile: (patch: { name?: string; email?: string }) =>
    withDemoFallback<User>(
      () => apiPut('/auth/profile', patch),
      () => demoAuth.updateProfile(patch)
    ),
  logout: () =>
    withDemoFallback<{ message: string }>(
      () => apiPost('/auth/logout'),
      () => demoAuth.logout()
    ),
};

// ---------------------------------------------------------------------------
// bookings
// ---------------------------------------------------------------------------

export const bookingsApi = {
  availableSlots: (serviceId: string, date: string) =>
    withDemoFallback<AvailableSlots>(
      () => apiGet(`/bookings/available-slots${buildQuery({ serviceId, date })}`, pub),
      () => demoBookings.availableSlots(serviceId, date)
    ),
  create: (input: CreateBookingInput) =>
    withDemoFallback<Booking>(
      () => apiPost('/bookings', input),
      () => demoBookings.create(input)
    ),
  mine: (status?: string) =>
    withDemoFallback<Booking[]>(
      () => apiGet(`/bookings/my-bookings${buildQuery({ status })}`),
      () => demoBookings.mine(status)
    ),
  get: (id: string) =>
    withDemoFallback<Booking>(
      () => apiGet(`/bookings/${encodeURIComponent(id)}`),
      () => demoBookings.get(id)
    ),
  cancel: (id: string) =>
    withDemoFallback<Booking>(
      () => apiDelete(`/bookings/${encodeURIComponent(id)}`),
      () => demoBookings.cancel(id)
    ),
};

// ---------------------------------------------------------------------------
// orders
// ---------------------------------------------------------------------------

export const ordersApi = {
  validateCoupon: (code: string, subtotal: number) =>
    withDemoFallback<CouponResult>(
      () => apiPost('/orders/validate-coupon', { code, subtotal }, pub),
      () => demoOrders.validateCoupon(code, subtotal)
    ),
  create: (input: CreateOrderInput) =>
    withDemoFallback<Order>(
      () => apiPost('/orders', input),
      () => demoOrders.create(input)
    ),
  mine: (status?: string) =>
    withDemoFallback<Order[]>(
      () => apiGet(`/orders/my-orders${buildQuery({ status })}`),
      () => demoOrders.mine(status)
    ),
  get: (id: string) =>
    withDemoFallback<Order>(
      () => apiGet(`/orders/${encodeURIComponent(id)}`),
      () => demoOrders.get(id)
    ),
  cancel: (id: string) =>
    withDemoFallback<Order>(
      () => apiDelete(`/orders/${encodeURIComponent(id)}`),
      () => demoOrders.cancel(id)
    ),
  updateAddress: (id: string, address: Address) =>
    withDemoFallback<Order>(
      () => apiPut(`/orders/${encodeURIComponent(id)}/address`, address),
      () => demoOrders.updateAddress(id, address)
    ),
};

// ---------------------------------------------------------------------------
// payment
// ---------------------------------------------------------------------------

export const paymentApi = {
  request: (orderId: string, callbackUrl?: string) =>
    withDemoFallback<PaymentRequestResult>(
      () => apiPost('/payment/request', { orderId, callbackUrl }),
      () => demoPayment.request(orderId, callbackUrl)
    ),
  requestBooking: (bookingId: string, callbackUrl?: string) =>
    withDemoFallback<PaymentRequestResult>(
      () => apiPost('/payment/booking/request', { bookingId, callbackUrl }),
      () => demoPayment.requestBooking(bookingId, callbackUrl)
    ),
  /**
   * Verification is the call that settles money, so it deliberately does NOT use
   * withDemoFallback: a transaction created by the demo transport is settled locally,
   * and anything else must reach the API. Falling back here would report a captured
   * payment as failed and invite a second charge.
   */
  verify: (authority: string, status: 'OK' | 'NOK') =>
    isBrowser && demoPayment.has(authority)
      ? demoPayment.verify(authority, status)
      : apiPost<PaymentVerifyResult>('/payment/verify', { authority, status }, pub),
  status: (orderId: string) =>
    withDemoFallback<PaymentStatusResult>(
      () => apiGet(`/payment/status/${encodeURIComponent(orderId)}`),
      () => demoPayment.status(orderId)
    ),
  history: () =>
    withDemoFallback<PaymentTransaction[]>(
      () => apiGet('/payment/history'),
      () => demoPayment.history()
    ),
};

// ---------------------------------------------------------------------------
// addresses
// ---------------------------------------------------------------------------

export const addressesApi = {
  list: () => withDemoFallback<Address[]>(() => apiGet('/addresses'), () => demoAddresses.list()),
  create: (input: Address) =>
    withDemoFallback<Address>(() => apiPost('/addresses', input), () => demoAddresses.create(input)),
  update: (id: string, patch: Partial<Address>) =>
    withDemoFallback<Address>(
      () => apiPut(`/addresses/${encodeURIComponent(id)}`, patch),
      () => demoAddresses.update(id, patch)
    ),
  remove: (id: string) =>
    withDemoFallback<{ id: string }>(
      () => apiDelete(`/addresses/${encodeURIComponent(id)}`),
      () => demoAddresses.remove(id)
    ),
  setDefault: (id: string) =>
    withDemoFallback<Address>(
      () => apiPut(`/addresses/${encodeURIComponent(id)}/default`),
      () => demoAddresses.setDefault(id)
    ),
};

// ---------------------------------------------------------------------------
// contact
// ---------------------------------------------------------------------------

export const contactApi = {
  send: (input: ContactInput) =>
    withDemoFallback<{ id: string; message: string }>(
      () => apiPost('/contact', input, pub),
      () => demoContact.send(input)
    ),
};

// ---------------------------------------------------------------------------
// admin
// ---------------------------------------------------------------------------

export interface AdminUser extends User {
  _count?: { orders: number; bookings: number };
  orders?: Order[];
  bookings?: Booking[];
}

export interface AdminReview extends Review {
  targetType?: 'product' | 'service';
  targetId?: string;
  approved?: boolean;
  productId?: string;
  serviceId?: string;
  isApproved?: boolean;
}

export const adminApi = {
  dashboard: () =>
    withDemoFallback<AdminDashboardStats>(
      () => apiGet('/admin/dashboard'),
      () => demoAdmin.dashboard()
    ),
  products: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<Product[]>(
        () => apiGet(`/admin/products${buildQuery(q)}`),
        () => demoAdmin.products.list(q)
      ),
    create: (input: Partial<Product>) =>
      withDemoFallback<Product>(
        () => apiPost('/admin/products', input),
        () => demoAdmin.products.create(input)
      ),
    update: (id: string, patch: Partial<Product>) =>
      withDemoFallback<Product>(
        () => apiPut(`/admin/products/${encodeURIComponent(id)}`, patch),
        () => demoAdmin.products.update(id, patch)
      ),
    remove: (id: string) =>
      withDemoFallback<{ id: string }>(
        () => apiDelete(`/admin/products/${encodeURIComponent(id)}`),
        () => demoAdmin.products.remove(id)
      ),
  },
  services: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<Service[]>(
        () => apiGet(`/admin/services${buildQuery(q)}`),
        () => demoAdmin.services.list(q)
      ),
    create: (input: Partial<Service>) =>
      withDemoFallback<Service>(
        () => apiPost('/admin/services', input),
        () => demoAdmin.services.create(input)
      ),
    update: (id: string, patch: Partial<Service>) =>
      withDemoFallback<Service>(
        () => apiPut(`/admin/services/${encodeURIComponent(id)}`, patch),
        () => demoAdmin.services.update(id, patch)
      ),
    remove: (id: string) =>
      withDemoFallback<{ id: string }>(
        () => apiDelete(`/admin/services/${encodeURIComponent(id)}`),
        () => demoAdmin.services.remove(id)
      ),
  },
  orders: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<Order[]>(
        () => apiGet(`/admin/orders${buildQuery(q)}`),
        () => demoAdmin.orders.list(q)
      ),
    get: (id: string) =>
      withDemoFallback<Order>(
        () => apiGet(`/admin/orders/${encodeURIComponent(id)}`),
        () => demoAdmin.orders.get(id)
      ),
    updateStatus: (id: string, input: { status: OrderStatus; trackingCode?: string }) =>
      withDemoFallback<Order>(
        () => apiPut(`/admin/orders/${encodeURIComponent(id)}/status`, input),
        () => demoAdmin.orders.updateStatus(id, input)
      ),
  },
  bookings: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<Booking[]>(
        () => apiGet(`/admin/bookings${buildQuery(q)}`),
        () => demoAdmin.bookings.list(q)
      ),
    get: (id: string) =>
      withDemoFallback<Booking>(
        () => apiGet(`/admin/bookings/${encodeURIComponent(id)}`),
        () => demoAdmin.bookings.get(id)
      ),
    updateStatus: (id: string, input: { status: BookingStatus }) =>
      withDemoFallback<Booking>(
        () => apiPut(`/admin/bookings/${encodeURIComponent(id)}/status`, input),
        () => demoAdmin.bookings.updateStatus(id, input)
      ),
  },
  users: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<AdminUser[]>(
        () => apiGet(`/admin/users${buildQuery(q)}`),
        () => demoAdmin.users.list(q)
      ),
    get: (id: string) =>
      withDemoFallback<AdminUser>(
        () => apiGet(`/admin/users/${encodeURIComponent(id)}`),
        () => demoAdmin.users.get(id)
      ),
  },
  messages: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<ContactMessage[]>(
        () => apiGet(`/admin/messages${buildQuery(q)}`),
        () => demoAdmin.messages.list(q)
      ),
    markRead: (id: string) =>
      withDemoFallback<ContactMessage>(
        () => apiPut(`/admin/messages/${encodeURIComponent(id)}/read`),
        () => demoAdmin.messages.markRead(id)
      ),
  },
  reviews: {
    list: (q: AdminQuery = {}) =>
      withDemoFallback<AdminReview[]>(
        () => apiGet(`/admin/reviews${buildQuery(q)}`),
        () => demoAdmin.reviews.list(q)
      ),
    approve: (id: string) =>
      withDemoFallback<AdminReview>(
        () => apiPut(`/admin/reviews/${encodeURIComponent(id)}/approve`),
        () => demoAdmin.reviews.approve(id)
      ),
    remove: (id: string) =>
      withDemoFallback<{ id: string }>(
        () => apiDelete(`/admin/reviews/${encodeURIComponent(id)}`),
        () => demoAdmin.reviews.remove(id)
      ),
  },
};
