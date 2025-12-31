'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Check,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Minus,
  Plus,
  ZoomIn,
  Package,
  Clock,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { ProductCard } from '@/components/molecules/product-card';
import { useCart } from '@/lib/store';
import { ROUTES, ProductCategory, type Product } from '@autolounge/shared';

// Mock reviews data
const MOCK_REVIEWS = [
  {
    id: '1',
    userName: 'محمد رضایی',
    rating: 5,
    comment:
      'عالی بود! درخششی که به ماشینم داد فوق‌العاده است. تا الان که ۲ ماه شده هنوز مثل روز اول درخشان هست.',
    date: '۱۴۰۲/۱۲/۱۵',
    verified: true,
    helpful: 24,
  },
  {
    id: '2',
    userName: 'علی احمدی',
    rating: 4,
    comment: 'خیلی خوب بود ولی فکر می‌کنم قیمتش کمی بالاست. البته کیفیتش عالیه و ارزشش رو داره.',
    date: '۱۴۰۲/۱۲/۱۰',
    verified: true,
    helpful: 12,
  },
  {
    id: '3',
    userName: 'سارا کریمی',
    rating: 5,
    comment:
      'بهترین واکسی که تا حالا استفاده کردم. آب‌گریزیش فوق‌العاده است و باران رو خیلی راحت دفع می‌کنه.',
    date: '۱۴۰۲/۱۲/۰۵',
    verified: false,
    helpful: 8,
  },
  {
    id: '4',
    userName: 'رضا محمدی',
    rating: 5,
    comment: 'پکیج بندی حرفه‌ای و ارسال سریع. محصول کیفیت عالی داره و نتیجه‌اش عالیه.',
    date: '۱۴۰۲/۱۱/۲۸',
    verified: true,
    helpful: 18,
  },
];

