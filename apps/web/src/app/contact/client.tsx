'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Instagram,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTACT, SOCIAL_MEDIA, APP_NAME } from '@autolounge/shared';
import { api } from '@/lib/api';

// Contact Info
const contactInfo = [
  {
    title: 'آدرس',
    value: CONTACT.address,
    icon: MapPin,
    link: 'https://maps.google.com',
    linkText: 'مشاهده روی نقشه',
  },
  {
    title: 'تلفن',
    value: CONTACT.phone,
    icon: Phone,
    link: `tel:${CONTACT.phoneEn}`,
    linkText: 'تماس بگیرید',
  },
  {
    title: 'ایمیل',
    value: CONTACT.email,
    icon: Mail,
    link: `mailto:${CONTACT.email}`,
    linkText: 'ارسال ایمیل',
  },
  {
    title: 'ساعات کاری',
    value: 'شنبه تا پنجشنبه: ۸ صبح - ۸ شب',
    icon: Clock,
    link: null,
    linkText: null,
  },
];

// Social Links
const socialLinks = [
  {
    name: 'اینستاگرام',
    icon: Instagram,
    href: SOCIAL_MEDIA.instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    name: 'تلگرام',
    icon: Send,
    href: SOCIAL_MEDIA.telegram,
    color: 'bg-blue-500',
  },
  {
    name: 'واتساپ',
    icon: MessageSquare,
    href: SOCIAL_MEDIA.whatsapp,
    color: 'bg-green-500',
  },
];

// FAQ
const faqs = [
  {
    question: 'ساعات کاری اتولانژ چگونه است؟',
    answer: 'ما از شنبه تا پنجشنبه از ساعت ۸ صبح تا ۸ شب آماده پاسخگویی و ارائه خدمات هستیم.',
  },
  {
    question: 'آیا امکان رزرو آنلاین وجود دارد؟',
    answer: 'بله، شما می‌توانید از طریق وبسایت ما به راحتی نوبت رزرو کنید و تاریخ و ساعت مورد نظر خود را انتخاب کنید.',
  },
  {
    question: 'آیا خدمات در محل ارائه می‌شود؟',
    answer: 'بله، برخی خدمات مثل دیتیلینگ و کارواش در محل نیز قابل انجام است. برای اطلاعات بیشتر با ما تماس بگیرید.',
  },
  {
    question: 'گارانتی خدمات چقدر است؟',
    answer: 'تمام خدمات ما دارای گارانتی کتبی هستند. مدت گارانتی بسته به نوع خدمت از ۶ ماه تا ۵ سال متغیر است.',
  },
];

export function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await api.submitContactForm(formData);
      if (response.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 gap-2">
              <MessageSquare className="h-3 w-3" />
              ارتباط با ما
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gradient-luxury">
              تماس با {APP_NAME}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              سوالی دارید یا به مشاوره نیاز دارید؟ تیم ما آماده پاسخگویی و کمک به شماست
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{info.title}</h3>
                    <p className="text-muted-foreground mb-3">{info.value}</p>
                    {info.link && (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        {info.linkText} ←
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">ارسال پیام</h2>

                  {submitStatus === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">پیام شما ارسال شد!</h3>
                      <p className="text-muted-foreground mb-6">
                        به زودی با شما تماس خواهیم گرفت
                      </p>
                      <Button variant="outline" onClick={() => setSubmitStatus('idle')}>
                        ارسال پیام جدید
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            نام و نام خانوادگی *
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="نام شما"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            شماره تماس *
                          </label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          ایمیل
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          موضوع *
                        </label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="موضوع پیام شما"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          پیام *
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="پیام خود را بنویسید..."
                          rows={5}
                          required
                        />
                      </div>

                      {submitStatus === 'error' && (
                        <p className="text-destructive text-sm">
                          خطایی رخ داد. لطفاً دوباره تلاش کنید.
                        </p>
                      )}

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            در حال ارسال...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            ارسال پیام
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Map */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">نقشه گوگل</p>
                    </div>
                  </div>
                  {/* Real map would go here with iframe or custom map component */}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">موقعیت ما</h3>
                  <p className="text-muted-foreground">{CONTACT.address}</p>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    ما را در شبکه‌های اجتماعی دنبال کنید
                  </h3>
                  <div className="flex gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Call */}
              <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">نیاز به مشاوره فوری دارید؟</h3>
                  <p className="opacity-90 mb-4">
                    همین الان با کارشناسان ما تماس بگیرید
                  </p>
                  <a href={`tel:${CONTACT.phoneEn}`}>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full gap-2 text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {CONTACT.phone}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              سوالات متداول
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              پاسخ سوالات شما
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
