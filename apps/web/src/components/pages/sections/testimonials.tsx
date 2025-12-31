'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'علی احمدی',
    role: 'صاحب بنز کلاس E',
    avatar: '/images/avatars/avatar-1.jpg',
    rating: 5,
    text: 'واقعاً فوق‌العاده بود! خودروی من مثل نو شد. تیم بسیار حرفه‌ای و با دقت کار می‌کنند. از رپینت و سرامیک بدنه بسیار راضی هستم.',
  },
  {
    id: '2',
    name: 'محمد رضایی',
    role: 'صاحب BMW سری ۵',
    avatar: '/images/avatars/avatar-2.jpg',
    rating: 5,
    text: 'بهترین مرکز دیتیلینگ که تا حالا تجربه کردم. محصولات درجه یک و کیفیت کار عالی. قیمت‌ها هم منصفانه است. قطعاً دوباره مراجعه خواهم کرد.',
  },
  {
    id: '3',
    name: 'حسین کریمی',
    role: 'صاحب پورشه کاین',
    avatar: '/images/avatars/avatar-3.jpg',
    rating: 5,
    text: 'از خدمات و پشتیبانی عالی اتولانژ بسیار راضی هستم. سیستم رزرو آنلاین خیلی راحت بود و تیم دقیقاً سر وقت کار را شروع کردند.',
  },
  {
    id: '4',
    name: 'رضا موسوی',
    role: 'صاحب لکسوس ES',
    avatar: '/images/avatars/avatar-4.jpg',
    rating: 5,
    text: 'محصولاتی که از فروشگاه آنلاین خریدم اصل بودند و کیفیت عالی داشتند. پیشنهادهای تخصصی تیم پشتیبانی هم خیلی کمک‌کننده بود.',
  },
];

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const previousTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-background-secondary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

      {/* Moving Gradient */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4"
          >
            <span className="text-success font-semibold text-sm">رضایت مشتریان</span>
          </motion.div>
          <h2 className="section-title text-gradient-luxury">نظرات مشتریان</h2>
          <p className="section-subtitle">تجربه مشتریان ما از خدمات اتولانژ</p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="relative shadow-luxury border-primary/20">
                  <CardContent className="p-8 md:p-12">
                    {/* Quote Icon */}
                    <div className="absolute top-8 right-8 text-primary/10">
                      <Quote className="h-20 w-20" fill="currentColor" />
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="h-6 w-6 text-secondary fill-secondary" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-xl text-foreground leading-relaxed mb-8 relative z-10">
                      {testimonials[currentIndex].text}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-glow-primary">
                        {testimonials[currentIndex].name.charAt(0)}
                        <div className="absolute inset-0 bg-gradient-shine bg-[length:200%_100%] animate-shine rounded-full" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">
                          {testimonials[currentIndex].name}
                        </h4>
                        <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={previousTestimonial}
                className="hover:bg-primary/10 hover:border-primary"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-primary to-secondary w-8'
                        : 'bg-muted hover:bg-muted-foreground w-2'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="hover:bg-primary/10 hover:border-primary"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
