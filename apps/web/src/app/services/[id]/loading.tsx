import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Service Main Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          </div>

          {/* Service Info Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <div>
              <Skeleton className="h-12 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-16">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-40" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>

        {/* Related Services Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
