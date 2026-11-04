'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, User } from 'lucide-react';
import type { Address, ShippingAddressInput } from '@autolounge/shared';
import { PROVINCES, shippingAddressSchema } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/store/auth-store';

const PROVINCE_OPTIONS = PROVINCES.map((p) => ({ value: p, label: p }));

export interface AddressFormProps {
  /** form element id — lets a dialog footer button submit via `form={id}` */
  id?: string;
  defaultValues?: Partial<Address>;
  /** `checkout` shows «ذخیره برای بعد»; `profile` shows «آدرس پیش‌فرض» */
  mode?: 'checkout' | 'profile';
  onSubmit: (values: ShippingAddressInput, options: { save: boolean }) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  /** render the submit button inside the form (default true) */
  showSubmit?: boolean;
}

/**
 * Shipping-address form (react-hook-form + `shippingAddressSchema`). Shared by
 * the checkout «افزودن آدرس جدید» dialog and the profile address book.
 */
export function AddressForm({
  id = 'address-form',
  defaultValues,
  mode = 'checkout',
  onSubmit,
  submitting,
  submitLabel = 'ذخیرهٔ آدرس',
  showSubmit = true,
}: AddressFormProps) {
  const { user } = useAuth();
  const [save, setSave] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? user?.name ?? '',
      phoneNumber: defaultValues?.phoneNumber ?? user?.phoneNumber ?? '',
      province: defaultValues?.province ?? '',
      city: defaultValues?.city ?? '',
      address: defaultValues?.address ?? '',
      postalCode: defaultValues?.postalCode ?? '',
      isDefault: defaultValues?.isDefault ?? false,
    },
  });

  return (
    <form
      id={id}
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values, { save }))}
      className="space-y-4"
    >
      <Input
        label="نام و نام خانوادگی گیرنده"
        required
        autoComplete="name"
        placeholder="مثلاً علی رضایی"
        startIcon={<User className="h-5 w-5" aria-hidden="true" />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="شماره موبایل"
        required
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        placeholder="09xxxxxxxxx"
        startIcon={<Phone className="h-5 w-5" aria-hidden="true" />}
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="استان"
          required
          autoComplete="address-level1"
          options={PROVINCE_OPTIONS}
          placeholder="انتخاب استان"
          error={errors.province?.message}
          {...register('province')}
        />
        <Input
          label="شهر"
          required
          autoComplete="address-level2"
          placeholder="مثلاً تهران"
          error={errors.city?.message}
          {...register('city')}
        />
      </div>
      <Textarea
        label="آدرس کامل"
        required
        rows={3}
        maxLength={300}
        autoComplete="street-address"
        placeholder="خیابان، کوچه، پلاک، واحد"
        startIcon={<MapPin className="h-5 w-5" aria-hidden="true" />}
        error={errors.address?.message}
        {...register('address')}
      />
      <Input
        label="کد پستی"
        required
        inputMode="numeric"
        dir="ltr"
        maxLength={10}
        autoComplete="postal-code"
        placeholder="۱۰ رقم"
        hint="بدون خط تیره یا فاصله"
        error={errors.postalCode?.message}
        {...register('postalCode')}
      />

      {mode === 'checkout' ? (
        <Checkbox
          variant="row"
          label="ذخیره برای بعد"
          description="این آدرس به دفترچهٔ آدرس‌های شما اضافه می‌شود"
          checked={save}
          onChange={(e) => setSave(e.target.checked)}
        />
      ) : (
        <Checkbox
          variant="row"
          label="آدرس پیش‌فرض"
          description="برای سفارش‌های بعدی به‌صورت خودکار انتخاب می‌شود"
          {...register('isDefault')}
        />
      )}

      {showSubmit && (
        <Button type="submit" size="lg" className="w-full" loading={submitting || isSubmitting} loadingText="در حال ذخیره…">
          {submitLabel}
        </Button>
      )}
    </form>
  );
}
