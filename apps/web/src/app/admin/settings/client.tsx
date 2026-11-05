'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { CalendarDays, CalendarX2, Clock, Phone, Plus, Save, Share2, X } from 'lucide-react';
import { siteSettingsSchema, toPersianDigits } from '@technokhan/shared';
import type { SiteSettings } from '@technokhan/shared';
import { useAdminMutations, useAdminSettings } from '@/lib/hooks/use-admin';
import { formatJalali, fromIsoDate, toIsoDate } from '@/lib/jalali';
import { weekdayName } from '@/lib/settings-format';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DateFilterDialog } from '@/components/admin/date-filter-dialog';
import { DetailCard } from '@/components/admin/detail-card';
import { ErrorBanner } from '@/components/admin/error-banner';
import { formResolver, joinLines, linesField } from '@/components/admin/form-utils';

/** The contact half of the form; days and slots are managed outside react-hook-form. */
const contactFormSchema = siteSettingsSchema.pick({
  phone: true,
  mobile: true,
  email: true,
  address: true,
  workingHours: true,
  instagram: true,
  telegram: true,
  whatsapp: true,
}).extend({
  timeSlots: linesField(siteSettingsSchema.shape.timeSlots),
});

type ContactFormOutput = z.output<typeof contactFormSchema>;

interface ContactFormValues {
  phone: string;
  mobile: string;
  email: string;
  address: string;
  workingHours: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  timeSlots: string;
}

/** JS getDay() order, Saturday first — the way a Persian week reads. */
const WEEK = [6, 0, 1, 2, 3, 4, 5];

function toValues(s: SiteSettings): ContactFormValues {
  return {
    phone: s.phone,
    mobile: s.mobile,
    email: s.email,
    address: s.address,
    workingHours: s.workingHours,
    instagram: s.instagram,
    telegram: s.telegram,
    whatsapp: s.whatsapp,
    timeSlots: joinLines(s.timeSlots),
  };
}

