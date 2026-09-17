'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { ROUTES, formatToman, toPersianDigits, type Service } from '@autolounge/shared';
import { cn, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'horizontal';
  className?: string;
}

const bookingHref = (service: Service) => `${ROUTES.BOOKING}?service=${service.id}`;
const detailHref = (service: Service) => `${ROUTES.SERVICES}/${service.id}`;

function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-lg shadow-primary/30">
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      محبوب
    </span>
  );
}

function Meta({ service, light = false }: { service: Service; light?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs', light ? 'text-white/80' : 'text-muted-foreground')}>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {formatDuration(service.duration)}
      </span>
      {service.warrantyMonths ? (
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {toPersianDigits(service.warrantyMonths)} ماه گارانتی
        </span>
      ) : null}
      {service.rating ? (
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" aria-hidden="true" />
          {toPersianDigits(service.rating)}
        </span>
      ) : null}
    </div>
  );
}

function Price({ service, className }: { service: Service; className?: string }) {
  return (
    <div className={cn('flex flex-col leading-tight', className)}>
      <span className="text-[11px] text-muted-foreground">شروع از</span>
      <span className="text-lg font-black text-primary dark:text-secondary tabular-nums sm:text-xl">
        {formatToman(service.price)}
      </span>
    </div>
  );
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  variant = 'default',
  className,
}) => {
  const image = service.images[0];

  if (variant === 'horizontal') {
    return (
      <article
        className={cn(
          'group overflow-hidden rounded-2xl border border-border/50 glass-effect shadow-lg transition-all duration-500 hover:border-secondary/40 hover:shadow-luxury',
          className
        )}
      >
        <div className="flex flex-col md:flex-row">
          <Link
            href={detailHref(service)}
            className="relative block h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-80"
            aria-label={service.name}
            tabIndex={-1}
          >
            {image && (
              <Image
                src={image}
                alt={service.name}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-l" />
            {service.featured && (
              <span className="absolute start-4 top-4">
                <FeaturedBadge />
              </span>
            )}
          </Link>
          <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
            <div>
              <h3 className="mb-2 text-lg font-bold text-foreground sm:text-xl">
                <Link href={detailHref(service)} className="hover:text-primary">
                  {service.name}
                </Link>
              </h3>
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                {service.shortDescription ?? service.description}
              </p>
              <Meta service={service} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Price service={service} />
              <div className="flex gap-2">
                <Button asChild variant="outline" className="gap-1.5">
                  <Link href={detailHref(service)}>
                    جزئیات
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="gap-1.5 shadow-glow-secondary">
                  <Link href={bookingHref(service)}>
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    رزرو
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 glass-effect shadow-lg transition-all duration-500 hover:border-secondary/40 hover:shadow-luxury',
        className
      )}
    >
      <Link
        href={detailHref(service)}
        className="relative block aspect-[4/3] overflow-hidden sm:aspect-[16/10]"
        aria-label={service.name}
        tabIndex={-1}
      >
        {image && (
          <Image
            src={image}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {service.featured && (
          <span className="absolute start-4 top-4">
            <FeaturedBadge />
          </span>
        )}

        <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <span className="mb-1 block text-lg font-bold text-white sm:text-xl">{service.name}</span>
          <span className="line-clamp-2 block text-sm text-white/80">
            {service.shortDescription ?? service.description}
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <Meta service={service} />

        <div className="mt-auto flex items-center justify-between gap-3">
          <Price service={service} />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden px-3 sm:inline-flex">
              <Link href={detailHref(service)} aria-label={`جزئیات ${service.name}`}>
                جزئیات
              </Link>
            </Button>
            <Button asChild variant="secondary" className="gap-2 shadow-glow-secondary">
              <Link href={bookingHref(service)} aria-label={`رزرو ${service.name}`}>
                <Calendar className="h-4 w-4" aria-hidden="true" />
                رزرو
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
