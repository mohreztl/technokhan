'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@autolounge/shared';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const { state, closeCart, removeItem, updateQuantity, totalItems, discountedPrice } = useCart();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">سبد خرید</h2>
                  <p className="text-sm text-muted-foreground">{totalItems} محصول</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    سبد خرید شما خالی است
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    محصولات مورد علاقه خود را به سبد خرید اضافه کنید
                  </p>
                  <Link href={ROUTES.PRODUCTS} onClick={closeCart}>
                    <Button variant="primary" className="gap-2">
                      مشاهده محصولات
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                state.items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate mb-1">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        {item.product.discountPrice ? (
                          <>
                            <span className="text-primary font-bold">
                              {formatPrice(item.product.discountPrice)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(item.product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-primary font-bold">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-6 border-t border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-muted-foreground">جمع کل:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
                <div className="space-y-3">
                  <Link href={ROUTES.CART} onClick={closeCart} className="block">
                    <Button variant="outline" className="w-full">
                      مشاهده سبد خرید
                    </Button>
                  </Link>
                  <Link href={ROUTES.CHECKOUT} onClick={closeCart} className="block">
                    <Button variant="primary" className="w-full">
                      تکمیل خرید
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
