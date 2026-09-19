'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CountProps {
  count?: number;
  className?: string;
}

/** Matches `ProductCard`: 4/3 media, rating, title, brand, 2-line copy, price + icon button. */
export function ProductCardSkeleton({ count = 1, className }: CountProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('overflow-hidden rounded-2xl border border-border/50 bg-card', className)}
          aria-hidden="true"
        >
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3.5 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/** 2 columns on phones, 3 at md, 4 at xl — same as the products list. */
export function ProductGridSkeleton({ count = 8, className }: CountProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4', className)}>
      <ProductCardSkeleton count={count} />
    </div>
  );
}

/** Matches `ServiceCard`: 16/10 media, title, meta row, copy, price + two buttons. */
export function ServiceCardSkeleton({ count = 1, className }: CountProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('overflow-hidden rounded-2xl border border-border/50 bg-card', className)}
          aria-hidden="true"
        >
          <Skeleton className="aspect-16/10 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-2/3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <Skeleton className="h-6 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-11 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ServiceGridSkeleton({ count = 6, className }: CountProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3', className)}>
      <ServiceCardSkeleton count={count} />
    </div>
  );
}

/** Products list page: sticky toolbar + grid (desktop adds the sidebar). */
export function ProductListSkeleton() {
  return (
    <div className="container-custom py-6 lg:py-10" aria-busy="true" aria-label="در حال بارگذاری محصولات">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="lg:flex lg:gap-8">
        <aside className="hidden w-72 shrink-0 space-y-6 lg:block">
          <Skeleton className="h-8 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-2/3 rounded-xl" />
            </div>
          ))}
        </aside>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex items-center gap-2 lg:hidden">
            <Skeleton className="h-11 w-28 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
            <Skeleton className="ms-auto h-4 w-16" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

/** Product detail: gallery + info column, then tabs and the related row. */
export function ProductDetailSkeleton() {
  return (
    <div className="container-custom py-4 lg:py-10" aria-busy="true" aria-label="در حال بارگذاری محصول">
      <Skeleton className="mb-4 h-4 w-64 max-w-full" />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Service detail: cinematic header, pricing cards, sections. */
export function ServiceDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="در حال بارگذاری خدمت">
      <Skeleton className="h-[52vh] min-h-[360px] w-full rounded-none lg:h-[60vh]" />
      <div className="container-custom -mt-10 space-y-10 pb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Gallery page: hero band + masonry-like grid. */
export function GalleryGridSkeleton({ count = 9 }: CountProps) {
  return (
    <div className="container-custom py-10" aria-busy="true" aria-label="در حال بارگذاری گالری">
      <div className="mb-8 space-y-3 text-center">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-9 w-64" />
      </div>
      <div className="mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="aspect-4/3 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Simple centered spinner-less block for pages gated on hydration. */
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="container-custom py-10" aria-busy="true">
      <Skeleton className="mb-6 h-9 w-56" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
