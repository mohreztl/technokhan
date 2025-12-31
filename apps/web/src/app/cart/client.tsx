'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Package,
  Shield,
  Truck,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/store/cart-store';
import { ROUTES } from '@autolounge/shared';
import { formatPrice, calculateDiscount } from '@/lib/utils';

// Features
const features = [
  { icon: Truck, title: 'ارسال سریع', description: 'ارسال رایگان بالای ۵۰۰ هزار تومان' },
  { icon: Shield, title: 'گارانتی اصالت', description: 'ضمانت اصالت تمام محصولات' },
  { icon: Package, title: 'بسته‌بندی ویژه', description: 'بسته‌بندی استاندارد و ایمن' },
];

export function CartPageClient() {
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    discountedPrice,
  } = useCart();

  const savings = totalPrice - discountedPrice;

  if (state.items.length === 0) {
    return (
      <main className="min-h-screen bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              سبد خرید شما خالی است
            </h1>
            <p className="text-muted-foreground mb-8">
              محصولات مورد علاقه خود را به سبد خرید اضافه کنید و از تخفیف‌های ویژه بهره‌مند شوید
            </p>
            <Link href={ROUTES.PRODUCTS}>
              <Button size="lg" className="gap-2">
                مشاهده محصولات
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">سبد خرید</h1>
            <p className="text-muted-foreground">
              {totalItems} محصول در سبد خرید شما
            </p>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 ml-2" />
            حذف همه
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {state.items.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex gap-4 md:gap-6">
                        {/* Image */}
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          {item.product.discountPrice && (
                            <Badge className="absolute top-2 right-2 bg-destructive">
                              {calculateDiscount(item.product.price, item.product.discountPrice)}%
                            </Badge>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-foreground truncate mb-1">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.product.nameEn}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-4">
                            {item.product.discountPrice ? (
                              <>
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(item.product.discountPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(item.product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(item.product.price)}
                              </span>
                            )}
                          </div>

                          {/* Quantity & Total */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-bold text-foreground">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-left">
                              <p className="text-xs text-muted-foreground mb-1">جمع:</p>
                              <p className="font-bold text-foreground">
                                {formatPrice(
                                  (item.product.discountPrice || item.product.price) * item.quantity
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href={ROUTES.PRODUCTS}>
                <Button variant="ghost" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  ادامه خرید
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24 space-y-6"
            >
              {/* Discount Code */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    کد تخفیف
                  </h3>
                  <div className="flex gap-2">
                    <Input placeholder="کد تخفیف را وارد کنید" />
                    <Button variant="outline">اعمال</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-6">خلاصه سفارش</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>جمع محصولات ({totalItems})</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    
                    {savings > 0 && (
                      <div className="flex justify-between text-success">
                        <span>سود شما از خرید</span>
                        <span>{formatPrice(savings)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-muted-foreground">
                      <span>هزینه ارسال</span>
                      <span>محاسبه در مرحله بعد</span>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between">
                        <span className="font-bold text-foreground">جمع قابل پرداخت</span>
                        <span className="text-xl font-black text-primary">
                          {formatPrice(discountedPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href={ROUTES.CHECKOUT}>
                    <Button size="lg" className="w-full gap-2">
                      ادامه و تکمیل خرید
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {features.map((feature) => (
                      <div key={feature.title} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
