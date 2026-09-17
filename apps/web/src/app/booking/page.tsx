import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { BookingWizardSkeleton } from '@/components/booking/wizard-skeleton';

export const metadata: Metadata = {
  title: 'رزرو نوبت',
  description:
    'رزرو آنلاین نوبت دیتیلینگ، سرامیک، کاور و رپ خودرو در اتولانژ؛ انتخاب خدمت، زمان و ثبت مشخصات خودرو در چند مرحلهٔ ساده.',
};

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingWizardSkeleton />}>
      <BookingWizard />
    </Suspense>
  );
}
