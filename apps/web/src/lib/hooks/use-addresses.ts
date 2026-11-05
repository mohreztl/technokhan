'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Address } from '@technokhan/shared';
import { addressesApi } from '@/lib/api/endpoints';
import { qk } from '@/lib/api/query-keys';
import { unwrap } from '@/lib/api/client';
import { useAuth } from '@/lib/store/auth-store';

export function useAddresses() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.addresses(),
    queryFn: () => unwrap(addressesApi.list()),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useAddressMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.addresses() });

  const create = useMutation({
    mutationFn: (input: Address) => unwrap(addressesApi.create(input)),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Address> }) =>
      unwrap(addressesApi.update(id, patch)),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => unwrap(addressesApi.remove(id)),
    onSuccess: invalidate,
  });
  const setDefault = useMutation({
    mutationFn: (id: string) => unwrap(addressesApi.setDefault(id)),
    onSuccess: invalidate,
  });

  return { create, update, remove, setDefault };
}
