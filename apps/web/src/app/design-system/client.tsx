'use client';

import * as React from 'react';
import { Box, Check, Info, Search, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { TECHNO_TOKENS } from '@/lib/design-tokens';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { RangeSlider } from '@/components/ui/range-slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars } from '@/components/ui/rating-stars';
import { PriceTag } from '@/components/ui/price-tag';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

interface ShowcaseProps {
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}

/** Consistent live-example section used by the design-system gallery. */
function Showcase({ title, description, children, wide }: ShowcaseProps) {
  return (
    <section className={wide ? 'lg:col-span-2' : undefined}>
      <div className="mb-4 border-b border-border pb-3">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-control sm:p-6">{children}</div>
    </section>
  );
}

/** Interactive kitchen sink covering every public primitive and design token. */
export function DesignSystemShowcase() {
  const [range, setRange] = React.useState<[number, number]>([3_000_000, 18_000_000]);
  const [notifications, setNotifications] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <div className="container-custom py-10 sm:py-14">
      <header className="mb-12 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <Badge variant="original" className="mb-5">TechnoKhan / Interface language</Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-black leading-tight tracking-tight sm:text-6xl">قطعه‌ها پیش از محصول؛ دقیق، خوانا و راست‌چین.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">زبان بصری تکنو خان از بدنه دستگاه‌های دیجیتال الهام می‌گیرد: سطح مات، خط دقیق و یک سیگنال Volt برای اقدام. این صفحه مرجع زنده همه حالت‌هاست.</p>
        </div>
        <div className="rounded-2xl border border-border bg-foreground p-6 text-background">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">تم نمایش</span>
            <ThemeSwitcher />
          </div>
          <p className="mt-5 text-xs leading-6 opacity-75">تغییر تم فقط توکن‌ها را عوض می‌کند؛ سلسله‌مراتب و معنای کنترل‌ها ثابت می‌ماند.</p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
        <Showcase title="رنگ و معنا" description="رنگ برای اقدام، تخفیف و وضعیت موجودی استفاده می‌شود، نه تزئین بی‌هدف." wide>
          <div className="grid gap-6 md:grid-cols-3">
            {(['light', 'dark', 'semantic'] as const).map((group) => (
              <div key={group}>
                <h3 className="mb-3 text-sm font-bold">{group === 'light' ? 'روشن' : group === 'dark' ? 'تیره' : 'وضعیت'}</h3>
                <ul className="space-y-2">
                  {Object.entries(TECHNO_TOKENS.colors[group]).map(([name, color]) => (
                    <li key={name} className="flex items-center gap-3 text-xs">
                      <span className="size-10 rounded-xl border border-foreground/15 shadow-inner" style={{ backgroundColor: color }} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-muted-foreground" dir="ltr">{name}</span>
                      <code className="tabular-nums text-foreground" dir="ltr">{color}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Showcase>

        <Showcase title="تایپوگرافی فارسی" description="Vazirmatn متغیر با rhythm آرام برای متن و اعداد هم‌عرض برای داده." wide>
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">تکنولوژی، بی‌صدا و دقیق.</p>
              <p className="mt-4 max-w-prose text-base leading-8 text-muted-foreground">هر جزء باید در نگاه اول خوانا باشد؛ از نام یک هدفون تا مشخصات توان شارژ و شرایط گارانتی. طول خط و فاصله سطر برای خواندن فارسی تنظیم شده است.</p>
            </div>
            <dl className="rounded-xl bg-muted p-5 tabular-nums">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">توان خروجی</dt><dd className="font-bold" dir="ltr">۱۴۰ W</dd></div>
              <div className="mt-4 flex justify-between gap-4"><dt className="text-muted-foreground">قیمت</dt><dd className="font-bold">۴.۸۹۰.۰۰۰ تومان</dd></div>
              <div className="mt-4 flex justify-between gap-4"><dt className="text-muted-foreground">موجودی</dt><dd className="font-bold">۱۲ عدد</dd></div>
            </dl>
          </div>
        </Showcase>

        <Showcase title="دکمه‌ها" description="اقدام اصلی در هر ناحیه یکی است؛ سایر حالت‌ها آرام‌تر می‌مانند.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>افزودن به سبد</Button>
            <Button variant="secondary">خرید سریع</Button>
            <Button variant="outline">مقایسه</Button>
            <Button variant="ghost">جزئیات</Button>
            <Button variant="glass"><Zap className="size-4" aria-hidden="true" /> شیشه‌ای</Button>
            <Button loading loadingText="در حال بررسی" />
            <Button size="icon" aria-label="جستجو"><Search className="size-5" aria-hidden="true" /></Button>
          </div>
        </Showcase>

        <Showcase title="برچسب و قیمت" description="تخفیف، اصالت، ارسال و امتیاز در کنار قیمت واقعی خوانده می‌شوند.">
          <div className="flex flex-wrap gap-2">
            <Badge variant="deal">۱۸٪ تخفیف</Badge>
            <Badge variant="stock">موجود در انبار</Badge>
            <Badge variant="warning">تنها ۲ عدد</Badge>
            <Badge variant="original"><ShieldCheck className="size-3.5" aria-hidden="true" /> اورجینال</Badge>
            <Badge variant="shipping">ارسال فوری</Badge>
          </div>
          <div className="mt-7 space-y-4">
            <PriceTag price={12_890_000} originalPrice={15_490_000} size="lg" />
            <RatingStars value={4.7} count={128} />
          </div>
        </Showcase>

        <Showcase title="فرم و انتخاب" description="label، راهنما و خطا به کنترل متصل‌اند؛ ورودی فارسی و لاتین هر دو پشتیبانی می‌شوند.">
          <div className="space-y-5">
            <Input label="جستجوی گجت" placeholder="مثلاً شارژر ۱۰۰ وات" startIcon={<Search />} hint="نام محصول یا برند را بنویسید." />
            <Input label="کد سریال" defaultValue="TK-BAD-SKU" error="این سریال در فهرست گارانتی پیدا نشد." dir="ltr" />
            <Select label="مرتب‌سازی" defaultValue="popular" options={[{ value: 'popular', label: 'پرفروش‌ترین' }, { value: 'newest', label: 'جدیدترین' }, { value: 'price', label: 'ارزان‌ترین' }]} />
            <Checkbox label="فقط کالاهای موجود" description="کالاهای ناموجود از نتیجه حذف می‌شوند." defaultChecked />
          </div>
        </Showcase>

        <Showcase title="بازه و کلید" description="اسلایدر با کیبورد کار می‌کند و Switch وضعیت را برای screen reader اعلام می‌کند.">
          <RangeSlider min={0} max={30_000_000} step={500_000} minGap={1_000_000} value={range} onValueChange={setRange} />
          <div className="mt-6 flex min-h-11 items-center justify-between gap-4 border-t border-border pt-5">
            <span className="text-sm font-semibold">اعلان پیشنهادهای فناوری</span>
            <Switch checked={notifications} onCheckedChange={setNotifications} label="اعلان پیشنهادهای فناوری" />
          </div>
        </Showcase>

        <Showcase title="تب و آکاردئون" description="حرکت کیبورد روی تب‌ها و معنای aria-expanded روی آکاردئون فعال است.">
          <Tabs defaultValue="specs">
            <TabsList label="اطلاعات نمونه محصول">
              <TabsTrigger value="specs">مشخصات</TabsTrigger>
              <TabsTrigger value="warranty">گارانتی</TabsTrigger>
              <TabsTrigger value="delivery">ارسال</TabsTrigger>
            </TabsList>
            <TabsContent value="specs"><p className="text-sm text-muted-foreground">بدنه آلومینیومی، توان ۱۴۰ وات و سه پورت خروجی.</p></TabsContent>
            <TabsContent value="warranty"><p className="text-sm text-muted-foreground">۱۸ ماه گارانتی تعویض شرکتی.</p></TabsContent>
            <TabsContent value="delivery"><p className="text-sm text-muted-foreground">ارسال تهران در روز کاری بعد.</p></TabsContent>
          </Tabs>
          <Accordion type="single" defaultValue="original" className="mt-5">
            <AccordionItem value="original">
              <AccordionTrigger>اصالت کالا چگونه بررسی می‌شود؟</AccordionTrigger>
              <AccordionContent>سریال دستگاه با اطلاعات واردکننده و فاکتور رسمی تطبیق داده می‌شود.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Showcase>

        <Showcase title="لایه‌های تعاملی" description="Dialog برای تمرکز و Bottom Sheet برای اقدام موبایل؛ هر دو با Escape یا کنترل بستن قابل خروج‌اند.">
          <div className="flex flex-wrap gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button variant="outline">باز کردن Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>مشاهده سریع محصول</DialogTitle>
                  <DialogDescription>این پنجره native است؛ فوکوس داخل آن می‌ماند و با Escape بسته می‌شود.</DialogDescription>
                </DialogHeader>
                <div className="rounded-xl bg-muted p-4"><PriceTag price={4_890_000} originalPrice={5_490_000} /></div>
                <DialogFooter><Button onClick={() => setDialogOpen(false)}>تأیید و بستن</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setSheetOpen(true)}>باز کردن Sheet</Button>
            <Button variant="ghost" onClick={() => toast.success('به فهرست علاقه‌مندی‌ها اضافه شد.', { icon: <Check className="size-4" /> })}>نمایش Toast</Button>
          </div>
          <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="فیلترهای فروشگاه" description="نمونه کشوی پایین صفحه برای موبایل">
            <div className="space-y-4 py-4"><Checkbox label="فقط کالاهای موجود" defaultChecked /><Checkbox label="دارای ارسال فوری" /></div>
            <Button className="w-full" onClick={() => setSheetOpen(false)}>نمایش نتایج</Button>
          </BottomSheet>
        </Showcase>

        <Showcase title="بارگذاری و بازخورد" description="Skeleton ساختار نهایی را حفظ می‌کند و Toast نتیجه اقدام را بدون جابه‌جایی چیدمان اعلام می‌کند." wide>
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_1.4fr]">
            <div className="space-y-3" aria-label="نمونه در حال بارگذاری">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="rounded-xl border border-dashed border-border p-5">
              <Info className="mb-3 size-5 text-secondary" aria-hidden="true" />
              <h3 className="font-bold">هر حالت، یک پیام مشخص</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">خطا راه رفع مشکل را می‌گوید، حالت خالی اقدام بعدی را پیشنهاد می‌کند و موفقیت همان فعل دکمه را تکرار می‌کند.</p>
              <Button variant="outline" className="mt-4" onClick={() => toast('موجودی محصول به‌روزرسانی شد.', { icon: <Box className="size-4" /> })}>ارسال بازخورد</Button>
            </div>
          </div>
        </Showcase>
      </div>
    </div>
  );
}
