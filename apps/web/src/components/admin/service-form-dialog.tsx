'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { SERVICE_TYPE_LABELS, adminServiceSchema, toPersianDigits } from '@autolounge/shared';
import type { Service, ServiceType } from '@autolounge/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminMutations } from '@/lib/hooks/use-admin';
import { formResolver, joinLines, linesField, numberField, optionalText, parseNumber } from './form-utils';

const base = adminServiceSchema.shape;

/** `adminServiceSchema` with input-friendly fields (see `productFormSchema`). */
export const serviceFormSchema = adminServiceSchema
  .extend({
    price: numberField(base.price),
    duration: numberField(base.duration),
    warrantyMonths: numberField(base.warrantyMonths),
    images: linesField(base.images),
    features: linesField(base.features),
    shortDescription: optionalText(base.shortDescription),
    descriptionEn: z.string().trim().max(2000).default(''),
    pricing: z.preprocess((v) => {
      const o = (v ?? {}) as Record<string, unknown>;
      const small = parseNumber(o.small);
      const medium = parseNumber(o.medium);
      const large = parseNumber(o.large);
      if (small === undefined && medium === undefined && large === undefined) return undefined;
      return { small: small ?? 0, medium: medium ?? 0, large: large ?? 0 };
    }, base.pricing),
  })
  .transform((v) => ({ ...v, descriptionEn: v.descriptionEn || v.description }));

export type ServiceFormOutput = z.output<typeof serviceFormSchema>;

export interface ServiceFormValues {
  name: string;
  nameEn: string;
  type: string;
  price: string;
  duration: string;
  warrantyMonths: string;
  pricing: { small: string; medium: string; large: string };
  images: string;
  shortDescription: string;
  description: string;
  descriptionEn: string;
  features: string;
  featured: boolean;
  isActive: boolean;
}

const TYPE_OPTIONS = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const num = (n?: number | null) => (n === undefined || n === null ? '' : toPersianDigits(n));

function toValues(s?: Service | null): ServiceFormValues {
  return {
    name: s?.name ?? '',
    nameEn: s?.nameEn ?? '',
    type: s?.type ?? TYPE_OPTIONS[0]?.value ?? 'detailing',
    price: num(s?.price),
    duration: num(s?.duration),
    warrantyMonths: num(s?.warrantyMonths),
    pricing: {
      small: num(s?.pricing?.small),
      medium: num(s?.pricing?.medium),
      large: num(s?.pricing?.large),
    },
    images: joinLines(s?.images),
    shortDescription: s?.shortDescription ?? '',
    description: s?.description ?? '',
    descriptionEn: s?.descriptionEn ?? '',
    features: joinLines(s?.features),
    featured: s?.featured ?? false,
    isActive: s?.isActive ?? true,
  };
}

export interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSaved?: (service: Service) => void;
}

