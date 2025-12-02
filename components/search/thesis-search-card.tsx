"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, GitFork, BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ShareToX } from "@/components/ShareToX"

interface Thesis {
  id: string
  title: string
  author: string
  university: string
  department: string
  year: number
  citations: number
  earnings: number
  thumbnail: string
  universityLogo: string
  forks: number
}

export function ThesisSearchCard({ thesis }: { thesis: Thesis }) {
  return (
    <Card className="border-border/40 hover:border-accent-deep/50 transition-all overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      {/* <div className="relative w-full h-48 bg-gradient-to-br from-accent-deep/20 to-accent-warm/20 overflow-hidden">
        <Image
          src={thesis.thumbnail || "/placeholder.svg"}
          alt={thesis.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div> */}

      {/* Content */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2 leading-tight font-serif">{thesis.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
            {thesis.year}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          by <span className="font-medium text-foreground/80">{thesis.author}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 flex flex-col">
        {/* University & Department */}
        <div className="flex items-center gap-2">
          <Image
            src={thesis.universityLogo || "/placeholder.svg"}
            alt={thesis.university}
            width={24}
            height={24}
            className="rounded-full"
          />
          <div className="text-sm">
            <p className="font-medium text-foreground/90">{thesis.university}</p>
            <p className="text-xs text-foreground/60">{thesis.department}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-accent-deep/5 border border-accent-deep/20">
            <div className="flex items-center gap-1 mb-1">
              <BookOpen className="h-3 w-3 text-accent-deep" />
            </div>
            <p className="text-xs text-foreground/60">Citations</p>
            <p className="text-sm font-semibold text-foreground">{thesis.citations}</p>
          </div>
          <div className="p-2 rounded-lg bg-accent-warm/5 border border-accent-warm/20">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-accent-warm" />
            </div>
            <p className="text-xs text-foreground/60">Earnings</p>
            <p className="text-sm font-semibold text-foreground">${thesis.earnings.toFixed(0)}</p>
          </div>
          <div className="p-2 rounded-lg bg-accent-kente/5 border border-accent-kente/20">
            <div className="flex items-center gap-1 mb-1">
              <GitFork className="h-3 w-3 text-accent-kente" />
            </div>
            <p className="text-xs text-foreground/60">Forks</p>
            <p className="text-sm font-semibold text-foreground">{thesis.forks}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/thesis/${thesis.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              View & Fork
            </Button>
          </Link>
          <ShareToX 
            thesisId={thesis.id}
            title={thesis.title}
            variant="outline"
            size="icon"
          />
        </div>
      </CardContent>
    </Card>
  )
}
