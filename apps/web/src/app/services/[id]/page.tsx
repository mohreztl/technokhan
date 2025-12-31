import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceDetailClient } from './client';
import { ServiceType } from '@autolounge/shared';

// This would come from your API/database in production
async function getService(id: string) {
  // Mock data - replace with actual API call
  const MOCK_SERVICE = {
    id: '1',
    name: 'رپینت و صافکاری کامل',
    nameEn: 'Full Paint Restoration',
    description:
      'بازگرداندن درخشش اصلی رنگ خودرو با تکنیک‌های پیشرفته رپینت و صافکاری توسط متخصصان مجرب. این سرویس شامل پولیش چند مرحله‌ای، اصلاح رنگ، و محافظت نهایی با واکس پریمیوم است. ما از بهترین ابزار و محصولات روز دنیا استفاده می‌کنیم تا نتیجه‌ای حرفه‌ای و ماندگار به شما ارائه دهیم.',
    descriptionEn: 'Restore original paint shine with advanced techniques',
    price: 15000000,
    duration: 480,
    type: ServiceType.PAINT_RESTORATION,
    images: [
      '/images/services/paint1.jpg',
      '/images/services/paint2.jpg',
      '/images/services/paint3.jpg',
      '/images/services/paint4.jpg',
    ],
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  // Simulate API call - in production, fetch from your backend
  if (id === '1' || id === MOCK_SERVICE.id) {
    return MOCK_SERVICE;
  }
  
  // Return the mock service for any ID (for demo purposes)
  return { ...MOCK_SERVICE, id };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    return {
      title: 'خدمات یافت نشد | اتولانژ',
    };
  }

  const durationHours = Math.floor(service.duration / 60);

  return {
    title: `${service.name} | خدمات اتولانژ`,
    description: service.description,
    keywords: [
      service.name,
      service.nameEn,
      'خدمات خودرو',
      'دیتیلینگ',
      'رپینت',
      'سرامیک کوتینگ',
      'اتولانژ',
      'AutoLounge',
    ],
    openGraph: {
      title: `${service.name} - خدمات حرفه‌ای خودرو`,
      description: service.description,
      type: 'website',
      locale: 'fa_IR',
      images: service.images[0] ? [
        {
          url: service.images[0],
          width: 1200,
          height: 630,
          alt: service.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.name} | اتولانژ`,
      description: service.description,
      images: service.images[0] ? [service.images[0]] : [],
    },
    other: {
      'service:price:amount': String(service.price),
      'service:price:currency': 'IRR',
      'service:duration': `${durationHours} hours`,
    },
  };
}

// Generate JSON-LD structured data for SEO
function generateServiceJsonLd(service: Awaited<ReturnType<typeof getService>>) {
  if (!service) return null;
  
  const durationHours = Math.floor(service.duration / 60);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    image: service.images,
    provider: {
      '@type': 'LocalBusiness',
      name: 'اتولانژ',
      image: '/images/logo.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'تهران',
        addressCountry: 'IR',
      },
    },
    offers: {
      '@type': 'Offer',
      url: `https://autolounge.ir/services/${service.id}`,
      priceCurrency: 'IRR',
      price: service.price,
      availability: 'https://schema.org/InStock',
    },
    serviceType: service.type,
    areaServed: {
      '@type': 'City',
      name: 'تهران',
    },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '09:00',
      closes: '21:00',
    },
  };
}

// Main page component
export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  const jsonLd = generateServiceJsonLd(service);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ServiceDetailClient service={service} />
    </>
  );
}
