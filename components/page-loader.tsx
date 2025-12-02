"use client"

import { Loader2 } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent-deep" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
