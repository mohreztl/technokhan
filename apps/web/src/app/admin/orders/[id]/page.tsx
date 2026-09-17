import type { Metadata } from 'next';
import { AdminOrderDetailClient } from './client';

export const metadata: Metadata = {
  title: 'جزئیات سفارش',
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderDetailClient id={id} />;
}
