'use client';

import * as React from 'react';
import { Check, CreditCard, Heart, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import {
  PRODUCT_CATEGORY_LABELS,
  ROUTES,
  discountPercent,
  effectivePrice,
  formatToman,
  toPersianDigits,
  type Product,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useProduct, useRelatedProducts } from '@/lib/hooks/use-products';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useFlyToCart } from '@/components/creative/fly-to-cart';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { SectionHeading } from '@/components/ui/premium-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showToast } from '@/components/ui/toaster';
import { StickyCtaBar, useStickyCta } from '@/components/molecules/sticky-cta-bar';
import { ProductCard } from '@/components/molecules/product-card';
import { ProductGallery } from '@/components/catalog/product-gallery';
import { QuantityStepper } from '@/components/catalog/quantity-stepper';
import { RatingStars } from '@/components/catalog/rating-stars';
import { ReviewSection } from '@/components/catalog/review-section';
import { ShareButton } from '@/components/catalog/share-button';
import { SnapRow } from '@/components/catalog/snap-row';

export interface ProductDetailClientProps {
  product: Product;
  related: Product[];
}

const TRUST = [
  { icon: ShieldCheck, label: 'ضمانت اصالت کالا' },
  { icon: Truck, label: 'ارسال سریع به سراسر کشور' },
  { icon: CreditCard, label: 'پرداخت امن آنلاین' },
];

