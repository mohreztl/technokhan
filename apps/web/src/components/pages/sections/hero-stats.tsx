'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Package, Users, type LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { staggerContainerFast, cardEntrance } from '@/lib/animation-variants';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
}

const STATS: Stat[] = [
  { value: 10, suffix: '+', label: 'سال تجربه', icon: Award },
  { value: 5000, suffix: '+', label: 'مشتری راضی', icon: Users },
  { value: 100, suffix: '+', label: 'محصول اورجینال', icon: Package },
  { value: 24, suffix: '/۷', label: 'پشتیبانی', icon: Clock },
];

/** Stats strip below the hero — 2×2 on phones, 4 columns on desktop, counters animate in view. */
export function HeroStats() {
  return (
    <section
      id="hero-stats"
      aria-label="آمار اتولانژ"
      className="relative z-10 border-b border-border/40 bg-background-secondary py-8 sm:py-12"
    >
      <div className="container-custom">
        <motion.ul
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.li
                key={stat.label}
                variants={cardEntrance}
                className="group relative overflow-hidden rounded-2xl border border-border/40 glass-effect p-4 text-center transition-shadow duration-300 hover:shadow-luxury sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent"
                />
                <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-secondary/20 group-hover:text-secondary dark:text-secondary sm:mb-3 sm:h-11 sm:w-11">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
                <div className="text-3xl font-black leading-none text-foreground sm:text-4xl lg:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <div className="mt-1.5 text-xs font-medium text-foreground-muted sm:mt-2 sm:text-sm">
                  {stat.label}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
