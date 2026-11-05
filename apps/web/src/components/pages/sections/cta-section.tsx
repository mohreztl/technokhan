'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Calendar, Clock, Phone, Users } from 'lucide-react';
import { CONTACT, ROUTES } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { AmbientOrbs } from '@/components/ui/ambient';

const TRUST = [
  { icon: Users, text: '۵۰۰۰+ مشتری راضی', tone: 'bg-success/15 text-success' },
  { icon: BadgeCheck, text: 'تضمین کیفیت ۱۰۰٪', tone: 'bg-primary/15 text-primary dark:text-secondary' },
  { icon: Clock, text: 'پشتیبانی ۲۴/۷', tone: 'bg-info/15 text-info' },
];

export const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24" aria-labelledby="cta-title">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />
      <AmbientOrbs variant="section" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl rounded-3xl border border-primary/20 glass-effect-strong p-6 text-center shadow-luxury sm:p-12 md:p-16"
        >
          <h2
            id="cta-title"
            className="mb-4 text-balance text-3xl font-black leading-tight text-foreground sm:mb-6 sm:text-4xl md:text-6xl"
          >
            آماده تجربه
            <span className="text-gradient-luxury mt-1 block sm:mt-2"> بهترین خدمات </span>
            هستید؟
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mb-10 sm:text-xl">
            همین الان نوبت خود را رزرو کنید و از{' '}
            <span className="font-semibold text-secondary">تخفیف ویژه</span> مشتریان جدید
            بهره‌مند شوید
          </p>

          <div className="mb-8 flex flex-col items-stretch justify-center gap-3 sm:mb-10 sm:flex-row sm:items-center sm:gap-5">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="gap-3 rounded-xl shadow-glow-primary transition-all duration-300 hover:shadow-glow-secondary sm:px-12"
            >
              <Link href={ROUTES.BOOKING}>
                <Calendar className="h-5 w-5" aria-hidden="true" />
                رزرو آنلاین نوبت
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="gap-3 rounded-xl shadow-glow-secondary sm:px-12"
            >
              <a href={`tel:${CONTACT.phoneEn}`}>
                <Phone className="h-5 w-5" aria-hidden="true" />
                تماس تلفنی
              </a>
            </Button>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-4 border-t border-border/40 pt-6 sm:gap-8 sm:pt-8">
            {TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.text}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:text-base"
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};
