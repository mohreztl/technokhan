'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Headphones, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';
import { contactSchema, type ContactSchemaInput } from '@technokhan/shared';
import { contactApi } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SupportContactLinks } from '@/components/support/support-contact-links';

/** Validated contact form that uses the live API or the local demo transport. */
export function ContactForm() {
  const [status, setStatus] = React.useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactSchemaInput>({ resolver: zodResolver(contactSchema), defaultValues: { subject: 'راهنمای انتخاب محصول' } });
  const submit = async (values: ContactSchemaInput) => {
    setStatus(null);
    const result = await contactApi.send(values);
    if (result.ok) {
      setStatus(`${result.data.message}. کد پیگیری: ${result.data.id}`);
      reset();
    } else {
      setStatus(result.error || 'ارسال پیام انجام نشد. اتصال را بررسی و دوباره تلاش کنید.');
    }
  };
  return (
    <div className="container-custom grid gap-10 py-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr]">
      <section>
        <Badge variant="original">تماس با تکنو خان</Badge>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">قبل از خرید، سؤال بپرسید.</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">درباره سازگاری دستگاه، اصالت، گارانتی یا وضعیت سفارش بنویسید. تیکت شما ثبت می‌شود و کارشناسان برای پاسخ با شما تماس می‌گیرند.</p>
        <div className="mt-8 space-y-4">
          <SupportItem icon={Mail} title="ایمیل پشتیبانی" text="support@technokhan.com" />
          <SupportItem icon={Headphones} title="راهنمای انتخاب" text="دستگاه و بودجه را در پیام مشخص کنید تا پیشنهاد دقیق‌تر باشد." />
          <SupportItem icon={ShieldCheck} title="بازبینی اصالت" text="مدل و شماره سریال را بنویسید تا مسیر بررسی روشن شود." />
        </div>
        <h2 className="mb-3 mt-8 text-sm font-bold">ارتباط مستقیم</h2>
        <SupportContactLinks />
      </section>
      <form onSubmit={handleSubmit(submit)} noValidate aria-labelledby="contact-form-title" className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <MessageSquareText className="mb-5 size-7 text-secondary" aria-hidden="true" />
        <h2 id="contact-form-title" className="sr-only">فرم ثبت تیکت پشتیبانی</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="نام و نام خانوادگی" required autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Input label="شماره موبایل" required type="tel" inputMode="tel" dir="ltr" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Input label="ایمیل (اختیاری)" type="email" dir="ltr" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Input label="موضوع" required error={errors.subject?.message} {...register('subject')} />
        </div>
        <Textarea className="mt-5" label="پیام" required rows={5} placeholder="مدل دستگاه، بودجه یا شماره سفارش را بنویسید." error={errors.message?.message} {...register('message')} />
        <Button type="submit" size="lg" className="mt-6 w-full" loading={isSubmitting} loadingText="در حال ثبت پیام…">ثبت تیکت</Button>
        {status && <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-sm leading-7 text-foreground">{status}</p>}
      </form>
    </div>
  );
}

function SupportItem({ icon: Icon, title, text }: { icon: typeof Mail; title: string; text: string }) {
  return <div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card"><Icon className="size-5 text-secondary" aria-hidden="true" /></span><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-sm leading-7 text-muted-foreground">{text}</p></div></div>;
}
