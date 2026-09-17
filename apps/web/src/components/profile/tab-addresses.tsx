'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Pencil, Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import type { Address, ShippingAddressInput } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';
import { AddressCard } from '@/components/checkout/address-card';
import { AddressForm } from '@/components/checkout/address-form';
import { useAddressMutations, useAddresses } from '@/lib/hooks';

type DialogState = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; address: Address };

export function AddressesSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری آدرس‌ها">
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  );
}

export function TabAddresses() {
  const addresses = useAddresses();
  const { create, update, remove, setDefault } = useAddressMutations();
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' });
  const [deleting, setDeleting] = useState<Address | null>(null);

  const list = [...(addresses.data ?? [])].sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault));

  const handleSubmit = async (values: ShippingAddressInput) => {
    try {
      if (dialog.kind === 'edit' && dialog.address.id) {
        await update.mutateAsync({ id: dialog.address.id, patch: values });
        showToast.success('آدرس به‌روزرسانی شد');
      } else {
        await create.mutateAsync({ ...values });
        showToast.success('آدرس اضافه شد');
      }
      setDialog({ kind: 'closed' });
    } catch (e) {
      showToast.error('ذخیرهٔ آدرس ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    try {
      await remove.mutateAsync(deleting.id);
      showToast.success('آدرس حذف شد');
      setDeleting(null);
    } catch (e) {
      showToast.error('حذف آدرس ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  const makeDefault = async (address: Address) => {
    if (!address.id) return;
    try {
      await setDefault.mutateAsync(address.id);
      showToast.success('آدرس پیش‌فرض تغییر کرد');
    } catch (e) {
      showToast.error('تغییر آدرس پیش‌فرض ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">آدرس‌های من</h2>
        <Button size="sm" onClick={() => setDialog({ kind: 'create' })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          افزودن آدرس
        </Button>
      </div>

      {addresses.isLoading ? (
        <AddressesSkeleton />
      ) : addresses.isError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm">
          <p className="mb-3">دریافت آدرس‌ها ناموفق بود.</p>
          <Button variant="outline" size="sm" onClick={() => addresses.refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            تلاش دوباره
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <MapPin className="h-12 w-12 text-secondary" aria-hidden="true" />
          <div>
            <p className="font-bold">هنوز آدرسی ثبت نکرده‌اید</p>
            <p className="mt-1 text-sm text-muted-foreground">با ثبت آدرس، تسویه‌حساب سریع‌تر انجام می‌شود.</p>
          </div>
          <Button size="lg" onClick={() => setDialog({ kind: 'create' })}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            افزودن آدرس
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {list.map((address) => (
              <motion.li
                key={address.id ?? JSON.stringify(address)}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <AddressCard
                  address={address}
                  className="glass-effect"
                  actions={
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setDialog({ kind: 'edit', address })}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        ویرایش
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => makeDefault(address)}
                          loading={setDefault.isPending && setDefault.variables === address.id}
                        >
                          <Star className="h-4 w-4" aria-hidden="true" />
                          پیش‌فرض
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ms-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(address)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        حذف
                      </Button>
                    </>
                  }
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ResponsiveDialog
        open={dialog.kind !== 'closed'}
        onOpenChange={(open) => !open && setDialog({ kind: 'closed' })}
        title={dialog.kind === 'edit' ? 'ویرایش آدرس' : 'آدرس جدید'}
        snapPoints={[0.92]}
        desktopClassName="max-w-lg"
      >
        {dialog.kind !== 'closed' && (
          <AddressForm
            key={dialog.kind === 'edit' ? dialog.address.id : 'create'}
            mode="profile"
            defaultValues={dialog.kind === 'edit' ? dialog.address : undefined}
            onSubmit={handleSubmit}
            submitting={create.isPending || update.isPending}
            submitLabel={dialog.kind === 'edit' ? 'ذخیرهٔ تغییرات' : 'افزودن آدرس'}
          />
        )}
      </ResponsiveDialog>

      <ResponsiveDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف آدرس"
        description="این آدرس از دفترچهٔ آدرس‌های شما حذف می‌شود."
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={() => setDeleting(null)} disabled={remove.isPending}>
              انصراف
            </Button>
            <Button variant="destructive" size="lg" onClick={confirmDelete} loading={remove.isPending} loadingText="در حال حذف…">
              حذف
            </Button>
          </div>
        }
      >
        {deleting && <AddressCard address={deleting} compact className="bg-muted/30" />}
      </ResponsiveDialog>
    </div>
  );
}
