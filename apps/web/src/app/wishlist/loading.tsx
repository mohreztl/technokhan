import { ProductGridSkeleton } from '@/components/molecules/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container-custom py-6 lg:py-10" aria-busy="true">
      <Skeleton className="mb-6 h-9 w-48" />
      <ProductGridSkeleton count={4} />
    </div>
  );
}
