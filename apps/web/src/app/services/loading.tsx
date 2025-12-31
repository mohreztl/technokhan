import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-12 w-80 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Search and Controls Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="flex-1 h-12" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Services Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-72 w-full rounded-xl" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
