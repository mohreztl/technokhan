'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Phone, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { APP_NAME, ROUTES, CONTACT } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-store';

const menuItems = [
  { title: 'خانه', href: ROUTES.HOME },
  { title: 'خدمات', href: ROUTES.SERVICES },
  { title: 'محصولات', href: ROUTES.PRODUCTS },
  { title: 'رزرو نوبت', href: ROUTES.BOOKING },
  { title: 'درباره ما', href: ROUTES.ABOUT },
  { title: 'تماس با ما', href: ROUTES.CONTACT },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  
  const { scrollY } = useScroll();
  const navBackground = useTransform(
    scrollY, 
    [0, 100], 
    ['rgba(0,0,0,0)', 'rgba(var(--background), 0.9)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
    {/* Premium top bar */}
    <motion.div
      className={cn(
        'fixed top-0 left-0 right-0 z-[51] h-1',
        'bg-gradient-to-r from-primary via-secondary to-primary',
        'transition-opacity duration-300',
        isScrolled ? 'opacity-100' : 'opacity-0'
      )}
      style={{ backgroundSize: '200% 100%' }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    />
    
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled 
          ? 'glass-effect-strong shadow-2xl shadow-primary/5 border-b border-border/50' 
          : 'bg-transparent',
        isScrolled && 'pt-1' // Space for the premium bar
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Premium */}
          <Link href={ROUTES.HOME}>
            <motion.div
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-secondary/30 transition-all duration-500">
                  <span className="text-2xl font-black text-primary-foreground">A</span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl" />
                </div>
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                <span className="text-[10px] text-muted-foreground -mt-1 tracking-wider">
                  مراقبت تخصصی خودرو
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Menu - Premium */}
          <div className="hidden lg:flex items-center gap-1 bg-background/30 backdrop-blur-md rounded-full px-2 py-1 border border-border/30">
            {menuItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="relative px-4 py-2 text-foreground hover:text-primary transition-colors cursor-pointer font-medium group rounded-full"
                  whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.title}
                  <motion.span 
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-primary/10"
              aria-label="جستجو"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Cart - Premium */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-primary/10 rounded-full"
                onClick={toggleCart}
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      className="absolute -top-1 -left-1 bg-gradient-to-br from-secondary to-secondary/80 text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-secondary/30"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* User Profile */}
            <Link href={ROUTES.PROFILE}>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Call to Action - Premium */}
            <a href={`tel:${CONTACT.phoneEn}`} className="hidden md:block">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="secondary" 
                  className="gap-2 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 bg-gradient-to-r from-secondary via-secondary/90 to-secondary"
                >
                  <Phone className="h-4 w-4" />
                  <span>تماس فوری</span>
                  <Sparkles className="h-3 w-3" />
                </Button>
              </motion.div>
            </a>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden glass-effect-strong border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-custom py-6 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* Search on Mobile */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="جستجو..."
                    className="w-full h-12 pr-10 pl-4 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block"
                  >
                    <div className="py-3 px-4 text-foreground hover:bg-primary/10 hover:text-primary transition-all rounded-lg font-medium">
                      {item.title}
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4 space-y-3"
              >
                <a href={`tel:${CONTACT.phoneEn}`}>
                  <Button variant="secondary" className="w-full gap-2 shadow-glow-secondary">
                    <Phone className="h-5 w-5" />
                    {CONTACT.phone}
                  </Button>
                </a>
                <Link href={ROUTES.BOOKING}>
                  <Button variant="primary" className="w-full">
                    رزرو نوبت آنلاین
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};
