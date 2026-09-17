import type { Metadata } from 'next';
import { AdminBookingDetailClient } from './client';

export const metadata: Metadata = {
  title: 'جزئیات رزرو',
};

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminBookingDetailClient id={id} />;
}
