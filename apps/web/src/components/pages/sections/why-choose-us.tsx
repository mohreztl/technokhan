'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Clock, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-primary/10 via-secondary/5 to-transparent rounded-full blur-3xl" />

      {/* Animated Gradient */}
      <motion.div
        className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"
        animate={{
          y: [0, 50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="text-primary font-semibold text-sm">مزایای ما</span>
          </motion.div>
          <h2 className="section-title text-gradient-luxury">چرا اتولانژ؟</h2>
          <p className="section-subtitle">دلایل انتخاب ما به عنوان بهترین مرکز مراقبت از خودرو</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-luxury">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center mb-6 shadow-glow-primary group-hover:shadow-glow-secondary transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <Icon className="h-9 w-9 text-primary-foreground relative z-10" />
                        <div className="absolute inset-0 bg-gradient-shine bg-[length:200%_100%] animate-shine rounded-2xl" />
                      </motion.div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
