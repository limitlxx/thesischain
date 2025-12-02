import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ThesisSearchCardSkeleton() {
  return (
    <Card className="border-border/40 overflow-hidden flex flex-col">
      {/* Thumbnail skeleton */}
      <div className="relative w-full h-48 bg-muted">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 flex flex-col">
        {/* University & Department skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-2 rounded-lg bg-muted">
              <Skeleton className="h-3 w-8 mb-2" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-9 w-full mt-auto" />
      </CardContent>
    </Card>
  )
}
