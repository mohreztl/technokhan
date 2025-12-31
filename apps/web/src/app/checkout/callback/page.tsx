'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Home,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { verifyPayment, rialToToman } from '@/lib/services/zarinpal';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/store';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled';

interface OrderInfo {
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  shippingInfo: {
    fullName: string;
    phone: string;
    address: string;
  };
  total: number;
  authority: string;
}

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [refId, setRefId] = useState<number | null>(null);
  const [cardPan, setCardPan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      const authority = searchParams.get('Authority');
      const paymentStatus = searchParams.get('Status');

      // Check if payment was cancelled
      if (paymentStatus === 'NOK') {
        setStatus('cancelled');
        return;
      }

      if (!authority) {
        setStatus('failed');
        setError('اطلاعات پرداخت نامعتبر است');
        return;
      }

      // Get pending order from localStorage
      const pendingOrderStr = localStorage.getItem('pendingOrder');
      if (!pendingOrderStr) {
        setStatus('failed');
        setError('سفارش یافت نشد');
        return;
      }

      try {
        const pendingOrder: OrderInfo = JSON.parse(pendingOrderStr);
        setOrderInfo(pendingOrder);

        // Verify payment with Zarinpal
        const result = await verifyPayment({
          authority,
          amount: pendingOrder.total * 10, // Convert to Rial
        });

        if (result.success) {
          setStatus('success');
          setRefId(result.refId || null);
          setCardPan(result.cardPan || null);
          
          // Clear cart and pending order
          clearCart();
          localStorage.removeItem('pendingOrder');
          
          // Save to order history
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          orderHistory.push({
            id: `ORD-${Date.now()}`,
            refId: result.refId,
            ...pendingOrder,
            status: 'paid',
            paidAt: new Date().toISOString(),
          });
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        } else {
          setStatus('failed');
          setError(result.error || 'خطا در تأیید پرداخت');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('failed');
        setError('خطا در پردازش پرداخت');
      }
    };

    verifyTransaction();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container-custom px-4">
        <div className="max-w-lg mx-auto">
          {/* Loading State */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold mb-2">در حال تأیید پرداخت...</h1>
              <p className="text-muted-foreground">
                لطفاً منتظر بمانید، در حال بررسی وضعیت پرداخت شما هستیم
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-green-500 p-8 text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle className="h-20 w-20 mx-auto mb-4" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">پرداخت موفق</h1>
                  <p className="opacity-90">سفارش شما با موفقیت ثبت شد</p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Payment Info */}
                  <div className="space-y-3">
                    {refId && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">کد پیگیری</span>
                        <Badge variant="secondary" className="text-lg font-mono">
                          {refId}
                        </Badge>
                      </div>
                    )}
                    {cardPan && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">شماره کارت</span>
                        <span className="font-mono">{cardPan}</span>
                      </div>
                    )}
                    {orderInfo && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">مبلغ پرداختی</span>
                        <span className="font-bold text-primary">
                          {formatPrice(orderInfo.total)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  {orderInfo && orderInfo.items.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-bold mb-3">محصولات سفارش</h3>
                      <div className="space-y-2">
                        {orderInfo.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.product.name} × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping Info */}
                  {orderInfo?.shippingInfo && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-bold mb-3">آدرس ارسال</h3>
                      <p className="text-sm text-muted-foreground">
                        {orderInfo.shippingInfo.fullName} - {orderInfo.shippingInfo.phone}
                      </p>
                      <p className="text-sm">{orderInfo.shippingInfo.address}</p>
                    </div>
                  )}

                  {/* Notice */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm">
                    <p className="text-blue-600 dark:text-blue-400">
                      📦 سفارش شما در اسرع وقت پردازش و ارسال خواهد شد. اطلاعات
                      پیگیری از طریق پیامک برای شما ارسال می‌شود.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Link href="/profile?tab=orders">
                      <Button variant="primary" className="w-full gap-2">
                        <FileText className="h-5 w-5" />
                        پیگیری سفارش
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="w-full gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        ادامه خرید
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-red-500 p-8 text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <XCircle className="h-20 w-20 mx-auto mb-4" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">پرداخت ناموفق</h1>
                  <p className="opacity-90">متأسفانه پرداخت شما انجام نشد</p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <p className="text-center text-muted-foreground">
                    در صورتی که مبلغی از حساب شما کسر شده است، حداکثر طی ۷۲ ساعت
                    به حساب شما بازگردانده خواهد شد.
                  </p>

                  <div className="flex flex-col gap-3 pt-4">
                    <Link href="/checkout">
                      <Button variant="primary" className="w-full gap-2">
                        <ArrowLeft className="h-5 w-5" />
                        تلاش مجدد
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" className="w-full gap-2">
                        <Home className="h-5 w-5" />
                        بازگشت به صفحه اصلی
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Cancelled State */}
          {status === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-yellow-500 p-8 text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <AlertTriangle className="h-20 w-20 mx-auto mb-4" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">پرداخت لغو شد</h1>
                  <p className="opacity-90">شما پرداخت را لغو کردید</p>
                </div>

                <CardContent className="p-6 space-y-6">
                  <p className="text-center text-muted-foreground">
                    سبد خرید شما همچنان ذخیره شده است. می‌توانید در هر زمان خرید
                    خود را تکمیل کنید.
                  </p>

                  <div className="flex flex-col gap-3 pt-4">
                    <Link href="/checkout">
                      <Button variant="primary" className="w-full gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        بازگشت به سبد خرید
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="w-full gap-2">
                        ادامه خرید
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
    </div>
  );
}
