"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitFork, DollarSign } from "lucide-react"
import Image from "next/image"
import { ShareToX } from "@/components/ShareToX"

interface Thesis {
  id: string
  title: string
  university: string
  totalEarnings: number
  forks: number
  thumbnail: string
  earnings: number
}

interface ThesisGridProps {
  theses: Thesis[]
}

export function ThesisGrid({ theses }: ThesisGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {theses.map((thesis) => (
        <Card
          key={thesis.id}
          className="border-border/40 hover:border-accent/50 transition-colors overflow-hidden flex flex-col"
        >
          {/* Thumbnail */}
          {/* <div className="relative w-full h-40 bg-gradient-to-br from-accent-deep/20 to-accent-warm/20 overflow-hidden">
            <Image
              src={thesis.thumbnail || "/placeholder.svg"}
              alt={thesis.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div> */}

          {/* Content */}
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-base line-clamp-2">{thesis.title}</CardTitle>
                <CardDescription className="mt-1">{thesis.university}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                NFT
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/5">
                <DollarSign className="h-4 w-4 text-accent-warm" />
                <div>
                  <p className="text-xs text-foreground/60">Earnings</p>
                  <p className="text-sm font-semibold text-foreground">${thesis.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/5">
                <GitFork className="h-4 w-4 text-accent-deep" />
                <div>
                  <p className="text-xs text-foreground/60">Forks</p>
                  <p className="text-sm font-semibold text-foreground">{thesis.forks}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                View Details
              </Button>
              <ShareToX 
                thesisId={thesis.id}
                title={thesis.title}
                variant="outline"
                size="icon"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