export function ProductDetailClient({ product: initial, related: initialRelated }: ProductDetailClientProps) {
  const { data } = useProduct(initial.id, initial);
  const product = data ?? initial;
  const { data: relatedData } = useRelatedProducts(product.id, 4, initialRelated);
  const related = relatedData ?? initialRelated;

  const { addItem } = useCart();
  const wishlist = useWishlist();
  const flyToCart = useFlyToCart();

  const [quantity, setQuantity] = React.useState(1);
  const mainImageRef = React.useRef<HTMLDivElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const stickyVisible = useStickyCta(ctaRef);

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;
  const price = effectivePrice(product);
  const percent = discountPercent(product);
  const wished = wishlist.has(product.id);
  const categoryLabel = PRODUCT_CATEGORY_LABELS[product.category] ?? product.category;
  const maxQuantity = Math.max(1, Math.min(product.stock, 20));

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    flyToCart(mainImageRef.current, product.images[0]);
    showToast.addedToCart(product.name);
  };

  const handleToggleWishlist = () => {
    const added = wishlist.toggle(product.id);
    if (added) showToast.addedToWishlist(product.name);
    else showToast.info('از علاقه‌مندی‌ها حذف شد', product.name);
  };

  const reviews = product.reviews ?? [];

  return (
    <div className="container-custom pb-10 pt-3 lg:pb-20 lg:pt-8">
      <Breadcrumb
        items={[
          { label: 'خانه', href: ROUTES.HOME },
          { label: 'فروشگاه', href: ROUTES.PRODUCTS },
          { label: categoryLabel, href: `${ROUTES.PRODUCTS}?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-3 grid gap-8 lg:mt-6 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} alt={product.name} mainImageRef={mainImageRef} priority />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{categoryLabel}</Badge>
            {product.featured && <Badge variant="gold">پیشنهاد اتولانژ</Badge>}
            {percent > 0 && <Badge variant="destructive">{toPersianDigits(percent)}٪ تخفیف</Badge>}
          </div>

          <h1 className="mt-3 text-balance text-2xl font-black text-foreground sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
            <span className="text-start">{product.nameEn}</span>
            {product.brand ? <span> · {product.brand}</span> : null}
          </p>

          {product.rating ? (
            <RatingStars value={product.rating} count={product.reviewCount ?? reviews.length} className="mt-3" />
          ) : null}

          {/* Price */}
          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-2xl font-black text-foreground tabular-nums sm:text-3xl">{formatToman(price)}</span>
              {percent > 0 && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">{formatToman(product.price)}</span>
              )}
            </div>
            <p
              className={cn(
                'mt-2 flex items-center gap-1.5 text-sm font-semibold',
                !inStock ? 'text-destructive' : lowStock ? 'text-warning' : 'text-success'
              )}
              aria-live="polite"
            >
              <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', !inStock ? 'bg-destructive' : lowStock ? 'bg-warning' : 'bg-success')} />
              {!inStock ? 'ناموجود' : lowStock ? `تنها ${toPersianDigits(product.stock)} عدد باقی مانده` : 'موجود در انبار'}
            </p>
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{product.shortDescription}</p>
          )}

          {product.features && product.features.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="ویژگی‌ها">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <div ref={ctaRef} className="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} disabled={!inStock} />
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="min-h-12 min-w-[10rem] flex-1 gap-2 shadow-glow-primary"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {inStock ? 'افزودن به سبد' : 'ناموجود'}
            </Button>
            <IconButton
              label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              icon={<Heart className={cn(wished && 'fill-current')} />}
              variant="outline"
              active={wished}
              onClick={handleToggleWishlist}
              className={cn('h-12 w-12', wished && 'border-red-500 text-red-500')}
            />
            <ShareButton
              payload={{ title: product.name, text: product.shortDescription ?? product.description }}
              className="h-12 w-12"
            />
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground">
                <Icon className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {product.sku && (
              <>
                <dt>کد کالا</dt>
                <dd dir="ltr" className="text-end font-medium text-foreground">{product.sku}</dd>
              </>
            )}
            {product.brand && (
              <>
                <dt>برند</dt>
                <dd dir="ltr" className="text-end font-medium text-foreground">{product.brand}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-10 lg:mt-16">
        <TabsList label="اطلاعات محصول">
          <TabsTrigger value="description">توضیحات</TabsTrigger>
          <TabsTrigger value="specs">مشخصات</TabsTrigger>
          <TabsTrigger value="reviews">
            نظرات
            <span className="text-xs text-muted-foreground">({toPersianDigits(product.reviewCount ?? reviews.length)})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="whitespace-pre-line text-sm leading-8 text-foreground/90 sm:text-base">{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2" aria-label="برچسب‌ها">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="specs">
          {product.specifications && product.specifications.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <caption className="sr-only">مشخصات فنی {product.name}</caption>
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={spec.label} className={cn(index % 2 === 0 ? 'bg-muted/40' : 'bg-transparent')}>
                      <th scope="row" className="w-2/5 px-4 py-3 text-start font-semibold text-muted-foreground">
                        {spec.label}
                      </th>
                      <td className="px-4 py-3 font-medium text-foreground" dir="auto">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              مشخصات فنی برای این محصول ثبت نشده است.
            </p>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewSection
            kind="product"
            targetId={product.id}
            reviews={reviews}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </TabsContent>
      </Tabs>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14 lg:mt-20" aria-labelledby="related-products-title">
          <SectionHeading
            id="related-products-title"
            eyebrow="پیشنهاد ما"
            title="محصولات مرتبط"
            align="start"
            className="mb-6 lg:mb-8"
          />
          <SnapRow
            label="محصولات مرتبط"
            desktopClassName="lg:grid-cols-4"
            slideClassName="flex-[0_0_72%] sm:flex-[0_0_46%] md:flex-[0_0_34%]"
          >
            {related.map((item) => (
              <ProductCard key={item.id} product={item} className="h-full" />
            ))}
          </SnapRow>
        </section>
      )}

      <StickyCtaBar
        price={price}
        oldPrice={percent > 0 ? product.price : undefined}
        primaryLabel={inStock ? 'افزودن به سبد' : 'ناموجود'}
        primaryIcon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
        onPrimary={handleAddToCart}
        primaryDisabled={!inStock}
        secondary={[
          {
            icon: <Heart className={cn('h-5 w-5', wished && 'fill-current')} aria-hidden="true" />,
            label: wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها',
            onClick: handleToggleWishlist,
            active: wished,
          },
        ]}
        visible={stickyVisible}
      />
    </div>
  );
}
