'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Mail, Palette, Phone, Save, Trash2, UserRound } from 'lucide-react';
import type { UpdateProfileInput } from '@autolounge/shared';
import { ROUTES, toPersianDigits, updateProfileSchema } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { showToast } from '@/components/ui/toaster';
import { useLogout, useUpdateProfile } from '@/lib/hooks';
import { useAuth } from '@/lib/store/auth-store';

export function TabSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const [signingOut, setSigningOut] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      await updateProfile.mutateAsync({ name: values.name, email: values.email });
      showToast.success('پروفایل به‌روزرسانی شد');
    } catch (e) {
      showToast.error('ذخیرهٔ تغییرات ناموفق بود', e instanceof Error ? e.message : undefined);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      showToast.info('از حساب خود خارج شدید');
      router.push(ROUTES.HOME);
    } finally {
      setSigningOut(false);
    }
  };

  const phone = user?.phoneNumber ?? user?.phone ?? '';

  return (
    <div className="space-y-6">
      <section className="glass-effect rounded-2xl p-4 sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <UserRound className="h-4 w-4 text-secondary" aria-hidden="true" />
          اطلاعات حساب
        </h2>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="نام و نام خانوادگی"
            autoComplete="name"
            placeholder="نام شما"
            startIcon={<UserRound className="h-5 w-5" aria-hidden="true" />}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="ایمیل (اختیاری)"
            type="email"
            inputMode="email"
            dir="ltr"
            autoComplete="email"
            placeholder="you@example.com"
            startIcon={<Mail className="h-5 w-5" aria-hidden="true" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="شماره موبایل"
            dir="ltr"
            value={toPersianDigits(phone)}
            readOnly
            disabled
            startIcon={<Phone className="h-5 w-5" aria-hidden="true" />}
            hint="شماره موبایل قابل تغییر نیست"
          />
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={updateProfile.isPending} loadingText="در حال ذخیره…" disabled={!isDirty}>
            <Save className="h-5 w-5" aria-hidden="true" />
            ذخیرهٔ تغییرات
          </Button>
        </form>
      </section>

      <section className="glass-effect rounded-2xl p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <Palette className="h-4 w-4 text-secondary" aria-hidden="true" />
          ظاهر برنامه
        </h2>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">حالت روشن، تاریک یا هماهنگ با سیستم</p>
          <ThemeSwitcher variant="pill" />
        </div>
      </section>

      <section className="glass-effect rounded-2xl p-4 sm:p-5">
        <h2 className="mb-3 font-bold">حساب کاربری</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="lg" onClick={signOut} loading={signingOut} loadingText="در حال خروج…">
            <LogOut className="h-5 w-5" aria-hidden="true" />
            خروج از حساب
          </Button>
          <Button variant="ghost" size="lg" className="text-destructive hover:bg-destructive/10 hover:text-destructive" asChild>
            <Link href={`${ROUTES.CONTACT}?subject=${encodeURIComponent('حذف حساب')}`}>
              <Trash2 className="h-5 w-5" aria-hidden="true" />
              درخواست حذف حساب
            </Link>
          </Button>
        </div>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          حذف حساب پس از بررسی درخواست توسط پشتیبانی انجام می‌شود و سفارش‌های باز باید تعیین تکلیف شده باشند.
        </p>
      </section>
    </div>
  );
}
