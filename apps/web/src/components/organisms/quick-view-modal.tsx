'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  Truck,
  Shield,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/store';
import { showToast } from '@/components/ui/toaster';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@autolounge/shared';
import type { Product } from '@autolounge/shared';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem, openCart } = useCart();

  if (!product) return null;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    showToast.addedToCart(product.name);
    onClose();
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      showToast.addedToWishlist(product.name);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl max-h-[90vh] bg-background rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="grid md:grid-cols-2 gap-0 max-h-[90vh] overflow-y-auto">
              {/* Image Section */}
              <div className="relative bg-muted p-6 md:p-8">
                {/* Discount Badge */}
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 z-10 bg-red-500 text-white">
                    {discount}% تخفیف
                  </Badge>
                )}

                {/* Main Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-background mb-4">
                  <Image
                    src={product.images[selectedImage] || '/images/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {product.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-primary'
                            : 'border-transparent hover:border-muted-foreground/50'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-6 md:p-8 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  {product.brand && (
                    <Badge variant="secondary" className="mb-2">
                      {product.brand}
                    </Badge>
                  )}
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {product.name}
                  </h2>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.floor(product.rating || 0)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount || 0} نظر)
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {product.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-primary">
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-black text-primary">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-green-500">
                        موجود در انبار ({product.stock} عدد)
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm text-red-500">ناموجود</span>
                    </>
                  )}
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm text-muted-foreground">تعداد:</span>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-background rounded-md transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-bold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2 hover:bg-background rounded-md transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    افزودن به سبد خرید
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">ارسال سریع</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">ضمانت اصالت</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">بسته‌بندی ایمن</span>
                  </div>
                </div>

                {/* View Full Details */}
                <Link
                  href={`${ROUTES.PRODUCTS}/${product.id}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 text-primary hover:underline"
                >
                  مشاهده جزئیات کامل
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
