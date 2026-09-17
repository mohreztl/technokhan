'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Wrench } from 'lucide-react';
import { ROUTES } from '@autolounge/shared';
import { Button } from '@/components/ui/button';

export default function ServiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-background py-12 lg:py-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="glass-effect-strong space-y-6 rounded-3xl border border-primary/10 p-8 sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
            </div>
            <div>
              <h1 className="mb-3 text-2xl font-black text-gradient-luxury sm:text-4xl">خطا در بارگذاری خدمت</h1>
              <p className="mb-2 text-base text-muted-foreground sm:text-lg">
                متأسفانه در بارگذاری اطلاعات این خدمت مشکلی پیش آمد.
              </p>
              <p className="text-sm text-muted-foreground">
                {error.message || 'لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.'}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button type="button" variant="primary" size="lg" onClick={reset} className="min-h-12 w-full gap-2 sm:w-auto">
                <RefreshCcw className="h-5 w-5" aria-hidden="true" />
                تلاش مجدد
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-12 w-full gap-2 sm:w-auto">
                <Link href={ROUTES.SERVICES}>
                  <Wrench className="h-5 w-5" aria-hidden="true" />
                  بازگشت به خدمات
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
