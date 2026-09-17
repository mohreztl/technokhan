'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { formatToman, toPersianDigits } from '@autolounge/shared';
import { Button } from '@/components/ui/button';

/**
 * In-app mock of a bank gateway used ONLY by the demo transport
 * (authorities starting with DEMO-). No card data is collected: the fields
 * are decorative and disabled. "پرداخت" / "انصراف" redirect back to the
 * callback exactly like Zarinpal would (Authority + Status=OK|NOK).
 */
export function DemoGatewayClient() {
  const params = useSearchParams();
  const router = useRouter();
  const authority = params.get('Authority') ?? '';
  const amount = Number(params.get('amount') ?? 0);
  const callback = params.get('callback') || '/checkout/callback';
  const [busy, setBusy] = useState<'ok' | 'nok' | null>(null);
  const [seconds, setSeconds] = useState(600);

  const safeCallback = useMemo(() => (callback.startsWith('/') ? callback : '/checkout/callback'), [callback]);
  const valid = authority.startsWith('DEMO-');

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const finish = (status: 'OK' | 'NOK') => {
    setBusy(status === 'OK' ? 'ok' : 'nok');
    const sep = safeCallback.includes('?') ? '&' : '?';
    setTimeout(() => {
      router.replace(`${safeCallback}${sep}Authority=${encodeURIComponent(authority)}&Status=${status}`);
    }, 900);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-[#f3f4f6] px-4 py-8 text-slate-900 dark:bg-[#0f1115] dark:text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#171a21] dark:ring-white/10"
      >
        <div className="flex items-center justify-between bg-[#1c3f7a] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-300" aria-hidden />
            <span className="text-sm font-bold">درگاه پرداخت نمایشی</span>
          </div>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px]">شبیه‌ساز · بدون تراکنش واقعی</span>
        </div>

        {!valid ? (
          <div className="p-6 text-center">
            <XCircle className="mx-auto h-10 w-10 text-red-500" aria-hidden />
            <p className="mt-3 font-bold">شناسهٔ پرداخت معتبر نیست</p>
            <Button variant="outline" className="mt-5" onClick={() => router.replace('/cart')}>
              بازگشت به سبد خرید
            </Button>
          </div>
        ) : (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">مبلغ قابل پرداخت</p>
                <p className="mt-1 text-xl font-black">{formatToman(amount)}</p>
              </div>
              <div className="text-end">
                <p className="text-xs text-slate-500 dark:text-slate-400">پذیرنده</p>
                <p className="mt-1 text-sm font-bold">اتولانژ</p>
              </div>
            </div>

            <fieldset disabled className="space-y-3 opacity-80" aria-label="فرم کارت (غیرفعال، نمایشی)">
              <label className="block text-xs text-slate-500 dark:text-slate-400">
                شمارهٔ کارت
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                  <CreditCard className="h-4 w-4 text-slate-400" aria-hidden />
                  <span className="flex-1 font-mono text-sm tracking-[0.3em] text-slate-400" dir="ltr">
                    6037 99•• •••• 4812
                  </span>
                </div>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['CVV2', 'ماه', 'سال'].map((f) => (
                  <label key={f} className="block text-xs text-slate-500 dark:text-slate-400">
                    {f}
                    <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm text-slate-400 dark:border-white/10 dark:bg-white/5">
                      •••
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" aria-hidden /> این صفحه هیچ اطلاعاتی دریافت نمی‌کند
              </span>
              <span className="font-mono" dir="ltr">
                {toPersianDigits(`${mm}:${ss}`)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => finish('NOK')}
                loading={busy === 'nok'}
                loadingText="در حال انصراف…"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                انصراف
              </Button>
              <Button
                size="lg"
                onClick={() => finish('OK')}
                loading={busy === 'ok'}
                loadingText="در حال پرداخت…"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                پرداخت
              </Button>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              شناسهٔ تراکنش: <span dir="ltr" className="font-mono">{authority}</span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
