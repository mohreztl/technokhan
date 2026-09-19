'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertOctagon className="h-12 w-12 text-red-500" />
            </div>

            <h1 className="text-3xl font-black text-foreground mb-4">
              خطای غیرمنتظره!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              متأسفیم، یک مشکل غیرمنتظره رخ داده است.
              <br />
              تیم فنی ما از این خطا مطلع شده و در حال بررسی است.
            </p>

            {error.digest && (
              <p className="text-sm text-muted-foreground mb-6 font-mono">
                کد خطا: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={reset} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                تلاش مجدد
              </Button>
              <Button
                // global-error renders outside the router, so useRouter() is unavailable here.
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                onClick={() => (window.location.href = '/')}
                variant="primary"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                صفحه اصلی
              </Button>
              <Button
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                onClick={() => (window.location.href = '/contact')}
                variant="secondary"
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                تماس با پشتیبانی
              </Button>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
