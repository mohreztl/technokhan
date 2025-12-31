'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ServiceCard } from '@/components/molecules/service-card';
import { Button } from '@/components/ui/button';
import { ROUTES, ServiceType } from '@autolounge/shared';
import type { Service } from '@autolounge/shared';

// Mock data - Replace with API call
const featuredServices: Service[] = [
  {
    id: '1',
    name: 'رپینت و صافکاری کامل',
    nameEn: 'Full Paint Restoration',
    description:
      'بازگرداندن درخشش اصلی رنگ خودرو با تکنیک‌های پیشرفته رپینت و صافکاری توسط متخصصان مجرب',
    descriptionEn: 'Restore original paint shine with advanced techniques',
    price: 15000000,
    duration: 480, // 8 hours
    type: ServiceType.PAINT_RESTORATION,
    images: ['/images/services/paint-restoration.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'دیتیلینگ حرفه‌ای خودرو',
    nameEn: 'Professional Car Detailing',
    description: 'شست‌وشو، واکس و پولیش کامل داخل و خارج خودرو با محصولات برند جهانی',
    descriptionEn: 'Complete interior and exterior detailing',
    price: 3500000,
    duration: 240, // 4 hours
    type: ServiceType.DETAILING,
    images: ['/images/services/detailing.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'سرامیک بدنه (نانو سرامیک)',
    nameEn: 'Ceramic Coating',
    description: 'محافظت ۵ ساله از رنگ خودرو با پوشش نانو سرامیک درجه یک و ضد آب',
    descriptionEn: '5-year protection with premium nano ceramic',
    price: 8000000,
    duration: 360, // 6 hours
    type: ServiceType.CERAMIC_COATING,
    images: ['/images/services/ceramic-coating.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const FeaturedServices: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

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
            <span className="text-primary font-semibold text-sm">خدمات حرفه‌ای</span>
          </motion.div>
          <h2 className="section-title text-gradient-luxury">خدمات ویژه اتولانژ</h2>
          <p className="section-subtitle">
            بهترین خدمات مراقبت از خودرو با بالاترین کیفیت و تضمین رضایت
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link href={ROUTES.SERVICES}>
            <Button variant="outline" size="lg" className="gap-3">
              مشاهده تمام خدمات
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
