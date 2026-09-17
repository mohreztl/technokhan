'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { PRODUCT_CATEGORY_LABELS, adminProductSchema, toPersianDigits } from '@autolounge/shared';
import type { Product, ProductCategory } from '@autolounge/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminMutations } from '@/lib/hooks/use-admin';
import { formResolver, joinLines, linesField, numberField, optionalText } from './form-utils';

const base = adminProductSchema.shape;

/**
 * `adminProductSchema` with input-friendly fields: numbers accept Persian
 * digits, list fields are one-entry-per-line textareas, the English
 * description falls back to the Persian one.
 */
export const productFormSchema = adminProductSchema
  .extend({
    price: numberField(base.price),
    discountPrice: numberField(base.discountPrice),
    stock: numberField(base.stock),
    images: linesField(base.images),
    features: linesField(base.features),
    tags: linesField(z.array(z.string()).default([])),
    shortDescription: optionalText(base.shortDescription),
    brand: optionalText(base.brand),
    sku: optionalText(base.sku),
    descriptionEn: z.string().trim().max(2000).default(''),
  })
  .superRefine((v, ctx) => {
    if (v.discountPrice != null && v.discountPrice >= v.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountPrice'],
        message: 'قیمت با تخفیف باید کمتر از قیمت اصلی باشد',
      });
    }
  })
  .transform((v) => ({ ...v, descriptionEn: v.descriptionEn || v.description }));

export type ProductFormOutput = z.output<typeof productFormSchema>;

export interface ProductFormValues {
  name: string;
  nameEn: string;
  category: string;
  price: string;
  discountPrice: string;
  stock: string;
  brand: string;
  sku: string;
  images: string;
  shortDescription: string;
  description: string;
  descriptionEn: string;
  features: string;
  tags: string;
  featured: boolean;
  isActive: boolean;
}

const CATEGORY_OPTIONS = Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

function toValues(p?: Product | null): ProductFormValues {
  return {
    name: p?.name ?? '',
    nameEn: p?.nameEn ?? '',
    category: p?.category ?? CATEGORY_OPTIONS[0]?.value ?? 'detailing',
    price: p ? toPersianDigits(p.price) : '',
    discountPrice: p?.discountPrice ? toPersianDigits(p.discountPrice) : '',
    stock: p ? toPersianDigits(p.stock) : '۰',
    brand: p?.brand ?? '',
    sku: p?.sku ?? '',
    images: joinLines(p?.images),
    shortDescription: p?.shortDescription ?? '',
    description: p?.description ?? '',
    descriptionEn: p?.descriptionEn ?? '',
    features: joinLines(p?.features),
    tags: joinLines(p?.tags),
    featured: p?.featured ?? false,
    isActive: p?.isActive ?? true,
  };
}

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editing target; `null` / `undefined` creates a new product. */
  product?: Product | null;
  onSaved?: (product: Product) => void;
}

export function ProductFormDialog({ open, onOpenChange, product, onSaved }: ProductFormDialogProps) {
  const { createProduct, updateProduct } = useAdminMutations();
  const formId = React.useId();
  const isEdit = Boolean(product);
  const busy = createProduct.isPending || updateProduct.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: formResolver<ProductFormValues, ProductFormOutput>(productFormSchema),
    defaultValues: toValues(product),
  });

  React.useEffect(() => {
    if (open) reset(toValues(product));
  }, [open, product, reset]);

  const submit = async (out: ProductFormOutput) => {
    const patch: Partial<Product> = {
      name: out.name,
      nameEn: out.nameEn,
      description: out.description,
      descriptionEn: out.descriptionEn,
      shortDescription: out.shortDescription,
      price: out.price,
      discountPrice: out.discountPrice ?? undefined,
      category: out.category as ProductCategory,
      images: out.images,
      stock: out.stock,
      featured: out.featured,
      isActive: out.isActive,
      brand: out.brand,
      sku: out.sku,
      features: out.features,
      tags: out.tags,
      // not editable here — keep whatever the product already has
      specifications: product?.specifications ?? out.specifications,
    };
    try {
      const saved = product
        ? await updateProduct.mutateAsync({ id: product.id, patch })
        : await createProduct.mutateAsync(patch);
      toast.success(product ? 'محصول به‌روزرسانی شد' : 'محصول جدید ثبت شد', { description: saved.name });
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error('ذخیرهٔ محصول ناموفق بود', { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <ResponsiveDialog
      initialSnap={0.9}
      open={open}
      onOpenChange={(o) => {
        if (busy && !o) return;
        onOpenChange(o);
      }}
      title={isEdit ? 'ویرایش محصول' : 'محصول جدید'}
      description={isEdit ? product?.name : 'اطلاعات محصول را وارد کنید؛ اعداد را می‌توانید فارسی بنویسید.'}
      snapPoints={[0.92]}
      dismissible={!busy}
      desktopClassName="max-w-2xl"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            انصراف
          </Button>
          <Button type="submit" form={formId} loading={busy} loadingText="در حال ذخیره…">
            {isEdit ? 'ذخیره تغییرات' : 'ثبت محصول'}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 pt-1 sm:grid-cols-2">
        <Input label="نام محصول" error={errors.name?.message} autoComplete="off" {...register('name')} />
        <Input label="نام انگلیسی" dir="ltr" className="text-start" error={errors.nameEn?.message} {...register('nameEn')} />
        <Select label="دسته‌بندی" options={CATEGORY_OPTIONS} error={errors.category?.message} {...register('category')} />
        <Input label="برند" error={errors.brand?.message} {...register('brand')} />
        <Input label="قیمت (تومان)" inputMode="decimal" error={errors.price?.message} {...register('price')} />
        <Input label="قیمت با تخفیف (اختیاری)" inputMode="decimal" error={errors.discountPrice?.message} {...register('discountPrice')} />
        <Input label="موجودی" inputMode="numeric" error={errors.stock?.message} {...register('stock')} />
        <Input label="کد کالا (SKU)" dir="ltr" className="text-start" error={errors.sku?.message} {...register('sku')} />
        <div className="sm:col-span-2">
          <Textarea
            label="تصاویر (هر مسیر در یک خط)"
            dir="ltr"
            className="min-h-[88px] text-start text-sm"
            placeholder="/images/products/example.webp"
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
        <Textarea label="ویژگی‌ها (هر مورد در یک خط)" className="min-h-[100px]" error={errors.features?.message} {...register('features')} />
        <Textarea label="برچسب‌ها (هر مورد در یک خط)" className="min-h-[100px]" error={errors.tags?.message} {...register('tags')} />
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:gap-8">
          <Checkbox label="محصول ویژه (نمایش در صفحهٔ اصلی)" {...register('featured')} />
          <Checkbox label="فعال (قابل مشاهده در فروشگاه)" {...register('isActive')} />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
