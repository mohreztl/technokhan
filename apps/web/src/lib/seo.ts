import { createElement } from 'react';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_NAME_EN,
  CONTACT,
  findCategory,
  PRODUCT_CATEGORY_LABELS,
  SERVICE_TYPE_LABELS,
  SOCIAL_MEDIA,
  effectivePrice,
  type Article,
  type FaqItem,
  type Product,
  type Service,
} from '@technokhan/shared';
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
    '@type': 'OnlineStore',
    '@id': ORGANIZATION_ID(),
    name: APP_NAME,
    alternateName: APP_NAME_EN,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/logo.svg'),
    description: APP_DESCRIPTION,
    email: CONTACT.email,
    sameAs: Object.values(SOCIAL_MEDIA),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: CONTACT.email,
        contactType: 'customer service',
        areaServed: 'IR',
        availableLanguage: ['fa'],
      },
    ],
  };
}

/** WebSite graph with the storefront's canonical search endpoint. */
export function websiteJsonLd(): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    alternateName: APP_NAME_EN,
    url: absoluteUrl('/'),
    inLanguage: 'fa-IR',
    publisher: { '@id': ORGANIZATION_ID() },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/shop')}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
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

/** Product graph plus the visible Home → Shop → Category → Product breadcrumb. */
export function productPageJsonLd(product: Product): JsonLdData[] {
  const path = `/product/${product.id}`;
  const category = findCategory(product.category);
  return [
    productJsonLd(product, absoluteUrl(path)),
    breadcrumbJsonLd([
      { name: 'خانه', href: '/' },
      { name: 'فروشگاه', href: '/shop' },
      { name: category?.name ?? product.category, href: `/category/${product.category}` },
      { name: product.name, href: path },
    ]),
  ];
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

/**
 * Google shows FAQ rich results only for a page whose visible content is the
 * questions themselves — so this belongs on /faq and on a service page, never
 * on a page that merely links to them.
 */
export function faqJsonLd(items: FaqItem[]): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function articleJsonLd(article: Article, url: string): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    image: [toAbsolute(article.cover)],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { '@type': 'Person', name: article.author.name, jobTitle: article.author.role },
    publisher: { '@id': ORGANIZATION_ID() },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: article.category,
    keywords: article.tags.join('، '),
    inLanguage: 'fa-IR',
    url,
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
