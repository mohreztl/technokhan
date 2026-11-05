'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { OrdersList } from '@/components/orders/orders-list';

export function TabOrders() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">سفارش‌های من</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.ORDERS}>
            صفحهٔ سفارش‌ها
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <OrdersList />
    </div>
  );
}
