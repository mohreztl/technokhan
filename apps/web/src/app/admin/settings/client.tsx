'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Phone, Save, Share2, ShieldCheck } from 'lucide-react';
import { siteSettingsSchema } from '@technokhan/shared';
import type { SiteSettings } from '@technokhan/shared';
import { useAdminMutations, useAdminSettings } from '@/lib/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DetailCard } from '@/components/admin/detail-card';
import { ErrorBanner } from '@/components/admin/error-banner';
import { formResolver } from '@/components/admin/form-utils';

const contactFormSchema = siteSettingsSchema.pick({
  phone: true,
  mobile: true,
  email: true,
  address: true,
  workingHours: true,
  instagram: true,
  telegram: true,
  whatsapp: true,
  enamadHtml: true,
  samandehiHtml: true,
  asnafHtml: true,
});

type ContactFormValues = z.output<typeof contactFormSchema>;

function toValues(settings: SiteSettings): ContactFormValues {
  return {
    phone: settings.phone,
    mobile: settings.mobile,
    email: settings.email,
    address: settings.address,
    workingHours: settings.workingHours,
    instagram: settings.instagram,
    telegram: settings.telegram,
    whatsapp: settings.whatsapp,
    enamadHtml: settings.enamadHtml ?? '',
    samandehiHtml: settings.samandehiHtml ?? '',
    asnafHtml: settings.asnafHtml ?? '',
  };
}

export function AdminSettingsClient() {
  const { data, isLoading, isError, error, refetch } = useAdminSettings();

  if (isLoading || !data) {
    return (
      <>
        <AdminPageHeader title="تنظیمات" subtitle={isError ? 'بارگذاری تنظیمات ناموفق بود' : 'در حال بارگذاری…'} />
        {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}
        {!isError && <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>}
      </>
    );
  }

  return <SettingsForm key={String(data.updatedAt ?? '')} settings={data} />;
}

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { saveSettings } = useAdminMutations();
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ContactFormValues>({
    resolver: formResolver<ContactFormValues, ContactFormValues>(contactFormSchema),
    defaultValues: toValues(settings),
  });

  const submit = async (payload: ContactFormValues) => {
    try {
      await saveSettings.mutateAsync(payload);
      toast.success('تنظیمات ذخیره شد', { description: 'تغییرات بلافاصله در سایت اعمال می‌شود.' });
    } catch (error) {
      toast.error('ذخیرهٔ تنظیمات ناموفق بود', { description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <AdminPageHeader
        title="تنظیمات"
        subtitle="ساعات کاری و راه‌های ارتباطی — بدون نیاز به انتشار مجدد سایت"
        actions={<Button type="submit" size="sm" className="gap-2" loading={saveSettings.isPending} loadingText="در حال ذخیره…" disabled={!isDirty}><Save className="h-4 w-4" aria-hidden="true" />ذخیرهٔ تغییرات</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="اطلاعات تماس" icon={<Phone />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="تلفن ثابت" dir="ltr" className="text-start" error={errors.phone?.message} {...register('phone')} />
            <Input label="موبایل" dir="ltr" className="text-start" error={errors.mobile?.message} {...register('mobile')} />
            <div className="sm:col-span-2"><Input label="ایمیل" dir="ltr" className="text-start" error={errors.email?.message} {...register('email')} /></div>
            <div className="sm:col-span-2"><Input label="آدرس" error={errors.address?.message} {...register('address')} /></div>
            <div className="sm:col-span-2"><Input label="ساعات کاری" error={errors.workingHours?.message} {...register('workingHours')} /></div>
          </div>
        </DetailCard>

        <DetailCard title="شبکه‌های اجتماعی" icon={<Share2 />}>
          <p className="mb-3 text-xs leading-5 text-muted-foreground">نشانی کامل هر شبکه. خالی گذاشتن یعنی آن آیکن در فوتر و صفحهٔ تماس نمایش داده نشود.</p>
          <div className="grid gap-4">
            <Input label="اینستاگرام" dir="ltr" className="text-start" placeholder="https://instagram.com/…" error={errors.instagram?.message} {...register('instagram')} />
            <Input label="تلگرام" dir="ltr" className="text-start" placeholder="https://t.me/…" error={errors.telegram?.message} {...register('telegram')} />
            <Input label="واتس‌اپ" dir="ltr" className="text-start" placeholder="https://wa.me/…" error={errors.whatsapp?.message} {...register('whatsapp')} />
          </div>
        </DetailCard>

        <DetailCard title="مجوزهای فوتر" icon={<ShieldCheck />} className="lg:col-span-2">
          <p className="mb-3 text-xs leading-5 text-muted-foreground">کدِ HTML که سامانه‌های اینماد، ساماندهی و اتاق اصناف برای نمایش نشان صادر کرده‌اند. خالی گذاشتن یعنی آن نشان در فوتر نمایش داده نشود.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ['enamadHtml', 'نماد اعتماد (اینماد)'],
              ['samandehiHtml', 'ساماندهی'],
              ['asnafHtml', 'اتحادیه / اصناف'],
            ] as const).map(([field, label]) => (
              <div key={field}>
                <label htmlFor={`license-${field}`} className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
                <textarea
                  id={`license-${field}`}
                  dir="ltr"
                  rows={5}
                  spellCheck={false}
                  placeholder='<a href="https://trustseal.enamad.ir/…">…</a>'
                  className="w-full rounded-xl border border-input bg-background/70 p-3 text-start font-mono text-xs text-foreground focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-ring"
                  {...register(field)}
                />
              </div>
            ))}
          </div>
        </DetailCard>
      </div>

      <div className="sticky bottom-0 z-10 mt-4 -mx-4 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <Button type="submit" className="w-full gap-2" loading={saveSettings.isPending} loadingText="در حال ذخیره…" disabled={!isDirty}><Save className="h-4 w-4" aria-hidden="true" />ذخیرهٔ تغییرات</Button>
      </div>
    </form>
  );
}
