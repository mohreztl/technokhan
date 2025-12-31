'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  Loader2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Shield,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/store/cart-store';
import { ROUTES, PROVINCES } from '@autolounge/shared';
import { formatPrice } from '@/lib/utils';

const SHIPPING_COST = 50000; // Base shipping cost
const FREE_SHIPPING_THRESHOLD = 5000000; // Free shipping over 5M

interface ShippingForm {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  notes: string;
}

export function CheckoutPageClient() {
  const { state, discountedPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    province: '',
    city: '',
    postalCode: '',
    addressLine: '',
    notes: '',
  });

  const shippingCost = discountedPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalAmount = discountedPrice + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return (
      shippingForm.fullName.trim() !== '' &&
      shippingForm.phone.trim() !== '' &&
      shippingForm.province !== '' &&
      shippingForm.city.trim() !== '' &&
      shippingForm.postalCode.trim() !== '' &&
      shippingForm.addressLine.trim() !== ''
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOrderId = `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setOrderId(newOrderId);
    setIsSuccess(true);
    clearCart();
    setIsSubmitting(false);
  };

  if (state.items.length === 0 && !isSuccess) {
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
              ابتدا محصولاتی به سبد خرید اضافه کنید
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

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-4">
              سفارش شما ثبت شد!
            </h1>
            <p className="text-muted-foreground mb-4">
              از خرید شما متشکریم. جزئیات سفارش به شماره موبایل شما ارسال خواهد شد.
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2 mb-8">
              کد پیگیری: {orderId}
            </Badge>

            <Card className="text-right mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">مراحل بعدی</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>پیامک تأیید سفارش ارسال شد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    <span>آماده‌سازی سفارش (۱-۲ روز کاری)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    <span>ارسال به آدرس شما</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.ORDERS}>
                <Button variant="outline" className="gap-2">
                  پیگیری سفارش
                </Button>
              </Link>
              <Link href={ROUTES.HOME}>
                <Button className="gap-2">
                  بازگشت به صفحه اصلی
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
          className="mb-8"
        >
          <Link href={ROUTES.CART}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowRight className="h-4 w-4" />
              بازگشت به سبد خرید
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">تکمیل خرید</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">آدرس ارسال</h2>
                </div>

                <div className="grid gap-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        نام و نام خانوادگی گیرنده *
                      </label>
                      <Input
                        name="fullName"
                        value={shippingForm.fullName}
                        onChange={handleChange}
                        placeholder="نام گیرنده"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        شماره تماس *
                      </label>
                      <Input
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleChange}
                        placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        استان *
                      </label>
                      <select
                        name="province"
                        value={shippingForm.province}
                        onChange={handleChange}
                        className="w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">انتخاب استان</option>
                        {PROVINCES.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        شهر *
                      </label>
                      <Input
                        name="city"
                        value={shippingForm.city}
                        onChange={handleChange}
                        placeholder="نام شهر"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      کد پستی *
                    </label>
                    <Input
                      name="postalCode"
                      value={shippingForm.postalCode}
                      onChange={handleChange}
                      placeholder="کد پستی ۱۰ رقمی"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      آدرس کامل *
                    </label>
                    <Textarea
                      name="addressLine"
                      value={shippingForm.addressLine}
                      onChange={handleChange}
                      placeholder="خیابان، کوچه، پلاک، واحد..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      توضیحات (اختیاری)
                    </label>
                    <Textarea
                      name="notes"
                      value={shippingForm.notes}
                      onChange={handleChange}
                      placeholder="توضیحات اضافی برای ارسال..."
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="mt-6">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">روش پرداخت</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border border-primary bg-primary/5 rounded-xl cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="w-5 h-5 accent-primary" />
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">پرداخت آنلاین</span>
                      <p className="text-sm text-muted-foreground">
                        پرداخت امن با درگاه بانکی زرین‌پال
                      </p>
                    </div>
                    <Shield className="h-5 w-5 text-success" />
                  </label>

                  <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                    <input type="radio" name="payment" className="w-5 h-5 accent-primary" />
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">پرداخت در محل</span>
                      <p className="text-sm text-muted-foreground">
                        پرداخت نقدی یا کارت‌خوان هنگام تحویل
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    خلاصه سفارش
                  </h3>

                  {/* Items */}
                  <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            تعداد: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>جمع محصولات</span>
                      <span>{formatPrice(discountedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        هزینه ارسال
                      </span>
                      {shippingCost === 0 ? (
                        <span className="text-success">رایگان</span>
                      ) : (
                        <span>{formatPrice(shippingCost)}</span>
                      )}
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between">
                        <span className="font-bold text-foreground">مبلغ قابل پرداخت</span>
                        <span className="text-xl font-black text-primary">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full mt-6 gap-2"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        در حال پردازش...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        پرداخت و ثبت سفارش
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    با ثبت سفارش، شرایط و قوانین فروشگاه را می‌پذیرید
                  </p>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <Shield className="h-6 w-6 text-success mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">پرداخت امن</span>
                    </div>
                    <div className="text-center">
                      <Truck className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">ارسال سریع</span>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 text-success mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">ضمانت اصالت</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
