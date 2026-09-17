'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@autolounge/shared';
import { authApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';
import { useAuth, useAuthStore } from '@/lib/store/auth-store';

/** Fresh profile from the API; keeps the persisted auth store in sync. */
export function useMe() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.me(),
    queryFn: async () => {
      const user = await unwrap(authApi.me());
      useAuthStore.getState().updateUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: { name?: string; email?: string }) => unwrap(authApi.updateProfile(patch)),
    onSuccess: (user: User) => {
      useAuthStore.getState().updateUser(user);
      qc.setQueryData(qk.me(), user);
    },
  });
}

export function useSendOtp() {
  return useMutation({ mutationFn: (phoneNumber: string) => unwrap(authApi.sendOtp(phoneNumber)) });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phoneNumber, code }: { phoneNumber: string; code: string }) =>
      unwrap(authApi.verifyOtp(phoneNumber, code)),
    onSuccess: ({ user, token }) => {
      useAuthStore.getState().login(user, token);
      qc.setQueryData(qk.me(), user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return async () => {
    await authApi.logout().catch(() => undefined);
    useAuthStore.getState().logout();
    qc.removeQueries({ queryKey: qk.me() });
    qc.removeQueries({ queryKey: qk.orders() });
    qc.removeQueries({ queryKey: qk.bookings() });
    qc.removeQueries({ queryKey: qk.addresses() });
    qc.removeQueries({ queryKey: ['admin'] });
  };
}
