import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './client';
import { ProductCategory } from '@autolounge/shared';

// This would come from your API/database in production
async function getProduct(id: string) {
  // Mock data - replace with actual API call
  const MOCK_PRODUCT = {
    id: '1',
    name: 'واکس کارناوبا پریمیوم',
    nameEn: 'Premium Carnauba Wax',
    description:
      'واکس طبیعی با درخشش فوق‌العاده و دوام بالا. این محصول با استفاده از بهترین کارناوبای برزیلی تولید شده و قادر است تا ۳ ماه بر روی خودروی شما باقی بماند. مناسب برای تمام رنگ‌های خودرو و دارای فرمول آب‌گریز قوی.',
    descriptionEn: 'Natural wax with exceptional shine and high durability',
    price: 2500000,
    discountPrice: 2250000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/wax1.jpg', '/images/products/wax2.jpg', '/images/products/wax3.jpg', '/images/products/wax4.jpg'],
    stock: 15,
    featured: true,
    brand: "Meguiar's",
    rating: 4.8,
    reviewCount: 156,
    sku: 'WAX-001-PRO',
    weight: '۴۵۰ گرم',
    origin: 'ایالات متحده آمریکا',
    warranty: '۱ سال ضمانت کیفیت',
    specifications: [
      { label: 'نوع محصول', value: 'واکس کارناوبا طبیعی' },
      { label: 'حجم', value: '۴۵۰ گرم' },
      { label: 'کشور سازنده', value: 'ایالات متحده آمریکا' },
      { label: 'ماندگاری', value: 'تا ۳ ماه' },
      { label: 'کاربرد', value: 'رنگ خودرو' },
      { label: 'روش استفاده', value: 'اسفنج یا دستمال میکروفایبر' },
      { label: 'قابل شستشو', value: 'بله' },
      { label: 'دارای UV محافظت', value: 'بله' },
      { label: 'مناسب برای', value: 'تمام رنگ‌ها' },
      { label: 'دمای نگهداری', value: '۵ تا ۳۵ درجه سانتی‌گراد' },
    ],
    // Backward compatible format for client component
    specsMap: {
      'نوع محصول': 'واکس کارناوبا طبیعی',
      'حجم': '۴۵۰ گرم',
      'کشور سازنده': 'ایالات متحده آمریکا',
      'ماندگاری': 'تا ۳ ماه',
      'کاربرد': 'رنگ خودرو',
      'روش استفاده': 'اسفنج یا دستمال میکروفایبر',
      'قابل شستشو': 'بله',
      'دارای UV محافظت': 'بله',
      'مناسب برای': 'تمام رنگ‌ها',
      'دمای نگهداری': '۵ تا ۳۵ درجه سانتی‌گراد',
    },
    features: [
      'درخشش عمیق و طبیعی',
      'محافظت UV در برابر آفتاب',
      'آب‌گریزی قوی و ماندگار',
      'مناسب برای استفاده دستی',
      'بدون مواد شیمیایی مضر',
      'فرمول غیر چرب و خشن نکن',
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  // Simulate API call - in production, fetch from your backend
  if (id === '1' || id === MOCK_PRODUCT.id) {
    return MOCK_PRODUCT;
  }
  
  // Return the mock product for any ID (for demo purposes)
  return { ...MOCK_PRODUCT, id };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'محصول یافت نشد | اتولانژ',
    };
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return {
    title: `${product.name} | اتولانژ`,
    description: product.description,
    keywords: [
      product.name,
      product.nameEn,
      product.brand,
      'محصولات خودرو',
      'لوازم دیتیلینگ',
      'اتولانژ',
      'AutoLounge',
    ],
    openGraph: {
      title: `${product.name} - ${product.brand}`,
      description: product.description,
      type: 'website',
      locale: 'fa_IR',
      images: product.images[0] ? [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | اتولانژ`,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
    other: {
      'product:price:amount': String(product.discountPrice || product.price),
      'product:price:currency': 'IRR',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:brand': product.brand,
      ...(discount > 0 && { 'product:sale_price:amount': String(product.discountPrice) }),
    },
  };
}

// Generate JSON-LD structured data for SEO
function generateProductJsonLd(product: Awaited<ReturnType<typeof getProduct>>) {
  if (!product) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://autolounge.ir/products/${product.id}`,
      priceCurrency: 'IRR',
      price: product.discountPrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'اتولانژ',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

// Main page component
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const jsonLd = generateProductJsonLd(product);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient product={product} />
    </>
  );
}
