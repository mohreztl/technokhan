import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardSkeleton } from '@/components/molecules/loading-skeletons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-6 w-20 mb-4 rounded-full" />
          <Skeleton className="h-12 w-72 mb-4" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>

        {/* Search and Controls Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <ProductCardSkeleton count={9} />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />
    </div>
  );
}
