'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { SERVICES, type Service } from '@autolounge/shared';
import { SectionHeading } from '@/components/ui/premium-components';
import { QuoteCalculator } from '@/components/catalog/quote-calculator';
import { fadeInUp, viewportConfig } from '@/lib/animation-variants';

export interface QuoteTeaserProps {
  /** Services offered in the configurator (defaults to the full catalog). */
  services?: Service[];
}

const PERKS = [
  'قیمت شفاف بر اساس اندازهٔ خودرو',
  'انتخاب خدمات تکمیلی با یک لمس',
  'رزرو مستقیم با همان قیمت محاسبه‌شده',
];

/** Home teaser for the price configurator (code-split, compact mode). */
export function QuoteTeaser({ services = SERVICES }: QuoteTeaserProps) {
  return (
    <section className="relative overflow-hidden bg-muted/40 py-16 lg:py-24" aria-labelledby="quote-teaser-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-secondary/50 to-transparent"
      />
      <div className="container-custom grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            id="quote-teaser-title"
            eyebrow="برآورد قیمت"
            title="همین حالا قیمت بگیرید"
            subtitle="خدمت و اندازهٔ خودرو را انتخاب کنید تا قیمت دقیق و زمان تقریبی اجرا را قبل از رزرو ببینید."
            align="start"
            className="mb-6 lg:mb-8"
          />
          <ul className="space-y-3">
            {PERKS.map((perk, index) => (
              <motion.li
                key={perk}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfig.once}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3 text-sm text-foreground sm:text-base"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                {perk}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig.once}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-3 -z-10 rounded-4xl bg-linear-to-br from-secondary/20 via-transparent to-primary/10 blur-xl"
          />
          <div className="rounded-3xl border border-border/70 bg-card p-1 shadow-luxury">
            <div className="flex items-center gap-2 px-4 pb-1 pt-3 text-sm font-bold text-foreground">
              <Calculator className="h-4 w-4 text-secondary" aria-hidden="true" />
              ماشین‌حساب قیمت
            </div>
            <QuoteCalculator services={services} compact />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
