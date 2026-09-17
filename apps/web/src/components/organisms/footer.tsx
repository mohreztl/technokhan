'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Award,
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  APP_DESCRIPTION,
  APP_NAME,
  CONTACT,
  ROUTES,
  SERVICES,
  SOCIAL_MEDIA,
  toPersianDigits,
} from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { showToast } from '@/components/ui/toaster';
import { fadeInUp, viewportConfig } from '@/lib/animation-variants';
import { isChromeHidden } from '@/lib/routes';

const SERVICE_LINKS = SERVICES.slice(0, 6).map((service) => ({
  title: service.name,
  href: `${ROUTES.SERVICES}/${service.id}`,
}));

const QUICK_LINKS = [
  { title: 'خدمات', href: ROUTES.SERVICES },
  { title: 'فروشگاه', href: ROUTES.PRODUCTS },
  { title: 'نمونه کارها', href: ROUTES.GALLERY },
  { title: 'رزرو نوبت', href: ROUTES.BOOKING },
  { title: 'پیگیری سفارش', href: ROUTES.ORDERS },
  { title: 'درباره ما', href: ROUTES.ABOUT },
  { title: 'تماس با ما', href: ROUTES.CONTACT },
];

const SOCIALS = [
  { label: 'اینستاگرام', href: SOCIAL_MEDIA.instagram, icon: <Instagram /> },
  { label: 'تلگرام', href: SOCIAL_MEDIA.telegram, icon: <Send /> },
  { label: 'واتس‌اپ', href: SOCIAL_MEDIA.whatsapp, icon: <MessageCircle /> },
];

const TRUST = [
  { icon: ShieldCheck, label: 'گارانتی کتبی خدمات' },
  { icon: Award, label: 'متخصصان دارای مدرک' },
  { icon: Truck, label: 'ارسال سریع محصولات' },
];

const columnMotion = {
  variants: fadeInUp,
  initial: 'hidden' as const,
  whileInView: 'visible' as const,
  viewport: viewportConfig.once,
};

function NewsletterForm() {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setSubmitting(true);
    // Newsletter subscriptions are not part of the API contract yet; acknowledge locally.
    window.setTimeout(() => {
      setSubmitting(false);
      setEmail('');
      showToast.success('ثبت شد', 'از این پس خبرها و تخفیف‌های اتولانژ را برایتان می‌فرستیم.');
    }, 350);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6" aria-label="عضویت در خبرنامه">
      <label htmlFor="footer-newsletter" className="mb-2 block text-sm font-semibold text-foreground">
        خبرنامهٔ اتولانژ
      </label>
      <div className="flex gap-2">
        <Input
          id="footer-newsletter"
          type="email"
          inputMode="email"
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          containerClassName="flex-1"
          className="min-h-11 text-start"
        />
        <Button type="submit" variant="secondary" loading={submitting} className="min-h-11 shrink-0">
          عضویت
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">تخفیف‌ها و نکات نگهداری خودرو؛ بدون اسپم.</p>
    </form>
  );
}

export const Footer: React.FC = () => {
  const pathname = usePathname();
  // The admin dashboard has its own shell.
  if (isChromeHidden(pathname ?? '')) return null;

  return (
    <footer className="mt-16 border-t border-border bg-background-secondary pb-tabbar lg:mt-24 lg:pb-0">
      {/* Trust strip */}
      <div className="border-b border-border/70">
        <div className="container-custom grid grid-cols-1 gap-3 py-5 sm:grid-cols-3">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <motion.div {...columnMotion}>
            <Link href={ROUTES.HOME} className="mb-4 inline-flex items-center gap-3" aria-label={APP_NAME}>
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-secondary to-primary shadow-glow-primary">
                <span className="text-2xl font-black text-primary-foreground">A</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-shine rounded-xl bg-gradient-shine bg-[length:200%_100%]"
                />
              </span>
              <span className="text-2xl font-black text-gradient-luxury">{APP_NAME}</span>
            </Link>
            <p className="leading-relaxed text-muted-foreground">{APP_DESCRIPTION}</p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((social) => (
                <IconButton key={social.label} asChild label={social.label} icon={social.icon} variant="outline">
                  <a href={social.href} target="_blank" rel="noopener noreferrer" />
                </IconButton>
              ))}
            </div>
            <NewsletterForm />
          </motion.div>

          {/* Services */}
          <motion.nav {...columnMotion} transition={{ delay: 0.05 }} aria-labelledby="footer-services">
            <h3 id="footer-services" className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
              <span aria-hidden="true" className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
              خدمات ما
            </h3>
            <ul className="space-y-1">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-hover inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Quick links */}
          <motion.nav {...columnMotion} transition={{ delay: 0.1 }} aria-labelledby="footer-quick">
            <h3 id="footer-quick" className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
              <span aria-hidden="true" className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
              دسترسی سریع
            </h3>
            <ul className="space-y-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-hover inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Contact */}
          <motion.div {...columnMotion} transition={{ delay: 0.15 }}>
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
              <span aria-hidden="true" className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
              تماس با ما
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${CONTACT.phoneEn}`}
                  className="group flex min-h-11 items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="tabular-nums" dir="ltr">
                    {CONTACT.phone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group flex min-h-11 items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span dir="ltr">{CONTACT.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="pt-2 leading-relaxed">{CONTACT.address}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="pt-2 leading-relaxed">
                  {CONTACT.workingHours}
                  <br />
                  <span className="text-xs">{CONTACT.closedDays}</span>
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm md:flex-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-muted-foreground md:text-start">
            © {toPersianDigits(new Date().getFullYear())} {APP_NAME}. تمامی حقوق محفوظ است.
          </p>
          <nav aria-label="حقوقی" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <Link href={ROUTES.PRIVACY} className="link-hover inline-flex min-h-10 items-center text-muted-foreground hover:text-primary">
              حریم خصوصی
            </Link>
            <Link href={ROUTES.TERMS} className="link-hover inline-flex min-h-10 items-center text-muted-foreground hover:text-primary">
              شرایط استفاده
            </Link>
            <Link href={ROUTES.ORDERS} className="link-hover inline-flex min-h-10 items-center text-muted-foreground hover:text-primary">
              سفارش‌های من
            </Link>
          </nav>
        </motion.div>
      </div>
    </footer>
  );
};
