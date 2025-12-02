import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardTableSkeleton() {
  return (
    <Card className="border-border/40 overflow-hidden">
      <CardContent className="p-0">
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block">
          <div className="bg-muted/50 border-b border-border/40 px-6 py-4 grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b border-border/40 px-6 py-4 grid grid-cols-6 gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Mobile List Skeleton */}
        <div className="md:hidden divide-y divide-border/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-8 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
