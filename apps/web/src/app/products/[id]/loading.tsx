import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div>
              <Skeleton className="h-12 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-16">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>

        {/* Related Products Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
