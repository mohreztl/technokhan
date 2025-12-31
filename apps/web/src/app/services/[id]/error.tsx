'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@autolounge/shared';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Service page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass-effect-strong border border-primary/10 rounded-3xl p-12 space-y-6">
            {/* Error Icon */}
            <div className="w-24 h-24 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>

            {/* Error Message */}
            <div>
              <h1 className="text-4xl font-black text-gradient-luxury mb-4">
                خطا در بارگذاری خدمات
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                متأسفانه در بارگذاری اطلاعات خدمات مشکلی پیش آمد.
              </p>
              <p className="text-sm text-muted-foreground">
                {error.message || 'لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button variant="primary" size="lg" onClick={reset} className="gap-2">
                <RefreshCcw className="h-5 w-5" />
                تلاش مجدد
              </Button>
              <Link href={ROUTES.SERVICES}>
                <Button variant="outline" size="lg" className="gap-2">
                  <Home className="h-5 w-5" />
                  بازگشت به خدمات
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] -z-10" />
        </motion.div>
      </div>
    </div>
  );
}
