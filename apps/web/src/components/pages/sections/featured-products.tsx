'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/molecules/product-card';
import { Button } from '@/components/ui/button';
import { ROUTES, ProductCategory } from '@autolounge/shared';
import type { Product } from '@autolounge/shared';

// Mock data - Replace with API call
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'واکس خودرو مگوایرز',
    nameEn: 'Meguiars Car Wax',
    description: 'واکس حرفه‌ای برند مگوایرز با درخشش فوق‌العاده و محافظت طولانی مدت',
    descriptionEn: 'Professional grade wax with ultimate shine',
    price: 850000,
    discountPrice: 680000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/wax.jpg'],
    stock: 25,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'شامپو خودرو شیمیکال گایز',
    nameEn: 'Chemical Guys Car Shampoo',
    description: 'شامپو بی‌خطر برای رنگ با فرمول pH متعادل و حباب غنی',
    descriptionEn: 'pH balanced car wash shampoo',
    price: 450000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/shampoo.jpg'],
    stock: 50,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'دستمال میکروفایبر حرفه‌ای',
    nameEn: 'Professional Microfiber Towel',
    description: 'دستمال میکروفایبر فوق جاذب بدون خط‌وخش - بسته ۵ عددی',
    descriptionEn: 'Ultra-absorbent scratch-free towels - 5 pack',
    price: 280000,
    discountPrice: 220000,
    category: ProductCategory.ACCESSORIES,
    images: ['/images/products/towel.jpg'],
    stock: 100,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'پولیش کامپوند ۳M',
    nameEn: '3M Rubbing Compound',
    description: 'پولیش برای حذف خط‌وخش‌های سطحی و احیای رنگ خودرو',
    descriptionEn: 'Remove scratches and restore paint',
    price: 920000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/compound.jpg'],
    stock: 15,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const FeaturedProducts: React.FC = () => {
  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', product);
  };

  return (
    <section className="py-24 bg-background-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">محصولات پرفروش</h2>
          <p className="section-subtitle">محصولات دیتیلینگ حرفه‌ای با بهترین برندهای جهانی</p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link href={ROUTES.PRODUCTS}>
            <Button variant="primary" size="lg" className="gap-3">
              مشاهده تمام محصولات
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
