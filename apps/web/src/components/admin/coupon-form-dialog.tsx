'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { CalendarDays, X } from 'lucide-react';
import { couponFields, toPersianDigits } from '@autolounge/shared';
import type { Coupon } from '@autolounge/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAdminMutations } from '@/lib/hooks/use-admin';
import { formatJalali, fromIsoDate, toIsoDate } from '@/lib/jalali';
import { DateFilterDialog } from './date-filter-dialog';
import { formResolver, numberField, optionalText } from './form-utils';

/**
 * `couponSchema` with input-friendly fields: amounts accept Persian digits and
 * blank optional fields become `undefined` rather than failing validation.
 */
export const couponFormSchema = couponFields
  .extend({
    value: numberField(z.number().positive('مقدار تخفیف باید بیشتر از صفر باشد')),
    minTotal: numberField(z.number().min(0).optional()),
    maxDiscount: numberField(z.number().min(0).optional()),
    usageLimit: numberField(z.number().int().positive().optional()),
    expiresAt: optionalText(z.string().optional()),
  })
  .refine((c: { type: 'percent' | 'fixed'; value: number }) => c.type !== 'percent' || c.value <= 100, {
    message: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد',
    path: ['value'],
  });

export type CouponFormOutput = z.output<typeof couponFormSchema>;

export interface CouponFormValues {
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  description: string;
  minTotal: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
}

const TYPE_OPTIONS = [
  { value: 'percent', label: 'درصدی' },
  { value: 'fixed', label: 'مبلغ ثابت (تومان)' },
];

function toValues(c?: Coupon | null): CouponFormValues {
  return {
    code: c?.code ?? '',
    type: c?.type ?? 'percent',
    value: c ? toPersianDigits(c.value) : '',
    description: c?.description ?? '',
    minTotal: c?.minTotal ? toPersianDigits(c.minTotal) : '',
    maxDiscount: c?.maxDiscount ? toPersianDigits(c.maxDiscount) : '',
    usageLimit: c?.usageLimit ? toPersianDigits(c.usageLimit) : '',
    expiresAt: c?.expiresAt ? toIsoDate(new Date(c.expiresAt)) : '',
    isActive: c?.isActive ?? true,
  };
}

export interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editing target; `null` / `undefined` creates a new coupon. */
  coupon?: Coupon | null;
}

export function CouponFormDialog({ open, onOpenChange, coupon }: CouponFormDialogProps) {
  const { createCoupon, updateCoupon } = useAdminMutations();
  const formId = React.useId();
  const isEdit = Boolean(coupon);
  const busy = createCoupon.isPending || updateCoupon.isPending;
  const [pickingDate, setPickingDate] = React.useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CouponFormValues, unknown, CouponFormOutput>({
    resolver: formResolver<CouponFormValues, CouponFormOutput>(couponFormSchema),
    defaultValues: toValues(coupon),
  });

  React.useEffect(() => {
    if (open) reset(toValues(coupon));
  }, [open, coupon, reset]);

  // `useWatch` rather than `watch()`: the latter makes the React Compiler skip the file.
  const type = useWatch({ control, name: 'type' });
  const expiresAt = useWatch({ control, name: 'expiresAt' });

  const submit = async (out: CouponFormOutput) => {
    const patch: Partial<Coupon> = {
      code: out.code,
      type: out.type,
      value: out.value,
      description: out.description,
      minTotal: out.minTotal,
      maxDiscount: out.maxDiscount,
      usageLimit: out.usageLimit,
      expiresAt: out.expiresAt,
      isActive: out.isActive,
    };
    try {
      const saved = coupon?.id
        ? await updateCoupon.mutateAsync({ id: coupon.id, patch })
        : await createCoupon.mutateAsync(patch);
      toast.success(isEdit ? 'کد تخفیف به‌روزرسانی شد' : 'کد تخفیف ساخته شد', { description: saved.code });
      onOpenChange(false);
    } catch (e) {
      toast.error('ذخیرهٔ کد تخفیف ناموفق بود', { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={(o) => {
          if (busy && !o) return;
          onOpenChange(o);
        }}
        title={isEdit ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'}
        description={isEdit ? coupon?.code : 'اعداد را می‌توانید فارسی بنویسید.'}
        snapPoints={[0.92]}
        dismissible={!busy}
        desktopClassName="max-w-xl"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              انصراف
            </Button>
            <Button type="submit" form={formId} loading={busy} loadingText="در حال ذخیره…">
              {isEdit ? 'ذخیره تغییرات' : 'ساخت کد'}
            </Button>
          </div>
        }
      >
        <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 pt-1 sm:grid-cols-2">
          <Input
            label="کد"
            dir="ltr"
            className="text-start font-mono uppercase tracking-widest"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="WELCOME10"
            error={errors.code?.message}
            {...register('code')}
          />
          <Select label="نوع تخفیف" options={TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
          <Input
            label={type === 'percent' ? 'درصد تخفیف' : 'مبلغ تخفیف (تومان)'}
            inputMode="decimal"
            error={errors.value?.message}
            {...register('value')}
          />
          <Input
            label="سقف تخفیف (تومان، اختیاری)"
            inputMode="decimal"
            hint={type === 'percent' ? 'برای کدهای درصدی توصیه می‌شود' : undefined}
            error={errors.maxDiscount?.message}
            {...register('maxDiscount')}
          />
          <Input
            label="حداقل مبلغ سفارش (تومان، اختیاری)"
            inputMode="decimal"
            error={errors.minTotal?.message}
            {...register('minTotal')}
          />
          <Input
            label="سقف تعداد استفاده (اختیاری)"
            inputMode="numeric"
            hint="خالی یعنی بدون محدودیت"
            error={errors.usageLimit?.message}
            {...register('usageLimit')}
          />
          <div className="sm:col-span-2">
            <Input
              label="توضیح (به مشتری نمایش داده می‌شود)"
              placeholder="۱۰٪ تخفیف اولین خرید"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">تاریخ انقضا (اختیاری)</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="h-11 flex-1 justify-start gap-2" onClick={() => setPickingDate(true)}>
                <CalendarDays className="h-4 w-4 text-secondary" aria-hidden="true" />
                {expiresAt ? formatJalali(fromIsoDate(expiresAt)) : 'بدون تاریخ انقضا'}
              </Button>
              {expiresAt && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 gap-1.5"
                  onClick={() => setValue('expiresAt', '', { shouldDirty: true })}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  حذف
                </Button>
              )}
            </div>
            {/* the picker writes here; registered so react-hook-form owns the value */}
            <input type="hidden" {...register('expiresAt')} />
          </div>

          <div className="sm:col-span-2">
            <Checkbox label="فعال (در صورت غیرفعال بودن، کد برای مشتری نامعتبر است)" {...register('isActive')} />
          </div>
        </form>
      </ResponsiveDialog>

      <DateFilterDialog
        open={pickingDate}
        onOpenChange={setPickingDate}
        title="تاریخ انقضای کد"
        value={expiresAt ? fromIsoDate(expiresAt) : null}
        minDate={new Date()}
        onChange={(d) => setValue('expiresAt', d ? toIsoDate(d) : '', { shouldDirty: true })}
      />
    </>
  );
}
