'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, KeyRound, Phone, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@technokhan/shared';
import { toEnglishDigits, toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { useSendOtp, useVerifyOtp } from '@/lib/hooks/use-me';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'code';

export interface OtpFormProps {
  /** Called after a successful verification (the auth store is already updated). */
  onSuccess?: (user: User) => void;
  /** Tighter spacing for use inside sheets/dialogs. */
  compact?: boolean;
  initialPhone?: string;
  className?: string;
}

const CODE_LENGTH = 6;
const RESEND_SECONDS = 120;
const PHONE_RE = /^09\d{9}$/;

function normalizePhone(v: string) {
  return toEnglishDigits(v).replace(/\D/g, '').replace(/^98/, '0').slice(0, 11);
}

function prettyPhone(v: string) {
  const d = normalizePhone(v);
  const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean);
  return toPersianDigits(parts.join(' '));
}

/**
 * Two-step phone → 6-digit code login. One real `<input>` (autocomplete
 * "one-time-code" so iOS/Android offer the SMS code) drives six visual boxes;
 * paste and auto-submit work out of the box.
 */
export function OtpForm({ onSuccess, compact, initialPhone = '', className }: OtpFormProps) {
  const reduced = useReducedMotion();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const [step, setStep] = React.useState<Step>('phone');
  const [phone, setPhone] = React.useState(normalizePhone(initialPhone));
  const [code, setCode] = React.useState('');
  const [demoCode, setDemoCode] = React.useState<string | undefined>();
  const [error, setError] = React.useState<string | null>(null);
  const [seconds, setSeconds] = React.useState(0);
  const [shake, setShake] = React.useState(0);

  const codeInput = React.useRef<HTMLInputElement>(null);
  const phoneInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  React.useEffect(() => {
    if (step === 'code') setTimeout(() => codeInput.current?.focus(), 80);
    else setTimeout(() => phoneInput.current?.focus(), 80);
  }, [step]);

  const phoneValid = PHONE_RE.test(phone);

  const requestCode = async () => {
    setError(null);
    if (!phoneValid) {
      setError('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
      setShake((n) => n + 1);
      return;
    }
    try {
      const r = await sendOtp.mutateAsync(phone);
      setDemoCode(r.demoCode);
      setSeconds(r.expiresIn || RESEND_SECONDS);
      setCode('');
      setStep('code');
      toast.success(r.message || 'کد تأیید ارسال شد');
    } catch (e) {
      setError((e as Error).message);
      setShake((n) => n + 1);
    }
  };

  const verify = React.useCallback(
    async (value: string) => {
      if (value.length !== CODE_LENGTH || verifyOtp.isPending) return;
      setError(null);
      try {
        const r = await verifyOtp.mutateAsync({ phoneNumber: phone, code: value });
        toast.success(r.user.name ? `خوش آمدید ${r.user.name}` : 'با موفقیت وارد شدید');
        onSuccess?.(r.user);
      } catch (e) {
        setError((e as Error).message);
        setShake((n) => n + 1);
        setCode('');
        codeInput.current?.focus();
      }
    },
    [phone, verifyOtp, onSuccess]
  );

  const onCodeChange = (raw: string) => {
    const digits = toEnglishDigits(raw).replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) void verify(digits);
  };

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: -24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 24 },
      };

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {step === 'phone' ? (
          <motion.form
            key="phone"
            {...slide}
            transition={{ duration: 0.25 }}
            onSubmit={(e) => {
              e.preventDefault();
              void requestCode();
            }}
            className={cn('space-y-5', compact && 'space-y-4')}
          >
            <div>
              <label htmlFor="otp-phone" className="mb-2 block text-sm font-semibold">
                شماره موبایل
              </label>
              <motion.div
                key={shake}
                animate={shake && !reduced ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border bg-background-secondary/60 px-4 transition-colors focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/30',
                  error ? 'border-destructive' : 'border-border'
                )}
              >
                <Phone className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  ref={phoneInput}
                  id="otp-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="0912 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  className="h-14 w-full bg-transparent text-start font-mono text-lg tracking-[0.15em] text-foreground outline-hidden placeholder:text-muted-foreground/60"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'otp-phone-error' : undefined}
                />
              </motion.div>
              {error && (
                <p id="otp-phone-error" role="alert" className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={sendOtp.isPending}
              loadingText="در حال ارسال کد…"
              disabled={!phoneValid && phone.length === 11}
            >
              دریافت کد تأیید
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
            <p className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
              با ورود، <a href="/terms" className="mx-1 text-secondary hover:underline">قوانین</a> و{' '}
              <a href="/privacy" className="mx-1 text-secondary hover:underline">حریم خصوصی</a> اتولانژ را می‌پذیرید.
            </p>
          </motion.form>
        ) : (
          <motion.form
            key="code"
            {...slide}
            transition={{ duration: 0.25 }}
            onSubmit={(e) => {
              e.preventDefault();
              void verify(code);
            }}
            className={cn('space-y-5', compact && 'space-y-4')}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                کد ارسال‌شده به{' '}
                <span dir="ltr" className="font-semibold text-foreground">
                  {prettyPhone(phone)}
                </span>{' '}
                را وارد کنید
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError(null);
                }}
                className="min-h-[44px] shrink-0 text-sm font-semibold text-secondary hover:underline"
              >
                ویرایش شماره
              </button>
            </div>

            {/* real input (transparent) + visual boxes */}
            <motion.div
              key={shake}
              animate={shake && !reduced ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative"
              dir="ltr"
            >
              <input
                ref={codeInput}
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={CODE_LENGTH}
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                onPaste={(e) => {
                  e.preventDefault();
                  onCodeChange(e.clipboardData.getData('text'));
                }}
                aria-label="کد تأیید شش رقمی"
                aria-invalid={!!error}
                className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
              />
              <div className="grid grid-cols-6 gap-2 sm:gap-3" aria-hidden>
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const ch = code[i];
                  const active = code.length === i;
                  return (
                    <motion.div
                      key={i}
                      animate={ch && !reduced ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        'flex h-14 items-center justify-center rounded-xl border-2 bg-background-secondary/60 text-2xl font-black tabular-nums transition-colors sm:h-16',
                        error ? 'border-destructive' : active ? 'border-secondary shadow-glow-secondary' : ch ? 'border-secondary/60' : 'border-border'
                      )}
                    >
                      {ch ? toPersianDigits(ch) : active ? <span className="h-6 w-0.5 animate-pulse bg-secondary" /> : ''}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            {demoCode && (
              <button
                type="button"
                onClick={() => onCodeChange(demoCode)}
                className="flex w-full items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-3 py-2.5 text-start text-sm text-foreground transition-colors hover:bg-secondary/20"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                <span>
                  حالت نمایشی — کد شما: <b className="font-mono tracking-widest">{toPersianDigits(demoCode)}</b>
                </span>
                <span className="ms-auto text-xs text-secondary">قرار دادن</span>
              </button>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={verifyOtp.isPending}
              loadingText="در حال بررسی…"
              disabled={code.length !== CODE_LENGTH}
            >
              <KeyRound className="me-2 h-4 w-4" aria-hidden />
              تأیید و ورود
            </Button>

            <div className="flex items-center justify-center text-sm text-muted-foreground">
              {seconds > 0 ? (
                <span>
                  ارسال مجدد تا{' '}
                  <span className="font-mono font-semibold text-foreground" dir="ltr">
                    {toPersianDigits(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`)}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void requestCode()}
                  disabled={sendOtp.isPending}
                  className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-secondary hover:underline disabled:opacity-60"
                >
                  <RefreshCw className={cn('h-4 w-4', sendOtp.isPending && 'animate-spin')} aria-hidden />
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
