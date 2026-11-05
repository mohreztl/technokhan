'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarCheck, Gift, History, PackageSearch, Sparkles } from 'lucide-react';
import { APP_NAME, ROUTES } from '@technokhan/shared';
import { OtpForm } from '@/components/auth/otp-form';
import { useAuth } from '@/lib/store/auth-store';

const FEATURES = [
  { icon: PackageSearch, text: 'پیگیری لحظه‌ای سفارش‌ها و رزروها' },
  { icon: History, text: 'تاریخچهٔ خدمات و خریدهای شما' },
  { icon: Gift, text: 'تخفیف‌های ویژهٔ اعضا' },
  { icon: CalendarCheck, text: 'رزرو سریع‌تر با خودروهای ذخیره‌شده' },
];

function safeRedirect(v: string | null): string {
  if (!v || !v.startsWith('/') || v.startsWith('//')) return ROUTES.HOME;
  return v;
}

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') router.replace(redirect);
  }, [status, redirect, router]);

  return (
    <div className="container-custom py-6 lg:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border bg-background-secondary/40 shadow-luxury lg:grid-cols-[1.1fr_1fr]">
        {/* brand panel */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-primary to-[#0B3560] p-10 text-white lg:flex"
        >
          <div className="pointer-events-none absolute -inset-s-20 -top-20 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -inset-e-24 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-secondary ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              باشگاه مشتریان {APP_NAME}
            </span>
            <h2 className="mt-6 text-3xl font-black leading-tight xl:text-4xl">
              خودروی شما، <span className="text-gradient-luxury">شایستهٔ بهترین‌هاست</span>
            </h2>
            <p className="mt-4 max-w-sm leading-8 text-white/75">
              با یک شماره موبایل وارد شوید؛ بدون رمز عبور، بدون فرم طولانی.
            </p>
          </div>
          <ul className="relative space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 text-sm"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-secondary ring-1 ring-white/10">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        {/* form panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-background p-6 sm:p-10"
          aria-labelledby="login-title"
        >
          <div className="mb-8 lg:hidden">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              باشگاه مشتریان {APP_NAME}
            </span>
          </div>
          <h1 id="login-title" className="text-2xl font-black sm:text-3xl">
            ورود یا ثبت‌نام
          </h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            شماره موبایل خود را وارد کنید تا کد تأیید برایتان پیامک شود.
          </p>
          <div className="mt-8">
            <OtpForm onSuccess={() => router.replace(redirect)} />
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            مشکلی در ورود دارید؟{' '}
            <Link href={ROUTES.CONTACT} className="font-semibold text-secondary hover:underline">
              با پشتیبانی تماس بگیرید
            </Link>
          </p>
        </motion.section>
      </div>
    </div>
  );
}
