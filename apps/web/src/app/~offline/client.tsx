'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, RefreshCw, WifiOff } from 'lucide-react';
import { CONTACT } from '@technokhan/shared';
import { Button } from '@/components/ui/button';

export function OfflineClient() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div className="container-custom flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-secondary/15 text-secondary"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-secondary/40"
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <WifiOff className="h-12 w-12" />
      </motion.div>
      <h1 className="text-2xl font-black sm:text-4xl">اتصال اینترنت برقرار نیست</h1>
      <p className="mt-3 max-w-md text-balance leading-8 text-muted-foreground">
        این صفحه در حافظهٔ دستگاه شما ذخیره نشده بود. اتصال خود را بررسی کنید و دوباره تلاش کنید؛ صفحاتی که قبلاً دیده‌اید همچنان در دسترس‌اند.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={() => window.location.reload()} className="w-full sm:w-auto">
          <RefreshCw className="me-2 h-4 w-4" aria-hidden />
          {online ? 'بارگذاری مجدد' : 'تلاش دوباره'}
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/">صفحهٔ اصلی</Link>
        </Button>
      </div>
      <a
        href={`tel:${CONTACT.phoneEn}`}
        className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground hover:text-secondary"
      >
        <Phone className="h-4 w-4" aria-hidden />
        تماس با اتولانژ: <span dir="ltr">{CONTACT.phone}</span>
      </a>
    </div>
  );
}
