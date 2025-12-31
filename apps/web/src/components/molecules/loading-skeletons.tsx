'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardSkeletonProps {
  count?: number;
}

export function ProductCardSkeleton({ count = 1 }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card rounded-2xl overflow-hidden border border-border"
        >
          {/* Image Skeleton */}
          <Skeleton className="aspect-square w-full" />

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>

            {/* Title */}
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Price and Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export function ProductGridSkeleton({ count = 6 }: ProductCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <ProductCardSkeleton count={count} />
    </div>
  );
}

export function ServiceCardSkeleton({ count = 1 }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card rounded-2xl overflow-hidden border border-border"
        >
          {/* Image Skeleton */}
          <Skeleton className="aspect-video w-full" />

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Badge */}
            <Skeleton className="h-6 w-20 rounded-full" />

            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Features */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>

            {/* Price and Button */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-1">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export function ServiceGridSkeleton({ count = 6 }: ProductCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ServiceCardSkeleton count={count} />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-custom px-4 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>

          {/* Rating */}
          <div className="flex gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-5" />
              ))}
            </div>
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-xl">
          <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
