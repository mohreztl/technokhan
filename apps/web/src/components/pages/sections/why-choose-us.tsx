'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, HeartHandshake, Shield, Sparkles, Users } from 'lucide-react';
import { AmbientOrbs } from '@/components/ui/ambient';
import { staggerContainerFast, cardEntrance } from '@/lib/animation-variants';

const features = [
  {
    icon: Shield,
    title: 'تضمین کیفیت',
    description: 'استفاده از بهترین محصولات و تجهیزات حرفه‌ای با ضمانت کیفیت',
  },
  {
    icon: Award,
    title: 'متخصصان مجرب',
    description: 'تیم حرفه‌ای با بیش از ۱۰ سال تجربه در زمینه دیتیلینگ و رپینت',
  },
  {
    icon: Clock,
    title: 'سرویس سریع',
    description: 'زمان‌بندی دقیق و تحویل به موقع خودرو با بالاترین کیفیت',
  },
  {
    icon: HeartHandshake,
    title: 'پشتیبانی ۲۴/۷',
    description: 'پشتیبانی و مشاوره رایگان در تمام ساعات شبانه‌روز',
  },
  {
    icon: Sparkles,
    title: 'تجهیزات مدرن',
    description: 'استفاده از جدیدترین دستگاه‌ها و فناوری‌های روز دنیا',
  },
  {
    icon: Users,
    title: 'رضایت مشتریان',
    description: 'بیش از ۵۰۰۰ مشتری راضی و امتیاز عالی در نظرسنجی‌ها',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24" aria-labelledby="why-title">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary/10 via-secondary/5 to-transparent" />
      <AmbientOrbs variant="section" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:text-secondary">
            مزایای ما
          </span>
          <h2 id="why-title" className="section-title text-gradient-luxury">
            چرا اتولانژ؟
          </h2>
          <p className="section-subtitle !mb-0">
            دلایل انتخاب ما به عنوان بهترین مرکز مراقبت از خودرو
          </p>
        </motion.div>

        <motion.ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={feature.title}
                variants={cardEntrance}
                className="group h-full rounded-2xl border border-border/40 glass-effect p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-luxury sm:p-8"
              >
                <div className="flex items-start gap-4 text-start sm:flex-col sm:items-center sm:text-center">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary shadow-glow-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-secondary sm:mb-2 sm:h-20 sm:w-20">
                    <Icon className="relative z-10 h-7 w-7 text-primary-foreground sm:h-9 sm:w-9" aria-hidden="true" />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-lg font-bold text-foreground transition-colors group-hover:text-primary dark:group-hover:text-secondary sm:mb-3 sm:text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
};
