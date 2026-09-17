import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="container-custom pb-16" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
