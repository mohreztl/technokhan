import { createElement } from 'react';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_NAME_EN,
  CONTACT,
  PRODUCT_CATEGORY_LABELS,
  SERVICE_TYPE_LABELS,
  SOCIAL_MEDIA,
  effectivePrice,
  type Product,
  type Service,
} from '@autolounge/shared';
import { absoluteUrl } from '@/lib/site';

export type JsonLdData = Record<string, unknown>;

const ORGANIZATION_ID = () => absoluteUrl('/#organization');
const LOCAL_BUSINESS_ID = () => absoluteUrl('/#localbusiness');

/** Absolute URL for a public asset path; leaves already-absolute URLs untouched. */
function toAbsolute(path: string): string {
  return /^https?:\/\//i.test(path) ? path : absoluteUrl(path);
}

/** Toman → Rial (schema.org has no IRT code; IRR is the ISO currency). */
const tomanToRial = (toman: number) => toman * 10;

function ratingOf(entity: Pick<Product, 'rating' | 'reviewCount'>) {
  if (!entity.rating || !entity.reviewCount) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: entity.rating,
    reviewCount: entity.reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

export function organizationJsonLd(): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID(),
    name: APP_NAME,
    alternateName: APP_NAME_EN,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/logo.svg'),
    description: APP_DESCRIPTION,
    email: CONTACT.email,
    telephone: CONTACT.phoneEn,
    sameAs: Object.values(SOCIAL_MEDIA),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: CONTACT.phoneEn,
        contactType: 'customer service',
        areaServed: 'IR',
        availableLanguage: ['fa'],
      },
    ],
  };
}

export function localBusinessJsonLd(): JsonLdData {
  const { lat, lng } = CONTACT.location;
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoRepair'],
    '@id': LOCAL_BUSINESS_ID(),
    name: APP_NAME,
    alternateName: APP_NAME_EN,
    description: APP_DESCRIPTION,
    url: absoluteUrl('/'),
    image: [absoluteUrl('/hero1.webp'), absoluteUrl('/images/workshop.webp')],
    logo: absoluteUrl('/images/logo.svg'),
    telephone: CONTACT.phoneEn,
    email: CONTACT.email,
    priceRange: '$$$',
    parentOrganization: { '@id': ORGANIZATION_ID() },
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.addressEn,
      addressLocality: 'Tehran',
      addressCountry: 'IR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
    hasMap: `https://www.google.com/maps?q=${lat},${lng}`,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    sameAs: Object.values(SOCIAL_MEDIA),
  };
}

export function productJsonLd(product: Product, url: string): JsonLdData {
  const price = effectivePrice(product);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    alternateName: product.nameEn,
    description: product.shortDescription ?? product.description,
    image: product.images.map(toAbsolute),
    sku: product.sku ?? product.id,
    category: PRODUCT_CATEGORY_LABELS[product.category] ?? product.category,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    url,
    aggregateRating: ratingOf(product),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IRR',
      price: tomanToRial(price),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': ORGANIZATION_ID() },
    },
  };
}

export function serviceJsonLd(service: Service, url: string): JsonLdData {
  const pricing = service.pricing;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    alternateName: service.nameEn,
    description: service.description,
    serviceType: SERVICE_TYPE_LABELS[service.type] ?? service.type,
    image: service.images.map(toAbsolute),
    url,
    provider: { '@id': LOCAL_BUSINESS_ID() },
    areaServed: { '@type': 'City', name: 'Tehran' },
    aggregateRating: ratingOf(service),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IRR',
      price: tomanToRial(pricing?.small ?? service.price),
      priceSpecification: pricing
        ? {
            '@type': 'PriceSpecification',
            priceCurrency: 'IRR',
            minPrice: tomanToRial(pricing.small),
            maxPrice: tomanToRial(pricing.large),
          }
        : undefined,
      availability: 'https://schema.org/InStock',
    },
  };
}

export interface BreadcrumbJsonLdItem {
  name: string;
  href?: string;
}

export function breadcrumbJsonLd(items: BreadcrumbJsonLdItem[]): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href ? absoluteUrl(item.href) : undefined,
    })),
  };
}

/** Serialises JSON-LD safely for an inline script (no `</script>` break-outs). */
export function serializeJsonLd(data: JsonLdData | JsonLdData[]): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Renders one or more JSON-LD graphs in a `<script type="application/ld+json">`. */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  });
}
