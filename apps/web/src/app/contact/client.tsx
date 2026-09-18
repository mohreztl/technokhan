'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  MapPin,
  Phone,
  Send,
  Smartphone,
} from 'lucide-react';
import { InstagramIcon, WhatsappIcon } from '@/components/icons/brands';
import { FAQ, contactSchema, toPersianDigits } from '@autolounge/shared';
import type { SiteSettings } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { contactApi } from '@/lib/api/endpoints';
import { useSettings } from '@/lib/hooks/use-settings';
import { closedDaysLabel } from '@/lib/settings-format';
import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/animation-variants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeading } from '@/components/ui/premium-components';
import { showToast } from '@/components/ui/toaster';
import { ConfettiBurst } from '@/components/creative/confetti-burst';
import { FaqAccordion } from '@/components/catalog/faq-accordion';
import { ContactMap } from '@/components/pages/contact-map';

type ContactFormValues = z.input<typeof contactSchema>;

const SUBJECTS = ['رزرو نوبت', 'مشاورهٔ خدمات', 'سفارش و ارسال محصولات', 'همکاری و استخدام', 'انتقاد و پیشنهاد', 'سایر'];

/** Contact cards, built from whatever the shop has saved; a cleared field drops its card. */
function contactCards(settings: SiteSettings) {
  return [
    settings.phone && {
      icon: Phone, label: 'تلفن ثابت', value: toPersianDigits(settings.phone), href: `tel:${settings.phone}`, ltr: true,
    },
    settings.mobile && {
      icon: Smartphone, label: 'موبایل', value: toPersianDigits(settings.mobile), href: `tel:${settings.mobile}`, ltr: true,
    },
    settings.email && {
      icon: Mail, label: 'ایمیل', value: settings.email, href: `mailto:${settings.email}`, ltr: true,
    },
    settings.whatsapp && {
      icon: WhatsappIcon, label: 'واتس‌اپ', value: 'گفت‌وگو در واتس‌اپ', href: settings.whatsapp, external: true,
    },
    settings.telegram && {
      icon: Send, label: 'تلگرام', value: 'پیام در تلگرام', href: settings.telegram, external: true,
    },
    settings.instagram && {
      icon: InstagramIcon, label: 'اینستاگرام', value: 'autolounge.ir', href: settings.instagram, external: true, ltr: true,
    },
  ].filter(Boolean) as {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href: string;
    ltr?: boolean;
    external?: boolean;
  }[];
}

function useFaqCategories() {
  return React.useMemo(() => {
    const categories = Array.from(new Set(FAQ.map((item) => item.category ?? 'عمومی')));
    return categories;
  }, []);
}

