import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { APP_NAME } from '@autolounge/shared';

const guarantees = [
  { icon: ShieldCheck, title: 'ضمانت اصالت', text: 'سریال و منشأ کالا بررسی می‌شود' },
  { icon: Truck, title: 'ارسال سریع', text: 'بسته‌بندی امن و رهگیری آنلاین' },
  { icon: RotateCcw, title: '۷ روز فرصت بازگشت', text: 'با شرایط شفاف و بدون پیچیدگی' },
  { icon: Headphones, title: 'مشاوره انتخاب', text: 'راهنمایی پیش از خرید، نه فقط فروش' },
];

/** Storefront assurances, useful navigation and honest demo contact information. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary pb-24 lg:pb-0">
      <div className="container-custom grid gap-6 border-b border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
        {guarantees.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card"><Icon className="size-5 text-secondary" aria-hidden="true" /></span><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{text}</p></div></div>)}
      </div>
      <div className="container-custom grid gap-10 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-lg font-black text-background">T</span><span className="text-xl font-black">{APP_NAME}</span></Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">فروشگاه مستقل گجت و لوازم جانبی دیجیتال با انتخاب محدود، مشخصات روشن و راهنمای خرید فارسی.</p>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">این نسخه نمایشی است؛ سفارش و پرداخت در حالت دمو انجام می‌شود.</p>
        </div>
        <FooterLinks title="فروشگاه" links={[['همه محصولات', '/shop'], ['پیشنهادهای تخفیف‌دار', '/shop?deals=true'], ['مقایسه محصولات', '/compare'], ['علاقه‌مندی‌ها', '/wishlist']]} />
        <FooterLinks title="راهنما" links={[['مجله تکنو', '/blog'], ['سوالات متداول', '/faq'], ['پیگیری سفارش', '/track'], ['تماس با ما', '/contact']]} />
        <FooterLinks title="تکنو خان" links={[['درباره ما', '/about'], ['دیزاین سیستم', '/design-system'], ['حریم خصوصی', '/privacy'], ['شرایط استفاده', '/terms']]} />
      </div>
      <div className="container-custom flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 text-xs text-muted-foreground"><span>© ۱۴۰۵ تکنو خان</span><span dir="ltr">technokhan.com</span></div>
    </footer>
  );
}

interface FooterLinksProps { title: string; links: [string, string][] }
function FooterLinks({ title, links }: FooterLinksProps) {
  return <nav aria-label={title}><h2 className="mb-4 text-sm font-bold">{title}</h2><ul className="space-y-3 text-sm text-muted-foreground">{links.map(([label, href]) => <li key={href}><Link href={href} className="inline-flex min-h-8 items-center transition-colors hover:text-foreground">{label}</Link></li>)}</ul></nav>;
}
