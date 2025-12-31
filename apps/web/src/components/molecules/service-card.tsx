'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDuration } from '@/lib/utils';
import type { Service } from '@autolounge/shared';

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'horizontal';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, variant = 'default' }) => {
  const prefersReducedMotion = useReducedMotion();

  if (variant === 'horizontal') {
    return (
      <Card className="group overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-80 h-48 md:h-auto overflow-hidden flex-shrink-0">
            <Image
              src={service.images[0] || '/placeholder-service.jpg'}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
            {service.featured && (
              <Badge className="absolute top-4 right-4 bg-primary gap-1">
                <Sparkles className="h-3 w-3" />
                محبوب
              </Badge>
            )}
          </div>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{formatDuration(service.duration)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{formatPrice(service.price)}</span>
              <div className="flex gap-2">
                <Link href={`/services/${service.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    جزئیات
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                </Link>
                <Link href={`/booking?service=${service.id}`}>
                  <Button size="sm" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    رزرو
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden h-full">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={service.images[0] || '/placeholder-service.jpg'}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {service.featured && (
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={prefersReducedMotion ? {} : { scale: 1 }}
            transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Badge className="absolute top-4 right-4 bg-primary gap-1">
              <Sparkles className="h-3 w-3" />
              محبوب
            </Badge>
          </motion.div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{service.description}</p>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{formatDuration(service.duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">شروع از:</span>
            <span className="text-xl font-bold text-primary">{formatPrice(service.price)}</span>
          </div>

          <Link href={`/booking?service=${service.id}`}>
            <Button size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              رزرو نوبت
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
