'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TicketCheck } from 'lucide-react';
import { contactSchema, type ContactSchemaInput } from '@technokhan/shared';
import { contactApi } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TicketStatus {
  error: boolean;
  text: string;
  id?: string;
}

export function SupportTicketForm() {
  const [status, setStatus] = React.useState<TicketStatus | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactSchemaInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: 'راهنمای انتخاب محصول' },
  });

  const submit = async (values: ContactSchemaInput) => {
    setStatus(null);
    const result = await contactApi.send(values);
    if (result.ok) {
      setStatus({ error: false, text: result.data.message, id: result.data.id });
      reset();
    } else {
      setStatus({ error: true, text: result.error || 'ثبت تیکت انجام نشد. اتصال را بررسی و دوباره تلاش کنید.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate aria-labelledby="support-ticket-title" className="space-y-4">
      <div>
        <h3 id="support-ticket-title" className="font-black">ثبت تیکت پشتیبانی</h3>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">مشخصات تماس و شرح مسئله را بنویسید تا کارشناسان پیگیری کنند.</p>
      </div>
      <Input label="نام و نام خانوادگی" required autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input label="شماره موبایل" required type="tel" inputMode="tel" dir="ltr" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      <Input label="موضوع" required error={errors.subject?.message} {...register('subject')} />
      <Textarea label="شرح مسئله" required rows={4} placeholder="مدل دستگاه یا شماره سفارش را هم بنویسید." error={errors.message?.message} {...register('message')} />
      <Button type="submit" className="w-full" loading={isSubmitting} loadingText="در حال ثبت تیکت…"><TicketCheck className="size-4" aria-hidden="true" />ثبت تیکت</Button>
      {status && (
        <div role="status" className={status.error ? 'rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs leading-6 text-destructive' : 'rounded-xl border border-secondary/30 bg-secondary/10 p-3 text-xs leading-6'}>
          <p>{status.text}</p>
          {status.id && <p className="mt-1 font-bold">کد تیکت: <span dir="ltr">{status.id}</span></p>}
        </div>
      )}
    </form>
  );
}
