'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Booking, CreateBookingInput } from '@technokhan/shared';
import { bookingsApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';
import { useAuth } from '@/lib/store/auth-store';

export function useMyBookings(status?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...qk.bookings(), status ?? 'all'],
    queryFn: () => unwrap(bookingsApi.mine(status)),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useBooking(id: string | undefined) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.booking(id ?? ''),
    queryFn: () => unwrap(bookingsApi.get(id!)),
    enabled: isAuthenticated && !!id,
  });
}

/** Available time slots for a service on a Gregorian `yyyy-MM-dd` date. */
export function useAvailableSlots(serviceId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: qk.slots(serviceId ?? '', date ?? ''),
    queryFn: () => unwrap(bookingsApi.availableSlots(serviceId!, date!)),
    enabled: !!serviceId && !!date,
    staleTime: 20_000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => unwrap(bookingsApi.create(input)),
    onSuccess: (booking: Booking) => {
      qc.invalidateQueries({ queryKey: qk.bookings() });
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.setQueryData(qk.booking(booking.id), booking);
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(bookingsApi.cancel(id)),
    onSuccess: (booking: Booking) => {
      qc.invalidateQueries({ queryKey: qk.bookings() });
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.setQueryData(qk.booking(booking.id), booking);
    },
  });
}
