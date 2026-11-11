import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, PackageSearch, ShieldCheck, WandSparkles } from 'lucide-react';
import { HERO_MEDIA } from '@/content/media-assets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/storefront/section-header';

export const metadata: Metadata = {
  title: 'درباره تکنو خان',
  description: 'تکنو خان فروشگاه مستقل گجت و لوازم جانبی دیجیتال است؛ انتخاب محدود، اطلاعات روشن و ضمانت اصالت.',
  alternates: { canonical: '/about' },
};

/** Brand story, operating principles and direct paths to catalog and magazine. */
export default function AboutPage() {
  const principles = [
    { icon: ShieldCheck, title: 'اصالت قبل از قیمت', text: 'هر محصول با منشأ و سریال قابل بررسی عرضه می‌شود. ارزان‌ترین پیشنهاد، اگر اصالتش روشن نباشد، وارد فروشگاه نمی‌شود.' },
    { icon: PackageSearch, title: 'ویترین محدود و سنجیده', text: 'به‌جای هزاران کالای مشابه، مدل‌هایی را انتخاب می‌کنیم که از نظر کیفیت ساخت، سازگاری و پشتیبانی قابل دفاع‌اند.' },
    { icon: WandSparkles, title: 'راهنما قبل از فروش', text: 'مشخصات فنی به فارسی روشن می‌شود و راهنمای انتخاب بر اساس دستگاه و بودجه، نه فقط فروش بیشتر تصمیم می‌گیرد.' },
  ];
  return (
    <div className="container-custom py-8 sm:py-12">
      <header className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <Badge variant="original">درباره تکنو خان</Badge>
          <h1 className="mt-5 text-balance text-4xl font-black leading-tight sm:text-6xl">تکنولوژی باید انتخابش آسان باشد.</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">تکنو خان برای کسانی ساخته شده که می‌خواهند گجت خوب بخرند، نه بیشترین گجت را. ما مشخصات پیچیده را به انتخاب روشن تبدیل می‌کنیم و پشت هر محصول، اصالت و تجربه استفاده واقعی را بررسی می‌کنیم.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Button asChild size="lg"><Link href="/shop">مشاهده فروشگاه</Link></Button><Button asChild size="lg" variant="outline"><Link href="/blog">خواندن مجله تکنو</Link></Button></div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border"><Image src={HERO_MEDIA[1].src} alt={HERO_MEDIA[1].alt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      </header>
      <section className="mt-14"><SectionHeader title="سه اصل کاری ما" description="این اصول تصمیم می‌گیرند چه محصولی وارد تکنو خان شود و چه اطلاعاتی در اختیار شما قرار گیرد." /><div className="grid gap-5 md:grid-cols-3">{principles.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-border bg-card p-6"><Icon className="size-6 text-secondary" aria-hidden="true" /><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></article>)}</div></section>
      <section className="mt-14 rounded-3xl bg-foreground p-7 text-background sm:p-10">
        <h2 className="text-2xl font-black">تعهد ما به خرید شفاف</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{['قیمت و تخفیف واقعی بدون بازی با درصد', 'گارانتی و شرایط بازگشت پیش از پرداخت روشن', 'عکس و مشخصات متناسب با مدل دقیق محصول', 'پاسخ صادقانه وقتی محصولی مناسب شما نیست'].map((item) => <p key={item} className="flex items-start gap-2 text-sm leading-7 text-background/75"><Check className="mt-1 size-4 shrink-0 text-[#c8f45a]" aria-hidden="true" />{item}</p>)}</div>
      </section>
    </div>
  );
}
