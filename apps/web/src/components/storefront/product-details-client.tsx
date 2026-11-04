'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, GitCompareArrows, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { effectivePrice, toPersianDigits, type Product } from '@autolounge/shared';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useCompare } from '@/lib/store/compare-store';
import { useRecentlyViewed } from '@/lib/store/recently-viewed-store';
import { cn } from '@/lib/utils';
import { ProductGallery } from './product-gallery';
import { ProductGrid } from './product-grid';
import { SectionHeader } from './section-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ProductDetailsClientProps {
  product: Product;
  related: Product[];
}

/** Complete purchasable product detail with variants, warranty, reviews and recently viewed tracking. */
export function ProductDetailsClient({ product, related }: ProductDetailsClientProps) {
  const [colorId, setColorId] = React.useState(product.colors?.[0]?.id);
  const [warrantyId, setWarrantyId] = React.useState(product.warranties?.[0]?.id);
  const [quantity, setQuantity] = React.useState(1);
  const { addItem, openCart } = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const recent = useRecentlyViewed();
  React.useEffect(() => { recent.add(product.id); }, [product.id, recent.add]);
  const color = product.colors?.find((item) => item.id === colorId);
  const warranty = product.warranties?.find((item) => item.id === warrantyId);
  const unitPrice = effectivePrice(product) + (warranty?.priceDelta ?? 0);
  const originalPrice = product.discountPrice ? product.price + (warranty?.priceDelta ?? 0) : undefined;
  const add = () => {
    const warrantyDelta = warranty?.priceDelta ?? 0;
    const selectedProduct = { ...product, price: product.price + warrantyDelta, discountPrice: product.discountPrice ? product.discountPrice + warrantyDelta : undefined };
    addItem(selectedProduct, quantity, { colorName: color?.name, warrantyId: warranty?.id, warrantyTitle: warranty?.title });
    toast.success(`${toPersianDigits(quantity)} عدد به سبد اضافه شد`, { description: `${product.name}${color ? ` · ${color.name}` : ''}${warranty ? ` · ${warranty.title}` : ''}` });
    openCart();
  };
  return (
    <div className="container-custom pb-24 pt-5 sm:py-8 lg:pb-8">
      <nav className="mb-5 flex items-center gap-2 text-xs text-muted-foreground" aria-label="مسیر صفحه"><Link href="/">خانه</Link><ChevronLeft className="size-3" aria-hidden="true" /><Link href={`/category/${product.category}`}>دسته‌بندی</Link><ChevronLeft className="size-3" aria-hidden="true" /><span className="line-clamp-1">{product.name}</span></nav>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery product={product} color={color} />
        <section aria-labelledby="product-title">
          <div className="flex flex-wrap items-center gap-2"><Badge variant="original"><ShieldCheck className="size-3.5" aria-hidden="true" /> اورجینال</Badge><Badge variant={product.stock > 0 ? 'stock' : 'muted'}>{product.stock > 0 ? `موجود؛ ${toPersianDigits(product.stock)} عدد` : 'ناموجود'}</Badge><Badge variant="shipping"><Truck className="size-3.5" aria-hidden="true" /> ارسال سریع</Badge></div>
          <p className="mt-4 text-sm text-muted-foreground" dir="ltr">{product.brand}</p>
          <h1 id="product-title" className="mt-2 text-balance text-3xl font-black leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground" dir="ltr">{product.nameEn}</p>
          <div className="mt-4"><RatingStars value={product.rating ?? 0} count={product.reviewCount} /></div>
          <p className="mt-5 text-sm leading-8 text-muted-foreground">{product.description}</p>
          <div className="mt-6 border-y border-border py-5"><PriceTag price={unitPrice} originalPrice={originalPrice} size="lg" /></div>

          {product.colors && <fieldset className="mt-5"><legend className="mb-3 text-sm font-bold">رنگ: <span className="font-normal text-muted-foreground">{color?.name}</span></legend><div className="flex gap-2">{product.colors.map((item) => <button key={item.id} type="button" aria-label={`رنگ ${item.name}`} aria-pressed={colorId === item.id} onClick={() => setColorId(item.id)} className={cn('flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs', colorId === item.id ? 'border-secondary bg-secondary/10' : 'border-border')}><span className="size-5 rounded-full border border-foreground/15" style={{ backgroundColor: item.hex }} aria-hidden="true" />{item.name}</button>)}</div></fieldset>}

          {product.warranties && <fieldset className="mt-5"><legend className="mb-3 text-sm font-bold">گارانتی</legend><div className="grid gap-2">{product.warranties.map((item) => <label key={item.id} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm', warrantyId === item.id ? 'border-secondary bg-secondary/10' : 'border-border')}><input type="radio" name="warranty" value={item.id} checked={warrantyId === item.id} onChange={() => setWarrantyId(item.id)} /><span className="flex-1">{item.title}</span>{item.priceDelta > 0 && <span className="text-xs text-muted-foreground tabular-nums">+ {toPersianDigits(item.priceDelta)} تومان</span>}</label>)}</div></fieldset>}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-border" role="group" aria-label="تعداد"><Button variant="ghost" size="icon" aria-label="کاهش تعداد" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="size-4" aria-hidden="true" /></Button><span className="w-10 text-center font-bold tabular-nums">{toPersianDigits(quantity)}</span><Button variant="ghost" size="icon" aria-label="افزایش تعداد" disabled={quantity >= product.stock} onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}><Plus className="size-4" aria-hidden="true" /></Button></div>
            <Button size="lg" className="flex-1" disabled={product.stock === 0} onClick={add}><ShoppingBag className="size-5" aria-hidden="true" />{product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}</Button>
            <Button size="icon" variant="outline" aria-label="افزودن به علاقه‌مندی‌ها" aria-pressed={wishlist.has(product.id)} onClick={() => wishlist.toggle(product.id)}><Heart className={cn('size-5', wishlist.has(product.id) && 'fill-accent text-accent')} aria-hidden="true" /></Button>
            <Button size="icon" variant="outline" aria-label="افزودن به مقایسه" aria-pressed={compare.has(product.id)} onClick={() => compare.toggle(product.id)}><GitCompareArrows className="size-5" aria-hidden="true" /></Button>
          </div>
        </section>
      </div>

      <section className="mt-12">
        <Tabs defaultValue="specs">
          <TabsList label="اطلاعات محصول"><TabsTrigger value="specs">مشخصات فنی</TabsTrigger><TabsTrigger value="review">نقد و بررسی</TabsTrigger><TabsTrigger value="reviews">نظرات خریداران</TabsTrigger></TabsList>
          <TabsContent value="specs"><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full text-sm"><caption className="p-4 text-start font-bold">جدول مشخصات {product.name}</caption><tbody>{product.specifications?.map((specification) => <tr key={specification.label} className="border-t border-border"><th scope="row" className="w-40 bg-muted/50 p-4 text-start font-semibold">{specification.label}</th><td className="p-4 text-muted-foreground">{specification.value}</td></tr>)}</tbody></table></div></TabsContent>
          <TabsContent value="review"><div className="rounded-2xl border border-border bg-card p-6"><h2 className="text-xl font-black">ارزیابی تکنو خان</h2><p className="mt-4 text-sm leading-8 text-muted-foreground">{product.description}</p><ul className="mt-5 grid gap-3 sm:grid-cols-2">{product.features?.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm"><Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />{feature}</li>)}</ul></div></TabsContent>
          <TabsContent value="reviews"><div className="grid gap-4 md:grid-cols-2">{product.reviews?.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">{review.userName}</h2><RatingStars value={review.rating} showValue={false} size="sm" /></div><p className="mt-3 text-sm leading-7 text-muted-foreground">{review.comment}</p><p className="mt-3 text-xs text-muted-foreground">{toPersianDigits(review.helpfulCount ?? 0)} نفر این نظر را مفید دانستند</p></article>)}</div></TabsContent>
        </Tabs>
      </section>

      {related.length > 0 && <section className="mt-14"><SectionHeader title="تجهیزات مکمل و مرتبط" description="محصولاتی که با این انتخاب بهتر کار می‌کنند." /><ProductGrid products={related} /></section>}

      <div className="fixed inset-x-3 bottom-20 z-30 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-panel backdrop-blur-xl lg:hidden">
        <PriceTag price={unitPrice * quantity} size="sm" className="flex-1" /><Button disabled={product.stock === 0} onClick={add}><ShoppingBag className="size-4" aria-hidden="true" /> افزودن</Button>
      </div>
    </div>
  );
}