// Related products mock data
const RELATED_PRODUCTS: Product[] = [
  {
    id: '2',
    name: 'حوله میکروفایبر دوطرفه',
    nameEn: 'Microfiber Towel',
    description: 'حوله میکروفایبر دوطرفه با کیفیت بالا برای خشک کردن و پولیش',
    descriptionEn: 'High-quality microfiber towel',
    price: 450000,
    images: ['/images/products/towel.jpg'],
    category: ProductCategory.ACCESSORIES,
    stock: 50,
    featured: false,
    brand: 'AutoPro',
    rating: 4.5,
    reviewCount: 45,
    sku: 'TOW-002',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'پولیش کامپاوند',
    nameEn: 'Compound Polish',
    description: 'پولیش کامپاوند حرفه‌ای برای رفع خط و خش',
    descriptionEn: 'Professional compound polish',
    price: 1850000,
    images: ['/images/products/polish.jpg'],
    category: ProductCategory.DETAILING,
    stock: 20,
    featured: false,
    brand: 'Meguiars',
    rating: 4.7,
    reviewCount: 78,
    sku: 'POL-005',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'کیت دیتیلینگ حرفه‌ای',
    nameEn: 'Professional Detailing Kit',
    description: 'کیت کامل دیتیلینگ شامل تمام ابزارهای مورد نیاز',
    descriptionEn: 'Complete detailing kit',
    price: 5800000,
    discountPrice: 4950000,
    images: ['/images/products/kit.jpg'],
    category: ProductCategory.TOOLS,
    stock: 10,
    featured: true,
    brand: 'Chemical Guys',
    rating: 4.9,
    reviewCount: 132,
    sku: 'KIT-003',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'پد پولیش نرم',
    nameEn: 'Soft Polishing Pad',
    description: 'پد پولیش نرم برای برق اندازی نهایی',
    descriptionEn: 'Soft polishing pad',
    price: 380000,
    images: ['/images/products/pad.jpg'],
    category: ProductCategory.ACCESSORIES,
    stock: 35,
    featured: false,
    brand: 'Buff & Shine',
    rating: 4.6,
    reviewCount: 56,
    sku: 'PAD-006',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface ProductDetailClientProps {
  product: Product & {
    specsMap?: Record<string, string>;
    features?: string[];
    weight?: string;
    origin?: string;
    warranty?: string;
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const { addItem, openCart } = useCart();

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleQuantityChange = useCallback((action: 'increase' | 'decrease') => {
    setQuantity((prev) => {
      if (action === 'increase' && prev < product.stock) return prev + 1;
      if (action === 'decrease' && prev > 1) return prev - 1;
      return prev;
    });
  }, [product.stock]);

  const handleAddToCart = useCallback(() => {
    // Create a product object for the cart
    const cartProduct: Product = {
      ...product,
      // Ensure we have the required fields
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      description: product.description,
      descriptionEn: product.descriptionEn,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      category: product.category,
      stock: product.stock,
      featured: product.featured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    
    // Add item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(cartProduct);
    }
    openCart();
  }, [addItem, openCart, product, quantity]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background"
    >
      {/* Hero Section with Product */}
      <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <motion.nav
            variants={itemVariants}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
            aria-label="Breadcrumb"
          >
            <Link href={ROUTES.HOME} className="hover:text-foreground transition-colors">
              خانه
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href={ROUTES.PRODUCTS} className="hover:text-foreground transition-colors">
              محصولات
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </motion.nav>

          {/* Main Product Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted border border-primary/10 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={product.images[selectedImage] || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-500 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <Badge variant="destructive" className="text-base px-4 py-1.5 font-bold">
                      {discount}% تخفیف
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-secondary text-secondary-foreground px-4 py-1.5">
                      پرفروش
                    </Badge>
                  )}
                </div>

                {/* Zoom indicator */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                        selectedImage === index
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image || '/images/placeholder-product.jpg'}
                        alt={`${product.name} - تصویر ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Brand and Rating */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-1">
                  {product.brand}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${
                          index < Math.floor(product.rating || 0)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviewCount || 0} نظر)</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground">{product.nameEn}</p>
              </div>

              {/* Price Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                <div className="flex items-end gap-4 flex-wrap">
                  {product.discountPrice ? (
                    <>
                      <span className="text-4xl font-black text-secondary">
                        {product.discountPrice.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-xl text-muted-foreground line-through decoration-destructive/50">
                        {product.price.toLocaleString('fa-IR')}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-secondary">
                      {product.price.toLocaleString('fa-IR')}
                    </span>
                  )}
                  <span className="text-lg text-muted-foreground">تومان</span>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-success mt-2">
                    شما {((product.price - (product.discountPrice || 0))).toLocaleString('fa-IR')} تومان صرفه‌جویی می‌کنید!
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {product.stock > 0 ? (
                  <>
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-50" />
                    </div>
                    <span className="text-success font-medium">
                      موجود در انبار
                      <span className="text-muted-foreground mr-1">({product.stock} عدد)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-destructive font-medium">ناموجود</span>
                  </>
                )}
              </div>

              {/* Quick Features */}
              {product.features && product.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.slice(0, 4).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm p-3 rounded-xl bg-muted/50 border border-primary/5"
                    >
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">تعداد:</span>
                  <div className="flex items-center gap-1 bg-muted/50 border border-primary/10 rounded-xl p-1">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="کاهش تعداد"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      disabled={quantity >= product.stock}
                      className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="افزایش تعداد"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="xl"
                    className="flex-1 gap-2 text-base"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    افزودن به سبد خرید
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
                    aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive' : ''}`} />
                  </Button>
                  <Button variant="outline" size="xl" onClick={handleShare} aria-label="اشتراک‌گذاری">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-primary/10">
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">ارسال رایگان</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-secondary" />
                  </div>
                  <span className="text-xs text-muted-foreground">ضمانت اصالت</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-xs text-muted-foreground">۷ روز مرجوعی</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">بسته‌بندی اختصاصی</span>
                </div>
              </div>

              {/* SKU Info */}
              <div className="text-sm text-muted-foreground">
                <span>کد محصول: </span>
                <span className="font-mono">{product.sku}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-12 lg:py-16">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 w-full justify-center flex-wrap">
                <TabsTrigger value="description" className="gap-2">
                  <Package className="h-4 w-4" />
                  توضیحات
                </TabsTrigger>
                <TabsTrigger value="specifications" className="gap-2">
                  <Clock className="h-4 w-4" />
                  مشخصات فنی
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  نظرات ({MOCK_REVIEWS.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <div className="space-y-8 p-6 sm:p-8 rounded-2xl bg-muted/30 border border-primary/10">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">درباره محصول</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold mb-4">ویژگی‌های کلیدی</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                            <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-primary/10">
                    {product.weight && (
                      <div className="p-4 rounded-xl bg-background/50">
                        <span className="text-sm text-muted-foreground">وزن:</span>
                        <p className="font-bold">{product.weight}</p>
                      </div>
                    )}
                    {product.origin && (
                      <div className="p-4 rounded-xl bg-background/50">
                        <span className="text-sm text-muted-foreground">کشور سازنده:</span>
                        <p className="font-bold">{product.origin}</p>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="p-4 rounded-xl bg-background/50">
                        <span className="text-sm text-muted-foreground">گارانتی:</span>
                        <p className="font-bold">{product.warranty}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications">
                <div className="p-6 sm:p-8 rounded-2xl bg-muted/30 border border-primary/10">
                  <h3 className="text-2xl font-bold mb-6">مشخصات فنی</h3>
                  {product.specsMap && Object.keys(product.specsMap).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(product.specsMap).map(([key, value], index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-2 gap-4 p-4 rounded-xl transition-colors ${
                            index % 2 === 0 ? 'bg-background/50' : ''
                          }`}
                        >
                          <span className="font-medium text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : product.specifications && product.specifications.length > 0 ? (
                    <div className="space-y-1">
                      {product.specifications.map((spec, index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-2 gap-4 p-4 rounded-xl transition-colors ${
                            index % 2 === 0 ? 'bg-background/50' : ''
                          }`}
                        >
                          <span className="font-medium text-muted-foreground">{spec.label}</span>
                          <span className="font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">مشخصات فنی برای این محصول ثبت نشده است.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-6 p-6 sm:p-8 rounded-2xl bg-muted/30 border border-primary/10">
                  {/* Reviews Summary */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-primary/10">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">نظرات کاربران</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-6 w-6 ${
                                index < Math.floor(product.rating || 0)
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-2xl font-bold">{product.rating}</span>
                        <span className="text-muted-foreground">از ۵ ({product.reviewCount || 0} نظر)</span>
                      </div>
                    </div>
                    <Button variant="primary" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      ثبت نظر جدید
                    </Button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {MOCK_REVIEWS.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-5 rounded-xl bg-background/50 border border-primary/5"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="md" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold">{review.userName}</span>
                                {review.verified && (
                                  <Badge variant="success" className="text-xs">
                                    <Check className="h-3 w-3 ml-1" />
                                    خریدار
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            مفید بود ({review.helpful})
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <Badge variant="secondary" className="mb-3">محصولات مرتبط</Badge>
                <h2 className="text-2xl sm:text-3xl font-black">شاید این‌ها هم بپسندید</h2>
              </div>
              <Link href={ROUTES.PRODUCTS}>
                <Button variant="outline" className="gap-2">
                  مشاهده همه
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RELATED_PRODUCTS.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
