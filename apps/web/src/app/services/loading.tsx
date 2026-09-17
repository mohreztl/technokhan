import { Skeleton } from '@/components/ui/skeleton';
import { ServiceGridSkeleton } from '@/components/molecules/loading-skeletons';

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="در حال بارگذاری خدمات">
      <Skeleton className="h-[320px] w-full rounded-none lg:h-[420px]" />
      <div className="container-custom py-10 lg:py-16">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="mb-6 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <ServiceGridSkeleton count={6} />
      </div>
    </div>
  );
}
