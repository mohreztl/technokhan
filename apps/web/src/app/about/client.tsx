'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Users,
  Clock,
  Shield,
  CheckCircle2,
  Star,
  Target,
  Heart,
  Sparkles,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES, CONTACT, APP_NAME } from '@autolounge/shared';
import { formatNumber } from '@/lib/utils';

// Team Members
const teamMembers = [
  {
    name: 'علی محمدی',
    role: 'بنیانگذار و مدیرعامل',
    image: '/images/team/ceo.jpg',
    bio: 'بیش از ۱۵ سال تجربه در صنعت خودرو',
  },
  {
    name: 'رضا احمدی',
    role: 'مدیر فنی',
    image: '/images/team/tech-lead.jpg',
    bio: 'متخصص دیتیلینگ و سرامیک کوتینگ',
  },
  {
    name: 'مهدی کریمی',
    role: 'سرپرست کارگاه',
    image: '/images/team/workshop-lead.jpg',
    bio: '۱۰ سال تجربه در PPF و کاورینگ',
  },
  {
    name: 'سارا نوری',
    role: 'مدیر ارتباط با مشتریان',
    image: '/images/team/customer-relations.jpg',
    bio: 'متخصص تجربه مشتری',
  },
];

// Stats
const stats = [
  { value: 10, suffix: '+', label: 'سال تجربه', icon: Clock },
  { value: 5000, suffix: '+', label: 'مشتری راضی', icon: Users },
  { value: 15000, suffix: '+', label: 'پروژه موفق', icon: CheckCircle2 },
  { value: 98, suffix: '%', label: 'رضایت مشتری', icon: Star },
];

// Values
const values = [
  {
    title: 'کیفیت بی‌نظیر',
    description: 'استفاده از بهترین محصولات و تجهیزات جهانی برای ارائه خدمات با کیفیت',
    icon: Award,
  },
  {
    title: 'تعهد به مشتری',
    description: 'رضایت مشتری اولویت اصلی ماست و تا رسیدن به نتیجه مطلوب تلاش می‌کنیم',
    icon: Heart,
  },
  {
    title: 'نوآوری مستمر',
    description: 'همیشه در حال یادگیری و به‌روزرسانی تکنیک‌ها و محصولات هستیم',
    icon: Target,
  },
  {
    title: 'صداقت و شفافیت',
    description: 'قیمت‌گذاری شفاف و مشاوره صادقانه برای انتخاب بهترین خدمات',
    icon: Shield,
  },
];

// Timeline
const timeline = [
  {
    year: '۱۳۹۲',
    title: 'تأسیس اتولانژ',
    description: 'شروع فعالیت با کارواش تخصصی و دیتیلینگ ساده',
  },
  {
    year: '۱۳۹۵',
    title: 'توسعه خدمات',
    description: 'افزودن خدمات سرامیک کوتینگ و PPF به مجموعه',
  },
  {
    year: '۱۳۹۸',
    title: 'نمایندگی برندها',
    description: 'اخذ نمایندگی رسمی برندهای معتبر جهانی',
  },
  {
    year: '۱۴۰۰',
    title: 'راه‌اندازی فروشگاه آنلاین',
    description: 'عرضه محصولات دیتیلینگ به صورت آنلاین',
  },
  {
    year: '۱۴۰۲',
    title: 'گسترش مجموعه',
    description: 'افتتاح شعبه دوم و افزایش ظرفیت خدمات‌دهی',
  },
];

// Certifications
const certifications = [
  { name: 'Gtechniq Accredited', logo: '/images/certs/gtechniq.png' },
  { name: 'XPEL Certified', logo: '/images/certs/xpel.png' },
  { name: "Meguiar's Professional", logo: '/images/certs/meguiars.png' },
  { name: 'SunTek Partner', logo: '/images/certs/suntek.png' },
];

export function AboutPageClient() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 gap-2">
              <Sparkles className="h-3 w-3" />
              درباره ما
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gradient-luxury">
              داستان {APP_NAME}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              بیش از یک دهه تجربه در ارائه خدمات تخصصی مراقبت و زیبایی خودرو. ما با عشق به
              خودرو و تعهد به کیفیت، به هزاران مشتری خدمت کرده‌ایم
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.CONTACT}>
                <Button size="lg" className="gap-2">
                  تماس با ما
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.SERVICES}>
                <Button variant="outline" size="lg">
                  مشاهده خدمات
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                  {formatNumber(stat.value)}{stat.suffix}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-4">
                داستان ما
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
                از یک کارگاه کوچک تا مرجع دیتیلینگ ایران
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  اتولانژ در سال ۱۳۹۲ با یک کارگاه کوچک و تنها دو کارمند آغاز به کار کرد. هدف
                  ما از ابتدا ارائه خدمات با کیفیت جهانی در زمینه مراقبت از خودرو بود.
                </p>
                <p>
                  با تلاش مستمر و کسب دانش از بهترین متخصصان جهان، امروز افتخار داریم که یکی
                  از معتبرترین مراکز دیتیلینگ در ایران هستیم. نمایندگی رسمی برندهای معتبر
                  جهانی مثل Gtechniq، XPEL و SunTek را در اختیار داریم.
                </p>
                <p>
                  تیم ما متشکل از متخصصان با تجربه‌ای است که هر کدام سال‌ها در این صنعت فعالیت
                  کرده‌اند. ما به کار خود عشق می‌ورزیم و این عشق را در هر پروژه‌ای که انجام
                  می‌دهیم نشان می‌دهیم.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl font-black text-gradient-luxury mb-4">A</div>
                  <div className="text-2xl font-bold text-foreground">{APP_NAME}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              ارزش‌های ما
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
              آنچه ما را متفاوت می‌کند
            </h2>
            <p className="text-muted-foreground text-lg">
              اصولی که همیشه در کار خود به آن‌ها پایبند هستیم
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              مسیر رشد
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
              تاریخچه اتولانژ
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-4 md:right-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute right-4 md:right-1/2 md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background" />

                  {/* Content */}
                  <div
                    className={`flex-1 mr-12 md:mr-0 ${
                      index % 2 === 0 ? 'md:text-left md:pr-12' : 'md:text-right md:pl-12'
                    }`}
                  >
                    <div className="bg-card p-6 rounded-2xl border border-border">
                      <span className="text-2xl font-black text-primary">{item.year}</span>
                      <h3 className="text-xl font-bold text-foreground mt-2 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3 w-3 ml-1" />
              تیم ما
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
              متخصصان اتولانژ
            </h2>
            <p className="text-muted-foreground text-lg">
              افراد حرفه‌ای که با عشق به خودرو و تعهد به کیفیت کار می‌کنند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/10 to-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground">
              آماده همکاری با ما هستید؟
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              همین امروز با ما تماس بگیرید و از مشاوره رایگان بهره‌مند شوید
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.BOOKING}>
                <Button size="lg" className="gap-2">
                  رزرو آنلاین
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <a href={`tel:${CONTACT.phoneEn}`}>
                <Button variant="outline" size="lg" className="gap-2">
                  <Phone className="h-4 w-4" />
                  {CONTACT.phone}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
