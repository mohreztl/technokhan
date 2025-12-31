'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Send, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION, CONTACT, SOCIAL_MEDIA, ROUTES } from '@autolounge/shared';
import { Button } from '@/components/ui/button';

const footerLinks = {
  services: [
    { title: 'رپینت و صافکاری', href: ROUTES.SERVICES },
    { title: 'دیتیلینگ خودرو', href: ROUTES.SERVICES },
    { title: 'کارواش', href: ROUTES.SERVICES },
    { title: 'سرامیک بدنه', href: ROUTES.SERVICES },
    { title: 'محافظ رنگ (PPF)', href: ROUTES.SERVICES },
  ],
  quickLinks: [
    { title: 'درباره ما', href: ROUTES.ABOUT },
    { title: 'تماس با ما', href: ROUTES.CONTACT },
    { title: 'محصولات', href: ROUTES.PRODUCTS },
    { title: 'رزرو نوبت', href: ROUTES.BOOKING },
    { title: 'حساب کاربری', href: ROUTES.PROFILE },
  ],
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background-secondary border-t border-border mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-secondary to-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                <span className="text-2xl font-black text-primary-foreground">A</span>
                <div className="absolute inset-0 bg-gradient-shine bg-[length:200%_100%] animate-shine rounded-xl" />
              </div>
              <span className="text-2xl font-black text-gradient-luxury">{APP_NAME}</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">{APP_DESCRIPTION}</p>
            <div className="flex gap-3">
              <a href={SOCIAL_MEDIA.instagram} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
              <a href={SOCIAL_MEDIA.telegram} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Send className="h-5 w-5" />
                </Button>
              </a>
              <a href={SOCIAL_MEDIA.whatsapp} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Phone className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              خدمات ما
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors link-hover block"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              دسترسی سریع
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors link-hover block"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              تماس با ما
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">{CONTACT.phone}</p>
                  <a
                    href={`tel:${CONTACT.phoneEn}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {CONTACT.phoneEn}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors link-hover mt-2"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <p className="text-muted-foreground leading-relaxed mt-2">{CONTACT.address}</p>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-muted-foreground text-sm text-center md:text-right flex items-center gap-2">
            © {new Date().getFullYear()} {APP_NAME}. ساخته شده با
            <Heart className="h-4 w-4 text-destructive fill-current animate-pulse" />
            تمامی حقوق محفوظ است.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors link-hover"
            >
              حریم خصوصی
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors link-hover"
            >
              شرایط استفاده
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
