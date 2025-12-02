"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Medal, TrendingUp } from "lucide-react"
import Link from "next/link"

interface ThesisRank {
  rank: number
  id: string
  title: string
  author: string
  university: string
  country: string
  earnings: number
  forks: number
  citations: number
  year: number
}

export function LeaderboardTable({ theses }: { theses: ThesisRank[] }) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-orange-600"
      default:
        return "text-foreground/30"
    }
  }

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Thesis</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">University</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Earnings</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Forks</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Citations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {theses.map((thesis) => (
                <tr key={thesis.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {thesis.rank <= 3 && <Medal className={`h-5 w-5 ${getMedalColor(thesis.rank)}`} />}
                      <span
                        className={`font-semibold ${thesis.rank <= 3 ? "text-accent-kente" : "text-foreground/60"}`}
                      >
                        #{thesis.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/thesis/${thesis.id}`} className="group/link">
                      <p className="font-medium text-foreground group-hover/link:text-accent-deep transition-colors line-clamp-1">
                        {thesis.title}
                      </p>
                      <p className="text-xs text-foreground/60 mt-1">{thesis.author}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{thesis.university}</p>
                      <p className="text-xs text-foreground/60">{thesis.country}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="bg-accent-warm/10 text-accent-warm border-accent-warm/20">
                      ${thesis.earnings.toFixed(0)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="border-accent-kente/30 text-foreground">
                      {thesis.forks}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-accent-deep" />
                      <span className="text-sm font-medium text-foreground">{thesis.citations}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-border/40">
          {theses.map((thesis) => (
            <Link key={thesis.id} href={`/thesis/${thesis.id}`}>
              <div className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {thesis.rank <= 3 && <Medal className={`h-5 w-5 ${getMedalColor(thesis.rank)}`} />}
                    <span className={`font-semibold ${thesis.rank <= 3 ? "text-accent-kente" : "text-foreground/60"}`}>
                      #{thesis.rank}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-2">{thesis.title}</p>
                    <p className="text-xs text-foreground/60 mt-1">{thesis.author}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-foreground/60 mb-1">Earnings</p>
                    <p className="font-semibold text-accent-warm">${thesis.earnings.toFixed(0)}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-foreground/60 mb-1">Forks</p>
                    <p className="font-semibold text-accent-kente">{thesis.forks}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-foreground/60 mb-1">Citations</p>
                    <p className="font-semibold text-accent-deep">{thesis.citations}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
