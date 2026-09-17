import { Skeleton } from '@/components/ui/skeleton';

/** Server-safe placeholder for the wizard (Suspense fallback and pre-hydration gate). */
export function BookingStepSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-40 shrink-0 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-32 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function BookingWizardSkeleton() {
  return (
    <div className="container-custom pb-28 pt-4 lg:pb-16 lg:pt-8" aria-busy="true" aria-label="در حال بارگذاری رزرو">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-72 rounded" />
      <div className="mt-8 flex items-start justify-between">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <BookingStepSkeleton />
        <Skeleton className="hidden h-80 rounded-3xl lg:block" />
      </div>
    </div>
  );
}
