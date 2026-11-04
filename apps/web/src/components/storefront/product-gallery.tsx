'use client';

import * as React from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import type { Product, ProductColor } from '@autolounge/shared';
import { PRODUCT_MEDIA } from '@/content/media-assets';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export interface ProductGalleryProps {
  product: Product;
  color?: ProductColor;
}

/** Product image gallery with color-linked sources, thumbnails and a native zoom dialog. */
export function ProductGallery({ product, color }: ProductGalleryProps) {
  const [selected, setSelected] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);
  const media = PRODUCT_MEDIA[product.id as keyof typeof PRODUCT_MEDIA];
  const sources = React.useMemo(() => {
    const candidates = [color?.image, ...product.images].filter((src): src is string => Boolean(src));
    return [...new Set(candidates.length ? candidates : [media?.src ?? '/images/placeholder-product.webp'])];
  }, [color?.image, media?.src, product.images]);
  const current = sources[Math.min(selected, sources.length - 1)]!;
  return (
    <div>
      <button type="button" onClick={() => setZoom(true)} className="group relative block aspect-square w-full overflow-hidden rounded-3xl border border-border bg-[#e3e6e2] text-start" aria-label={`بزرگ‌نمایی تصویر ${product.name}`}>
        <Image src={current} alt={media?.alt ?? product.name} fill priority loading="eager" sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        <span className="absolute inset-e-4 bottom-4 flex size-11 items-center justify-center rounded-xl border border-black/10 bg-white/75 text-[#111315] backdrop-blur"><Expand className="size-5" aria-hidden="true" /></span>
      </button>
      {sources.length > 1 && <div className="mt-3 flex gap-2" role="group" aria-label="تصاویر محصول">{sources.map((src, index) => <button key={`${src}-${index}`} type="button" aria-label={`نمایش تصویر ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={cn('relative size-20 overflow-hidden rounded-xl border-2 bg-[#e3e6e2]', selected === index ? 'border-secondary' : 'border-transparent')}><Image src={src} alt="" fill sizes="80px" className="object-cover" /></button>)}</div>}
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">تصویر بزرگ {product.name}</DialogTitle>
          <DialogDescription className="sr-only">نمایش بزرگ و با کیفیت تصویر محصول برای بررسی جزئیات</DialogDescription>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#e3e6e2]"><Image src={current} alt={media?.alt ?? product.name} fill sizes="90vw" className="object-contain" /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
