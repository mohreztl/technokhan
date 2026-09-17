import { Skeleton } from '@/components/ui/skeleton';

/** Layout-matching placeholder for the booking wizard (Suspense + draft restore). */
export function BookingWizardSkeleton() {
  return (
    <div className="container-custom pb-24 lg:pb-16" aria-busy="true" aria-label="در حال بارگذاری">
      <div className="mb-6 space-y-2 text-center lg:text-start">
        <Skeleton className="mx-auto h-3 w-20 lg:mx-0" />
        <Skeleton className="mx-auto h-8 w-48 lg:mx-0" />
        <Skeleton className="mx-auto h-4 w-64 lg:mx-0" />
      </div>
      <div className="mx-auto mb-8 flex max-w-xl justify-between lg:mx-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <Skeleton className="hidden h-80 rounded-2xl lg:block" />
      </div>
    </div>
  );
}
