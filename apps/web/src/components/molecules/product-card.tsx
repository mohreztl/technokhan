'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Eye, Package, Heart, Star, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-store';
import { showToast } from '@/components/ui/toaster';
import { QuickViewModal } from '@/components/organisms/quick-view-modal';
import type { Product } from '@autolounge/shared';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const prefersReducedMotion = useReducedMotion();
  const { addItem, openCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D Tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);
  
  const discountPercentage = product.discountPrice
    ? calculateDiscount(product.price, product.discountPrice)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    showToast.addedToCart(product.name);
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      showToast.addedToWishlist(product.name);
    }
  };

  return (
    <>
    <div style={{ perspective: '1000px' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={prefersReducedMotion ? {} : { z: 50 }}
        transition={{ duration: 0.2 }}
      >
    <Card className={cn(
      "group overflow-hidden h-full flex flex-col relative",
      "bg-gradient-to-br from-card/80 via-card to-card/90",
      "border border-border/50 hover:border-secondary/30",
      "shadow-lg hover:shadow-2xl hover:shadow-primary/10",
      "transition-all duration-500"
    )}>

      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-20" />

      {/* Favorite Button - Premium */}
      <motion.button
        onClick={handleToggleFavorite}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "absolute top-3 left-3 z-10 p-2 rounded-full transition-all backdrop-blur-md",
          isFavorite
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-background/60 text-muted-foreground hover:bg-background hover:text-red-500'
        )}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </motion.button>

      <Link href={`/products/${product.id}`}>
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          {product.images[0] ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
              {/* Premium image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Badges - Premium Style */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.discountPrice && (
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0, rotate: -10 }}
                animate={prefersReducedMotion ? {} : { scale: 1, rotate: 0 }}
                transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold shadow-lg shadow-red-500/30 px-3">
                  <Sparkles className="h-3 w-3 ml-1" />
                  {discountPercentage}% تخفیف
                </Badge>
              </motion.div>
            )}
            {product.featured && !product.discountPrice && (
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30">
                <Star className="h-3 w-3 ml-1 fill-current" />
                پیشنهادی
              </Badge>
            )}
          </div>

          {/* Out of Stock Overlay - Premium */}
          {!product.stock && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-lg font-bold px-6 py-3 bg-black/60 rounded-xl border border-white/10">
                ناموجود
              </span>
            </div>
          )}

          {/* Quick View Button - Premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 backdrop-blur-md bg-white/20 border border-white/30 text-white hover:bg-white/30 shadow-xl"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4" />
                مشاهده سریع
              </Button>
            </motion.div>
          </div>
        </div>
      </Link>

      <CardContent className="p-5 flex-1 flex flex-col relative">
        {/* Gold accent line */}
        <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        
        {/* Rating - Premium */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(product.rating!) 
                      ? "fill-yellow-500 text-yellow-500" 
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount} نظر)
              </span>
            )}
          </div>
        )}

        <Link href={`/products/${product.id}`}>
          <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-1 font-medium">{product.nameEn}</p>
        </Link>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-xl font-black bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xl font-black text-foreground">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              onClick={handleAddToCart}
              disabled={!product.stock}
              className={cn(
                "rounded-xl h-11 w-11",
                "bg-gradient-to-br from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary/70",
                "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                "transition-all duration-300"
              )}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
    </div>

    {/* Quick View Modal */}
    <QuickViewModal
      product={product}
      isOpen={showQuickView}
      onClose={() => setShowQuickView(false)}
    />
    </>
  );
};