export function AdminSettingsClient() {
  const { data, isLoading, isError, error, refetch } = useAdminSettings();

  if (isLoading || !data) {
    return (
      <>
        <AdminPageHeader title="تنظیمات" subtitle={isError ? 'بارگذاری تنظیمات ناموفق بود' : 'در حال بارگذاری…'} />
        {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}
        {!isError && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        )}
      </>
    );
  }

  // Keyed on the row's timestamp: a save (here or elsewhere) re-seeds the form
  // from what the server actually stored, without an effect to copy it in.
  return <SettingsForm key={String(data.updatedAt ?? '')} settings={data} />;
}

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { saveSettings } = useAdminMutations();

  const [closedWeekdays, setClosedWeekdays] = React.useState<number[]>(settings.closedWeekdays);
  const [closedDates, setClosedDates] = React.useState<string[]>(settings.closedDates);
  const [pickingDate, setPickingDate] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ContactFormValues, unknown, ContactFormOutput>({
    resolver: formResolver<ContactFormValues, ContactFormOutput>(contactFormSchema),
    defaultValues: toValues(settings),
  });

  const toggleWeekday = (day: number) =>
    setClosedWeekdays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort()));

  const addClosedDate = (d: Date | null) => {
    if (!d) return;
    const ymd = toIsoDate(d);
    setClosedDates((dates) => (dates.includes(ymd) ? dates : [...dates, ymd].sort()));
  };

  const submit = async (out: ContactFormOutput) => {
    const payload: SiteSettings = { ...out, closedWeekdays, closedDates };
    try {
      await saveSettings.mutateAsync(payload);
      toast.success('تنظیمات ذخیره شد', { description: 'تغییرات بلافاصله در سایت اعمال می‌شود.' });
    } catch (e) {
      toast.error('ذخیرهٔ تنظیمات ناموفق بود', { description: e instanceof Error ? e.message : undefined });
    }
  };

  const listsChanged =
    closedWeekdays.join(',') !== settings.closedWeekdays.join(',') ||
    closedDates.join(',') !== settings.closedDates.join(',');
  const dirty = isDirty || listsChanged;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <AdminPageHeader
        title="تنظیمات"
        subtitle="ساعات کاری، روزهای تعطیل و راه‌های ارتباطی — بدون نیاز به انتشار مجدد سایت"
        actions={
          <Button type="submit" size="sm" className="gap-2" loading={saveSettings.isPending} loadingText="در حال ذخیره…" disabled={!dirty}>
            <Save className="h-4 w-4" aria-hidden="true" />
            ذخیرهٔ تغییرات
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="روزهای تعطیل هفته" icon={<CalendarDays />}>
          <p className="mb-3 text-xs leading-5 text-muted-foreground">
            روزهایی که مرکز پذیرش ندارد. این روزها در تقویم رزرو غیرقابل انتخاب می‌شوند.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WEEK.map((day) => (
              <label
                key={day}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border/60 px-3 text-sm font-semibold transition-colors hover:border-secondary/60"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={closedWeekdays.includes(day)}
                  onChange={() => toggleWeekday(day)}
                />
                {weekdayName(day)}
              </label>
            ))}
          </div>
        </DetailCard>

        <DetailCard title="تعطیلی‌های خاص" icon={<CalendarX2 />}>
          <p className="mb-3 text-xs leading-5 text-muted-foreground">
            روزهای تک، مثل تعطیلات نوروز یا تعمیرات. رزروی برای این روزها ثبت نمی‌شود.
          </p>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setPickingDate(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            افزودن روز تعطیل
          </Button>
          {closedDates.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {closedDates.map((ymd) => (
                <li
                  key={ymd}
                  className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 py-1 ps-3 pe-1 text-xs font-semibold tabular-nums"
                >
                  {formatJalali(fromIsoDate(ymd))}
                  <IconButton
                    label={`حذف ${ymd}`}
                    icon={<X />}
                    size="sm"
                    onClick={() => setClosedDates((dates) => dates.filter((d) => d !== ymd))}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">روز تعطیل خاصی ثبت نشده است.</p>
          )}
        </DetailCard>

        <DetailCard title="بازه‌های زمانی رزرو" icon={<Clock />}>
          <Input
            label="ساعات کاری (متنی، در فوتر و صفحهٔ تماس نمایش داده می‌شود)"
            error={errors.workingHours?.message}
            {...register('workingHours')}
          />
          <div className="mt-4">
            <label htmlFor="time-slots" className="mb-1.5 block text-sm font-semibold text-foreground">
              بازه‌های قابل رزرو (هر بازه در یک خط)
            </label>
            <textarea
              id="time-slots"
              dir="ltr"
              rows={7}
              spellCheck={false}
              className="w-full rounded-xl border border-input bg-background/70 p-3 text-start font-mono text-sm tabular-nums text-foreground focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-ring"
              placeholder={'08:00 - 10:00\n10:00 - 12:00'}
              {...register('timeSlots')}
            />
            <p className={errors.timeSlots ? 'mt-1.5 text-xs text-destructive' : 'mt-1.5 text-xs text-muted-foreground'}>
              {errors.timeSlots?.message ?? 'قالب هر خط: «۰۸:۰۰ - ۱۰:۰۰» با اعداد انگلیسی.'}
            </p>
          </div>
        </DetailCard>

        <DetailCard title="اطلاعات تماس" icon={<Phone />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="تلفن ثابت" dir="ltr" className="text-start" error={errors.phone?.message} {...register('phone')} />
            <Input label="موبایل" dir="ltr" className="text-start" error={errors.mobile?.message} {...register('mobile')} />
            <div className="sm:col-span-2">
              <Input label="ایمیل" dir="ltr" className="text-start" error={errors.email?.message} {...register('email')} />
            </div>
            <div className="sm:col-span-2">
              <Input label="آدرس" error={errors.address?.message} {...register('address')} />
            </div>
          </div>
        </DetailCard>

        <DetailCard title="شبکه‌های اجتماعی" icon={<Share2 />} className="lg:col-span-2">
          <p className="mb-3 text-xs leading-5 text-muted-foreground">
            نشانی کامل هر شبکه. خالی گذاشتن یعنی آن آیکن در فوتر و صفحهٔ تماس نمایش داده نشود.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="اینستاگرام" dir="ltr" className="text-start" placeholder="https://instagram.com/…" error={errors.instagram?.message} {...register('instagram')} />
            <Input label="تلگرام" dir="ltr" className="text-start" placeholder="https://t.me/…" error={errors.telegram?.message} {...register('telegram')} />
            <Input label="واتس‌اپ" dir="ltr" className="text-start" placeholder="https://wa.me/…" error={errors.whatsapp?.message} {...register('whatsapp')} />
          </div>
        </DetailCard>
      </div>

      {/* Sticky save on mobile, where the header action scrolls away. */}
      <div className="sticky bottom-0 z-10 mt-4 -mx-4 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <Button type="submit" className="w-full gap-2" loading={saveSettings.isPending} loadingText="در حال ذخیره…" disabled={!dirty}>
          <Save className="h-4 w-4" aria-hidden="true" />
          ذخیرهٔ تغییرات
        </Button>
      </div>

      <DateFilterDialog
        open={pickingDate}
        onOpenChange={setPickingDate}
        title="افزودن روز تعطیل"
        value={null}
        minDate={new Date()}
        onChange={addClosedDate}
      />
    </form>
  );
}