export function ContactPageClient() {
  const settings = useSettings();
  const searchParams = useSearchParams();
  const prefill = searchParams.get('subject')?.trim() ?? '';
  const subjectOptions = React.useMemo(
    () => (prefill && !SUBJECTS.includes(prefill) ? [prefill, ...SUBJECTS] : SUBJECTS),
    [prefill]
  );

  const [sent, setSent] = React.useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '', email: '', subject: prefill || SUBJECTS[0], message: '' },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      showToast.error('لطفاً اطلاعات فرم را بررسی کنید');
      return;
    }
    const result = await contactApi.send(parsed.data);
    if (!result.ok) {
      showToast.error('ارسال پیام انجام نشد', result.error);
      return;
    }
    setSent(true);
  };

  const resetForm = () => {
    form.reset({ name: '', phone: '', email: '', subject: SUBJECTS[0], message: '' });
    setSent(false);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(settings.address);
      showToast.success('آدرس کپی شد');
    } catch {
      showToast.error('امکان کپی وجود ندارد');
    }
  };

  const cards = React.useMemo(() => contactCards(settings), [settings]);
  const closedLabel = closedDaysLabel(settings.closedWeekdays);
  const categories = useFaqCategories();
  const [faqCategory, setFaqCategory] = React.useState<string>('all');
  const faqItems = faqCategory === 'all' ? FAQ : FAQ.filter((item) => (item.category ?? 'عمومی') === faqCategory);

  return (
    <div className="pb-8 lg:pb-16">
      {/* Header */}
      <section className="py-12 text-center lg:py-16" aria-labelledby="contact-title">
        <div className="container-custom">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-secondary">تماس با ما</p>
          <h1 id="contact-title" className="mx-auto max-w-2xl text-balance text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
            در کنار شما هستیم
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-7 text-muted-foreground sm:text-base">
            برای مشاوره، رزرو یا پیگیری سفارش از هر راهی که راحت‌ترید با ما در ارتباط باشید.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-12 lg:pb-16" aria-label="راه‌های ارتباطی">
        <div className="container-custom">
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig.once}
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
          >
            {cards.map(({ icon: Icon, label, value, href, external, ltr }) => (
              <motion.li key={label} variants={fadeInUp}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="flex h-full min-h-22 items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">{label}</span>
                    <span className={cn('block truncate text-sm font-bold text-foreground', ltr && 'text-start')} dir={ltr ? 'ltr' : undefined}>
                      {value}
                    </span>
                  </span>
                </a>
              </motion.li>
            ))}

            <motion.li variants={fadeInUp} className="col-span-2 lg:col-span-1">
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">آدرس</span>
                  <p className="mt-0.5 text-sm font-bold leading-6 text-foreground">{settings.address}</p>
                  <Button type="button" variant="link" size="sm" onClick={copyAddress} className="mt-1 min-h-10 gap-1.5 px-0">
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    کپی
                  </Button>
                </div>
              </div>
            </motion.li>

            <motion.li variants={fadeInUp} className="col-span-2 lg:col-span-2">
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">ساعات کاری</span>
                  <table className="mt-1 w-full text-sm">
                    <tbody>
                      <tr>
                        <th scope="row" className="py-1 text-start font-semibold text-foreground">ساعات پذیرش</th>
                        <td className="py-1 text-end text-muted-foreground tabular-nums">{settings.workingHours}</td>
                      </tr>
                      {closedLabel && (
                        <tr className="border-t border-border/60">
                          <th scope="row" className="py-1 text-start font-semibold text-foreground">تعطیلی</th>
                          <td className="py-1 text-end text-muted-foreground">{closedLabel}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.li>
          </motion.ul>
        </div>
      </section>

      {/* Form + map */}
      <section className="bg-muted/40 py-16 lg:py-24" aria-labelledby="contact-form-title">
        <div className="container-custom grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              id="contact-form-title"
              eyebrow="فرم تماس"
              title="پیام خود را بنویسید"
              subtitle="در ساعات کاری معمولاً کمتر از یک ساعت پاسخ می‌دهیم."
              align="start"
              className="mb-6"
            />
            <div className="relative rounded-3xl border border-border bg-card p-5 sm:p-7">
              <ConfettiBurst fire={sent} />
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-8 text-center"
                    role="status"
                  >
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-xl font-black text-foreground">پیام شما ارسال شد</h3>
                    <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
                      ممنون که با ما در تماس هستید؛ همکاران ما به‌زودی با شما تماس می‌گیرند.
                    </p>
                    <Button type="button" variant="outline" onClick={resetForm} className="mt-6 min-h-11">
                      ارسال پیام دیگر
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="نام و نام خانوادگی"
                        autoComplete="name"
                        required
                        error={form.formState.errors.name?.message}
                        {...form.register('name')}
                      />
                      <Input
                        label="شماره موبایل"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        dir="ltr"
                        placeholder="0912 345 6789"
                        required
                        className="text-start"
                        error={form.formState.errors.phone?.message}
                        {...form.register('phone')}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="ایمیل (اختیاری)"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        dir="ltr"
                        className="text-start"
                        error={form.formState.errors.email?.message}
                        {...form.register('email')}
                      />
                      <Select
                        label="موضوع"
                        required
                        options={subjectOptions.map((subject) => ({ value: subject, label: subject }))}
                        error={form.formState.errors.subject?.message}
                        {...form.register('subject')}
                      />
                    </div>
                    <Textarea
                      label="پیام"
                      rows={5}
                      required
                      placeholder="هر چه بیشتر توضیح دهید، سریع‌تر می‌توانیم کمک کنیم."
                      error={form.formState.errors.message?.message}
                      {...form.register('message')}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={form.formState.isSubmitting}
                      loadingText="در حال ارسال…"
                      className="min-h-12 w-full gap-2 shadow-glow-primary"
                    >
                      <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                      ارسال پیام
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="موقعیت" title="ما را پیدا کنید" subtitle={settings.address} align="start" className="mb-6" />
            <ContactMap />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-16 lg:py-24" aria-labelledby="contact-faq-title">
        <div className="container-custom max-w-3xl">
          <SectionHeading id="contact-faq-title" eyebrow="سؤالات متداول" title="پاسخ پرسش‌های شما" />
          <div className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" role="group" aria-label="دسته‌بندی سؤالات">
            {[{ id: 'all', label: `همه (${toPersianDigits(FAQ.length)})` }, ...categories.map((c) => ({ id: c, label: c }))].map((chip) => {
              const active = faqCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFaqCategory(chip.id)}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <FaqAccordion key={faqCategory} items={faqItems} />
        </div>
      </section>
    </div>
  );
}
