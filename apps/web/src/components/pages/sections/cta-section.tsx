'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES, CONTACT } from '@autolounge/shared';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.6, 0.3, 0.6],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-effect-strong rounded-3xl p-12 md:p-16 text-center max-w-5xl mx-auto shadow-luxury border border-primary/20"
        >
          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
            آماده تجربه
            <span className="text-gradient-luxury block mt-2"> بهترین خدمات </span>
            هستید؟
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            همین الان نوبت خود را رزرو کنید و از{' '}
            <span className="text-secondary font-semibold">تخفیف ویژه</span> مشتریان جدید بهره‌مند
            شوید
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
            <Link href={ROUTES.BOOKING}>
              <Button
                variant="primary"
                size="xl"
                className="gap-3 text-lg px-12 shadow-glow-primary hover:shadow-glow-secondary transition-all duration-300"
              >
                <Calendar className="h-6 w-6" />
                رزرو آنلاین نوبت
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <a href={`tel:${CONTACT.phoneEn}`}>
              <Button
                variant="secondary"
                size="xl"
                className="gap-3 text-lg px-12 shadow-glow-secondary"
              >
                <Phone className="h-6 w-6" />
                تماس تلفنی
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="font-medium">۵۰۰۰+ مشتری راضی</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="font-medium">تضمین کیفیت ۱۰۰٪</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="font-medium">پشتیبانی ۲۴/۷</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
