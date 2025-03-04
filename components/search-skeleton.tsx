import { Skeleton } from "@/components/ui/skeleton"

export function SearchSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3 animate-shimmer" />
        <Skeleton className="h-4 w-1/4 animate-shimmer" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full animate-shimmer" />
        <Skeleton className="h-4 w-full animate-shimmer" />
        <Skeleton className="h-4 w-full animate-shimmer" />
        <Skeleton className="h-4 w-3/4 animate-shimmer" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full animate-shimmer" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24 animate-shimmer" />
          <Skeleton className="h-8 w-32 animate-shimmer" />
          <Skeleton className="h-8 w-28 animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

