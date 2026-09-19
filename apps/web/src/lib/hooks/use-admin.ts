'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Booking,
  BookingStatus,
  Coupon,
  Order,
  OrderStatus,
  Pagination,
  Product,
  Service,
  SiteSettings,
} from '@autolounge/shared';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminQuery } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';
import type { ApiResult } from '@/lib/api/client';
import { useAuth } from '@/lib/store/auth-store';

interface Paged<T> {
  items: T[];
  pagination?: Pagination;
}

async function paged<T>(p: Promise<ApiResult<T[]>>): Promise<Paged<T>> {
  const r = await p;
  if (!r.ok) throw new Error(r.error);
  return { items: r.data, pagination: r.pagination };
}

function useAdminEnabled() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

export function useAdminDashboard() {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.dashboard(),
    queryFn: () => unwrap(adminApi.dashboard()),
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminProducts(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.products(q),
    queryFn: () => paged(adminApi.products.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminServices(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.services(q),
    queryFn: () => paged(adminApi.services.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrders(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.orders(q),
    queryFn: () => paged(adminApi.orders.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrder(id: string | undefined) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.order(id ?? ''),
    queryFn: () => unwrap(adminApi.orders.get(id!)),
    enabled: enabled && !!id,
  });
}

export function useAdminBookings(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.bookings(q),
    queryFn: () => paged(adminApi.bookings.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminBooking(id: string | undefined) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.booking(id ?? ''),
    queryFn: () => unwrap(adminApi.bookings.get(id!)),
    enabled: enabled && !!id,
  });
}

export function useAdminUsers(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.users(q),
    queryFn: () => paged(adminApi.users.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminMessages(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.messages(q),
    queryFn: () => paged(adminApi.messages.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminReviews(q: AdminQuery = {}) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.reviews(q),
    queryFn: () => paged(adminApi.reviews.list(q)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminCoupons() {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.coupons(),
    queryFn: () => unwrap(adminApi.coupons.list()),
    enabled,
  });
}

export function useAdminSettings() {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: qk.admin.settings(),
    queryFn: () => unwrap(adminApi.settings.get()),
    enabled,
  });
}

/** All admin write operations, each invalidating the relevant lists + dashboard. */
export function useAdminMutations() {
  const qc = useQueryClient();
  const bust = (...keys: readonly (readonly unknown[])[]) => {
    keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    qc.invalidateQueries({ queryKey: qk.admin.dashboard() });
  };

  return {
    createProduct: useMutation({
      mutationFn: (input: Partial<Product>) => unwrap(adminApi.products.create(input)),
      onSuccess: () => bust(['admin', 'products'], ['products']),
    }),
    updateProduct: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<Product> }) =>
        unwrap(adminApi.products.update(id, patch)),
      onSuccess: (_p, v) => bust(['admin', 'products'], ['products'], qk.product(v.id)),
    }),
    deleteProduct: useMutation({
      mutationFn: (id: string) => unwrap(adminApi.products.remove(id)),
      onSuccess: () => bust(['admin', 'products'], ['products']),
    }),
    createService: useMutation({
      mutationFn: (input: Partial<Service>) => unwrap(adminApi.services.create(input)),
      onSuccess: () => bust(['admin', 'services'], ['services']),
    }),
    updateService: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<Service> }) =>
        unwrap(adminApi.services.update(id, patch)),
      onSuccess: (_s, v) => bust(['admin', 'services'], ['services'], qk.service(v.id)),
    }),
    deleteService: useMutation({
      mutationFn: (id: string) => unwrap(adminApi.services.remove(id)),
      onSuccess: () => bust(['admin', 'services'], ['services']),
    }),
    updateOrderStatus: useMutation({
      mutationFn: ({ id, status, shipmentCode }: { id: string; status: OrderStatus; shipmentCode?: string }) =>
        unwrap(adminApi.orders.updateStatus(id, { status, shipmentCode })),
      onSuccess: (order: Order) => {
        qc.setQueryData(qk.admin.order(order.id), order);
        bust(['admin', 'orders'], qk.orders());
      },
    }),
    updateBookingStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
        unwrap(adminApi.bookings.updateStatus(id, { status })),
      onSuccess: (booking: Booking) => {
        qc.setQueryData(qk.admin.booking(booking.id), booking);
        bust(['admin', 'bookings'], qk.bookings());
      },
    }),
    markMessageRead: useMutation({
      mutationFn: (id: string) => unwrap(adminApi.messages.markRead(id)),
      onSuccess: () => bust(['admin', 'messages']),
    }),
    approveReview: useMutation({
      mutationFn: (id: string) => unwrap(adminApi.reviews.approve(id)),
      onSuccess: () => bust(['admin', 'reviews']),
    }),
    deleteReview: useMutation({
      mutationFn: (id: string) => unwrap(adminApi.reviews.remove(id)),
      onSuccess: () => bust(['admin', 'reviews']),
    }),
    createCoupon: useMutation({
      mutationFn: (input: Partial<Coupon>) => unwrap(adminApi.coupons.create(input)),
      onSuccess: () => bust(qk.admin.coupons()),
    }),
    updateCoupon: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<Coupon> }) =>
        unwrap(adminApi.coupons.update(id, patch)),
      onSuccess: () => bust(qk.admin.coupons()),
    }),
    deleteCoupon: useMutation({
      mutationFn: (id: string) => unwrap(adminApi.coupons.remove(id)),
      onSuccess: () => bust(qk.admin.coupons()),
    }),
    saveSettings: useMutation({
      mutationFn: (input: SiteSettings) => unwrap(adminApi.settings.update(input)),
      onSuccess: (settings: SiteSettings) => {
        qc.setQueryData(qk.admin.settings(), settings);
        // The public footer/contact and the booking calendar read the same row.
        bust(qk.settings(), ['slots']);
      },
    }),
  };
}
