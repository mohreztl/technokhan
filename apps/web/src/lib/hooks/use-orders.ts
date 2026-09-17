'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Address, CreateOrderInput, Order } from '@autolounge/shared';
import { ordersApi, paymentApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';
import { useAuth } from '@/lib/store/auth-store';

export function useMyOrders(status?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...qk.orders(), status ?? 'all'],
    queryFn: () => unwrap(ordersApi.mine(status)),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useOrder(id: string | undefined) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.order(id ?? ''),
    queryFn: () => unwrap(ordersApi.get(id!)),
    enabled: isAuthenticated && !!id,
    staleTime: 15_000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => unwrap(ordersApi.create(input)),
    onSuccess: (order: Order) => {
      qc.invalidateQueries({ queryKey: qk.orders() });
      qc.setQueryData(qk.order(order.id), order);
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(ordersApi.cancel(id)),
    onSuccess: (order: Order) => {
      qc.invalidateQueries({ queryKey: qk.orders() });
      qc.setQueryData(qk.order(order.id), order);
    },
  });
}

export function useUpdateOrderAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Address }) =>
      unwrap(ordersApi.updateAddress(id, address)),
    onSuccess: (order: Order) => qc.setQueryData(qk.order(order.id), order),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      unwrap(ordersApi.validateCoupon(code, subtotal)),
  });
}

/** Starts a Zarinpal (or demo) payment for an order and returns the redirect URL. */
export function useRequestPayment() {
  return useMutation({
    mutationFn: ({ orderId, callbackUrl }: { orderId: string; callbackUrl?: string }) =>
      unwrap(paymentApi.request(orderId, callbackUrl)),
  });
}

export function useRequestBookingPayment() {
  return useMutation({
    mutationFn: ({ bookingId, callbackUrl }: { bookingId: string; callbackUrl?: string }) =>
      unwrap(paymentApi.requestBooking(bookingId, callbackUrl)),
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ authority, status }: { authority: string; status: 'OK' | 'NOK' }) =>
      unwrap(paymentApi.verify(authority, status)),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: qk.orders() });
      qc.invalidateQueries({ queryKey: qk.bookings() });
      if (r.orderId) qc.invalidateQueries({ queryKey: qk.order(r.orderId) });
      if (r.bookingId) qc.invalidateQueries({ queryKey: qk.booking(r.bookingId) });
    },
  });
}

export function usePaymentStatus(orderId: string | undefined) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.paymentStatus(orderId ?? ''),
    queryFn: () => unwrap(paymentApi.status(orderId!)),
    enabled: isAuthenticated && !!orderId,
  });
}