export function ServiceFormDialog({ open, onOpenChange, service, onSaved }: ServiceFormDialogProps) {
  const { createService, updateService } = useAdminMutations();
  const formId = React.useId();
  const isEdit = Boolean(service);
  const busy = createService.isPending || updateService.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues, unknown, ServiceFormOutput>({
    resolver: formResolver<ServiceFormValues, ServiceFormOutput>(serviceFormSchema),
    defaultValues: toValues(service),
  });

  React.useEffect(() => {
    if (open) reset(toValues(service));
  }, [open, service, reset]);

  const submit = async (out: ServiceFormOutput) => {
    const patch: Partial<Service> = {
      name: out.name,
      nameEn: out.nameEn,
      description: out.description,
      descriptionEn: out.descriptionEn,
      shortDescription: out.shortDescription,
      price: out.price,
      duration: out.duration,
      type: out.type as ServiceType,
      images: out.images,
      featured: out.featured,
      isActive: out.isActive,
      features: out.features,
      pricing: out.pricing,
      warrantyMonths: out.warrantyMonths,
      // not editable here — keep the existing add-ons
      addons: service?.addons ?? out.addons,
    };
    try {
      const saved = service
        ? await updateService.mutateAsync({ id: service.id, patch })
        : await createService.mutateAsync(patch);
      toast.success(service ? 'خدمت به‌روزرسانی شد' : 'خدمت جدید ثبت شد', { description: saved.name });
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error('ذخیرهٔ خدمت ناموفق بود', { description: e instanceof Error ? e.message : undefined });
    }
  };

  const pricingError = errors.pricing?.message ?? errors.pricing?.small?.message ?? errors.pricing?.medium?.message ?? errors.pricing?.large?.message;

  return (
    <ResponsiveDialog
      initialSnap={0.9}
      open={open}
      onOpenChange={(o) => {
        if (busy && !o) return;
        onOpenChange(o);
      }}
      title={isEdit ? 'ویرایش خدمت' : 'خدمت جدید'}
      description={isEdit ? service?.name : 'اطلاعات خدمت را وارد کنید؛ اعداد را می‌توانید فارسی بنویسید.'}
      snapPoints={[0.92]}
      dismissible={!busy}
      desktopClassName="max-w-2xl"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            انصراف
          </Button>
          <Button type="submit" form={formId} loading={busy} loadingText="در حال ذخیره…">
            {isEdit ? 'ذخیره تغییرات' : 'ثبت خدمت'}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 pt-1 sm:grid-cols-2">
        <Input label="نام خدمت" error={errors.name?.message} autoComplete="off" {...register('name')} />
        <Input label="نام انگلیسی" dir="ltr" className="text-start" error={errors.nameEn?.message} {...register('nameEn')} />
        <Select label="نوع خدمت" options={TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
        <Input label="قیمت پایه (تومان)" inputMode="decimal" error={errors.price?.message} {...register('price')} />
        <Input label="مدت انجام (دقیقه)" inputMode="numeric" error={errors.duration?.message} {...register('duration')} />
        <Input label="گارانتی (ماه، اختیاری)" inputMode="numeric" error={errors.warrantyMonths?.message} {...register('warrantyMonths')} />

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 block text-sm font-medium text-foreground">قیمت بر اساس اندازهٔ خودرو (تومان)</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="سواری" inputMode="decimal" {...register('pricing.small')} />
            <Input label="سدان / کراس‌اوور" inputMode="decimal" {...register('pricing.medium')} />
            <Input label="شاسی‌بلند / ون" inputMode="decimal" {...register('pricing.large')} />
          </div>
          {pricingError && <p className="mt-1 text-sm text-destructive">{pricingError}</p>}
          <p className="mt-1 text-xs text-muted-foreground">خالی بگذارید تا از قیمت پایه استفاده شود.</p>
        </fieldset>

        <div className="sm:col-span-2">
          <Textarea
            label="تصاویر (هر مسیر در یک خط)"
            dir="ltr"
            className="min-h-[88px] text-start text-sm"
            placeholder="/images/services/example.webp"
            error={errors.images?.message}
            {...register('images')}
          />
        </div>
        <div className="sm:col-span-2">
          <Input label="توضیح کوتاه" error={errors.shortDescription?.message} {...register('shortDescription')} />
        </div>
        <div className="sm:col-span-2">
          <Textarea label="توضیحات" error={errors.description?.message} {...register('description')} />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="توضیحات انگلیسی (اختیاری؛ در صورت خالی بودن از توضیحات فارسی استفاده می‌شود)"
            dir="ltr"
            className="min-h-[88px] text-start"
            error={errors.descriptionEn?.message}
            {...register('descriptionEn')}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea label="ویژگی‌ها (هر مورد در یک خط)" className="min-h-[100px]" error={errors.features?.message} {...register('features')} />
        </div>
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:gap-8">
          <Checkbox label="خدمت ویژه (نمایش در صفحهٔ اصلی)" {...register('featured')} />
          <Checkbox label="فعال (قابل رزرو)" {...register('isActive')} />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
