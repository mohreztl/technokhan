import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="container-custom space-y-4 pb-16" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
