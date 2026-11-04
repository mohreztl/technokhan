'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, Zap } from 'lucide-react';
import { HERO_MEDIA } from '@/content/media-assets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const slides = [
  { kicker: 'صدای متمرکز، بدون حاشیه', title: 'فناوری که حواس شما را آزاد می‌کند.', text: 'هدفون‌های نویزکنسلینگ منتخب برای شنیدن دقیق، تماس شفاف و تمرکز طولانی؛ با ضمانت اصالت و مشاوره واقعی.', product: 'هدفون بی‌سیم نویزکنسلینگ', spec: 'ANC / ۲۰ ساعت', cta: '/category/headphones' },
  { kicker: 'یک میز، یک سیستم شارژ', title: 'قدرت بیشتر، در ابعاد کوچک‌تر.', text: 'شارژرهای GaN، ساعت‌های هوشمند و صدای همراه؛ ابزارهایی که طراحی دقیقشان را هر روز حس می‌کنید.', product: 'سیستم GaN + پوشیدنی', spec: '۱۴۰W / Qi2', cta: '/category/chargers' },
];

/** Dramatic two-scene hero with local LCP imagery and floating product facts. */
export function HeroShowcase() {
  const [active, setActive] = React.useState(0);
  const slide = slides[active]!;
  return (
    <section className="relative isolate min-h-[690px] overflow-hidden rounded-3xl border border-white/10 bg-[#090b0c] text-[#f3f5ee] sm:min-h-[650px]" aria-label="ویترین تکنو خان">
      {HERO_MEDIA.map((item, index) => (
        <Image key={item.src} src={item.src} alt={item.alt} fill priority={index === 0} fetchPriority={index === 0 ? 'high' : 'low'} sizes="(max-width: 768px) 100vw, 1400px" className={cn('-z-20 object-cover object-left transition-opacity duration-500 max-lg:opacity-40', active === index ? 'opacity-100' : 'opacity-0')} />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[#090b0c] via-[#090b0cdd] to-transparent max-lg:bg-gradient-to-t max-lg:from-[#090b0c] max-lg:via-[#090b0cbb]" />
      <div className="relative grid min-h-[690px] content-between gap-10 p-6 sm:min-h-[650px] sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
        <div className="max-w-2xl">
          <Badge variant="original" className="mb-5 border-white/20 bg-white/10 text-white"><ShieldCheck className="size-3.5" aria-hidden="true" /> ضمانت اصالت و بررسی سریال</Badge>
          <p className="mb-4 text-sm font-semibold text-[#c8f45a]">{slide.kicker}</p>
          <h1 className="text-balance text-4xl font-black leading-[1.25] tracking-tight sm:text-5xl lg:text-6xl">{slide.title}</h1>
          <p className="mt-5 max-w-xl text-sm leading-8 text-white/70 sm:text-base">{slide.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href={slide.cta}>انتخاب گجت <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" /></Link></Button>
            <Button asChild size="lg" variant="glass" className="border-white/20 bg-white/10 text-white hover:bg-white/15"><Link href="/shop">مشاهده فروشگاه</Link></Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/65">
            <span className="inline-flex items-center gap-2"><Truck className="size-4 text-[#c8f45a]" aria-hidden="true" /> ارسال سریع با رهگیری</span>
            <span className="inline-flex items-center gap-2"><Zap className="size-4 text-[#c8f45a]" aria-hidden="true" /> ۷ روز فرصت بازگشت</span>
          </div>
        </div>
        <div className="flex items-end lg:justify-end">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs text-white/55">روی صحنه</p><p className="mt-1 font-bold">{slide.product}</p></div><Badge className="bg-[#c8f45a] text-[#111315]" dir="ltr">{slide.spec}</Badge></div>
            <div className="mt-4 flex gap-2" role="group" aria-label="انتخاب نمایش محصول">
              {slides.map((item, index) => <button key={item.kicker} type="button" aria-pressed={active === index} onClick={() => setActive(index)} className={cn('min-h-11 flex-1 rounded-xl border px-3 text-xs font-semibold transition-colors', active === index ? 'border-[#c8f45a] bg-[#c8f45a] text-[#111315]' : 'border-white/15 text-white/70 hover:bg-white/10')}>{index === 0 ? 'صدا و تمرکز' : 'قدرت و اتصال'}</button>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
