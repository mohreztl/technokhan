'use client';

import { useState } from 'react';
import { MapPin, Plus, RefreshCw } from 'lucide-react';
import type { Address, ShippingAddressInput } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { fieldErrorClass } from '@/components/ui/input';
import { showToast } from '@/components/ui/toaster';
import { useAddressMutations } from '@/lib/hooks';
import { AddressCard } from './address-card';
import { AddressForm } from './address-form';

export interface StepAddressProps {
  addresses: Address[];
  loading: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  selected: Address | null;
  onSelect: (address: Address) => void;
  /** a freshly created address (saved or one-off) — the flow selects it */
  onCreated: (address: Address) => void;
  error?: string | null;
}

/** Checkout step ۱ — pick a saved address or add a new one. */
export function StepAddress({
  addresses,
  loading,
  loadError,
  onRetry,
  selected,
  onSelect,
  onCreated,
  error,
}: StepAddressProps) {
  const [open, setOpen] = useState(false);
  const { create } = useAddressMutations();

  const handleSubmit = async (values: ShippingAddressInput, { save }: { save: boolean }) => {
    try {
      if (save) {
        const created = await create.mutateAsync({ ...values });
        onCreated(created);
        showToast.success('آدرس ذخیره شد');
      } else {
        onCreated({ ...values, id: `local-${Date.now()}` });
      }
      setOpen(false);
    } catch (e) {
      showToast.error('ذخیرهٔ آدرس ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  const selectedKey = selected ? (selected.id ?? JSON.stringify(selected)) : null;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری آدرس‌ها">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-center text-sm">
          <p className="mb-3">{loadError}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              تلاش دوباره
            </Button>
          )}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-6 text-center">
          <MapPin className="h-10 w-10 text-secondary" aria-hidden="true" />
          <div>
            <p className="font-bold">هنوز آدرسی ثبت نکرده‌اید</p>
            <p className="mt-1 text-sm text-muted-foreground">برای ارسال سفارش، آدرس گیرنده را وارد کنید.</p>
          </div>
          <Button size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            افزودن آدرس
          </Button>
        </div>
      ) : (
        <div role="radiogroup" aria-label="آدرس ارسال" className="space-y-3">
          {addresses.map((address) => {
            const key = address.id ?? JSON.stringify(address);
            return (
              <AddressCard
                key={key}
                address={address}
                selected={key === selectedKey}
                onSelect={() => onSelect(address)}
              />
            );
          })}
          <Button variant="outline" size="lg" className="w-full border-dashed" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            افزودن آدرس جدید
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className={fieldErrorClass}>
          {error}
        </p>
      )}

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="آدرس جدید"
        description="اطلاعات گیرنده و آدرس ارسال را وارد کنید."
        snapPoints={[0.92]}
        desktopClassName="max-w-lg"
      >
        <AddressForm mode="checkout" onSubmit={handleSubmit} submitting={create.isPending} submitLabel="استفاده از این آدرس" />
      </ResponsiveDialog>
    </div>
  );
}
