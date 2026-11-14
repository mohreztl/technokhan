'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Phone, ShieldCheck, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@technokhan/shared';
import { toEnglishDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { usePasswordLogin, usePasswordRegister } from '@/lib/hooks/use-me';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export interface PasswordFormProps {
  onSuccess?: (user: User) => void;
  className?: string;
}

const inputShell = (error: boolean) =>
  cn(
    'flex items-center gap-3 rounded-2xl border bg-background-secondary/60 px-4 transition-colors focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/30',
    error ? 'border-destructive' : 'border-border'
  );

const inputCls =
  'h-14 w-full bg-transparent text-start font-mono text-lg text-foreground outline-hidden placeholder:text-muted-foreground/60 placeholder:font-sans placeholder:text-base';

/** Username + password login, with inline registration. WordPress-migrated
 * users sign in with their old username/password — the API upgrades the hash. */
export function PasswordForm({ onSuccess, className }: PasswordFormProps) {
  const reduced = useReducedMotion();
  const login = usePasswordLogin();
  const register = usePasswordRegister();

  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState(0);

  const pending = login.isPending || register.isPending;

  const submit = async () => {
    setError(null);
    const u = username.trim().toLowerCase();
    if (u.length < 3) {
      setError('نام کاربری باید حداقل ۳ کاراکتر باشد');
      setShake((n) => n + 1);
      return;
    }
    if (!password) {
      setError('رمز عبور را وارد کنید');
      setShake((n) => n + 1);
      return;
    }
    try {
      const r =
        mode === 'login'
          ? await login.mutateAsync({ username: u, password })
          : await register.mutateAsync({ username: u, password, phoneNumber: toEnglishDigits(phone), name: name.trim() || undefined });
      toast.success(r.user.name ? `خوش آمدید ${r.user.name}` : 'با موفقیت وارد شدید');
      onSuccess?.(r.user);
    } catch (e) {
      setError((e as Error).message);
      setShake((n) => n + 1);
    }
  };

  return (
    <motion.form
      key={shake}
      animate={shake && !reduced ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className={cn('space-y-5', className)}
    >
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-background-secondary/60 p-1.5" role="tablist" aria-label="روش ورود">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              'min-h-11 rounded-xl text-sm font-semibold transition-colors',
              mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m === 'login' ? 'ورود' : 'ثبت‌نام'}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="pwd-username" className="mb-2 block text-sm font-semibold">
          نام کاربری
        </label>
        <div className={inputShell(!!error)}>
          <UserIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="pwd-username"
            type="text"
            autoComplete="username"
            dir="ltr"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            aria-invalid={!!error}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pwd-password" className="mb-2 block text-sm font-semibold">
          رمز عبور
        </label>
        <div className={inputShell(!!error)}>
          <KeyRound className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="pwd-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            dir="ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            aria-invalid={!!error}
          />
        </div>
      </div>

      {mode === 'register' && (
        <>
          <div>
            <label htmlFor="pwd-phone" className="mb-2 block text-sm font-semibold">
              شماره موبایل
            </label>
            <div className={inputShell(false)}>
              <Phone className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="pwd-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="0912 345 6789"
                value={phone}
                onChange={(e) => setPhone(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 11))}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="pwd-name" className="mb-2 block text-sm font-semibold">
              نام و نام خانوادگی <span className="text-xs font-normal text-muted-foreground">(اختیاری)</span>
            </label>
            <input
              id="pwd-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(inputCls, 'rounded-2xl border border-border bg-background-secondary/60 px-4 focus:border-secondary')}
            />
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="در حال بررسی…">
        {mode === 'login' ? 'ورود' : 'ایجاد حساب'}
        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden />
      </Button>

      <p className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
        {mode === 'login'
          ? 'اگر حساب شما از فروشگاه قبلی منتقل شده، همان نام کاربری و رمز عبور وردپرس را وارد کنید.'
          : 'با ثبت‌نام، قوانین و حریم خصوصی فروشگاه را می‌پذیرید.'}
      </p>
    </motion.form>
  );
}
