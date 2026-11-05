'use client';

import * as React from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PriceTag } from '@/components/ui/price-tag';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/store/cart-store';
import { effectivePrice } from '@technokhan/shared';

export interface ProductGridProps {
  products: Product[];
  layout?: 'grid' | 'list';
  className?: string;
}

/** Responsive product collection with an accessible native quick-view dialog. */
export function ProductGrid({ products, layout = 'grid', className }: ProductGridProps) {
  const [quickView, setQuickView] = React.useState<Product | null>(null);
  const { addItem } = useCart();
  return (
    <>
      <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4' : 'grid gap-4', className)}>
        {products.map((product, index) => <ProductCard key={product.id} product={product} layout={layout} priority={index < 2} onQuickView={setQuickView} />)}
      </div>
      <Dialog open={quickView !== null} onOpenChange={(open) => { if (!open) setQuickView(null); }}>
        {quickView && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{quickView.name}</DialogTitle>
              <DialogDescription>{quickView.shortDescription}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 rounded-xl bg-muted p-4">
              <div className="flex flex-wrap gap-2"><Badge variant="original">اورجینال</Badge><Badge variant={quickView.stock > 0 ? 'stock' : 'muted'}>{quickView.stock > 0 ? 'موجود در انبار' : 'ناموجود'}</Badge></div>
              <PriceTag price={effectivePrice(quickView)} originalPrice={quickView.discountPrice ? quickView.price : undefined} size="lg" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuickView(null)}>بستن</Button>
              <Button disabled={quickView.stock === 0} onClick={() => { addItem(quickView); setQuickView(null); }}><ShoppingBag className="size-4" aria-hidden="true" /> افزودن به سبد</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
