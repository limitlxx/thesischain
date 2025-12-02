"use client"

/**
 * Leaderboard Page using RxDB + Yjs
 * Shows ALL users' rankings (public data) with real-time updates
 */

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { LeaderboardTableSkeleton } from "@/components/leaderboard/leaderboard-table-skeleton"
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters"
import { Trophy, TrendingUp, Medal, Building2, GitFork, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { useLeaderboard, useUserLeaderboardPosition, useAllTheses } from "@/lib/db/hooks"
import { useWalletAddress } from "@/lib/wallet"

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
  isOwner?: boolean
}

interface UniversityRank {
  rank: number
  university: string
  country: string
  totalEarnings: number
  thesisCount: number
  totalForks: number
}

// University Leaderboard Table Component
function UniversityLeaderboardTable({ universities }: { universities: UniversityRank[] }) {
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">University</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Total Earnings</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Theses</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Total Forks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {universities.map((uni) => (
                <tr key={uni.university} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {uni.rank <= 3 && <Medal className={`h-5 w-5 ${getMedalColor(uni.rank)}`} />}
                      <span className={`font-semibold ${uni.rank <= 3 ? "text-accent-kente" : "text-foreground/60"}`}>
                        #{uni.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-accent-deep" />
                      <div>
                        <p className="font-medium text-foreground">{uni.university}</p>
                        <p className="text-xs text-foreground/60">{uni.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="bg-accent-warm/10 text-accent-warm border-accent-warm/20">
                      ${uni.totalEarnings.toFixed(2)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="border-accent-deep/30 text-foreground">
                      {uni.thesisCount}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <GitFork className="h-4 w-4 text-accent-kente" />
                      <span className="text-sm font-medium text-foreground">{uni.totalForks}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-border/40">
          {universities.map((uni) => (
            <div key={uni.university} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  {uni.rank <= 3 && <Medal className={`h-5 w-5 ${getMedalColor(uni.rank)}`} />}
                  <span className={`font-semibold ${uni.rank <= 3 ? "text-accent-kente" : "text-foreground/60"}`}>
                    #{uni.rank}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-accent-deep" />
                    <p className="font-medium text-foreground">{uni.university}</p>
                  </div>
                  <p className="text-xs text-foreground/60">{uni.country}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-foreground/60 mb-1">Earnings</p>
                  <p className="font-semibold text-accent-warm">${uni.totalEarnings.toFixed(0)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-foreground/60 mb-1">Theses</p>
                  <p className="font-semibold text-accent-deep">{uni.thesisCount}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-foreground/60 mb-1">Forks</p>
                  <p className="font-semibold text-accent-kente">{uni.totalForks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LeaderboardPageRxDB() {
  const [filterCountry, setFilterCountry] = useState("")
  const [filterUniversity, setFilterUniversity] = useState("")
  const [viewMode, setViewMode] = useState<"thesis" | "university" | "users">("users")
  
  const walletAddress = useWalletAddress()
  
  // Get live leaderboard from Yjs (real-time updates!)
  const { entries: leaderboardEntries, isLoading: isLoadingLeaderboard } = useLeaderboard()
  
  // Get user's position if logged in
  const { entry: userEntry } = useUserLeaderboardPosition(walletAddress || undefined)
  
  // Get all theses for thesis view
  const { theses: allTheses, isLoading: isLoadingTheses } = useAllTheses(100)

  // Convert leaderboard entries to thesis ranks
  const thesesFromLeaderboard: ThesisRank[] = allTheses.map((thesis, index) => ({
    rank: index + 1,
    id: thesis.tokenId,
    title: thesis.name,
    author: thesis.owner,
    university: thesis.university || "Unknown",
    country: "Africa",
    earnings: 0, // TODO: Calculate from activities
    forks: thesis.forks || 0,
    citations: 0,
    year: thesis.year || new Date().getFullYear(),
    isOwner: walletAddress ? thesis.owner.toLowerCase() === walletAddress.toLowerCase() : false
  }))

  // Calculate university rankings from RxDB data
  const universityRankings: UniversityRank[] = (() => {
    const universityMap = new Map<string, {
      totalEarnings: number
      thesisCount: number
      totalForks: number
    }>()

    allTheses.forEach((thesis) => {
      const uni = thesis.university || "Unknown"
      const existing = universityMap.get(uni) || {
        totalEarnings: 0,
        thesisCount: 0,
        totalForks: 0
      }

      universityMap.set(uni, {
        totalEarnings: existing.totalEarnings,
        thesisCount: existing.thesisCount + 1,
        totalForks: existing.totalForks + (thesis.forks || 0)
      })
    })

    const rankings = Array.from(universityMap.entries()).map(([university, data]) => ({
      rank: 0,
      university,
      country: "Africa",
      ...data
    }))

    rankings.sort((a, b) => b.thesisCount - a.thesisCount)
    rankings.forEach((uni, index) => {
      uni.rank = index + 1
    })

    return rankings
  })()

  const topUniversity = universityRankings.length > 0 ? universityRankings[0].university : "Loading..."
  const isLoading = isLoadingLeaderboard || isLoadingTheses

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-accent-kente" />
            <h1 className="text-4xl font-serif font-bold text-foreground">African Theses Leaderboard</h1>
            <Badge variant="outline" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <p className="text-foreground/60">
            Real-time rankings powered by RxDB + Yjs • Updates automatically across all devices
          </p>
        </div>
      </div>

      {/* User Position Banner (if logged in) */}
      {userEntry && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card className="border-primary/40 bg-gradient-to-r from-primary/10 to-accent-warm/10">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-foreground/60">Your Position</p>
                  <p className="font-semibold text-foreground">
                    Rank #{userEntry.rank} • {userEntry.totalIPNFTs} IPNFTs • {userEntry.totalForks} Forks
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                ${userEntry.totalEarnings.toFixed(2)}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top University Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border-accent-kente/40 bg-gradient-to-r from-accent-kente/10 to-accent-warm/10">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Leading Institution</p>
              <h2 className="text-2xl font-serif font-bold text-foreground">{topUniversity} is currently #1</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {leaderboardEntries.length} researchers • {allTheses.length} theses
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-accent-kente opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* View Mode Toggle */}
              <Card className="border-border/40">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">View Mode</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={viewMode === "users" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("users")}
                      className="w-full justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Researchers
                    </Button>
                    <Button
                      variant={viewMode === "thesis" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("thesis")}
                      className="w-full justify-start"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Theses
                    </Button>
                    <Button
                      variant={viewMode === "university" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("university")}
                      className="w-full justify-start"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Universities
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <LeaderboardFilters
                filterCountry={filterCountry}
                setFilterCountry={setFilterCountry}
                filterUniversity={filterUniversity}
                setFilterUniversity={setFilterUniversity}
              />
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <LeaderboardTableSkeleton />
            ) : viewMode === "users" ? (
              <UserLeaderboardTable 
                entries={leaderboardEntries} 
                currentUserAddress={walletAddress || undefined}
              />
            ) : viewMode === "thesis" ? (
              <LeaderboardTable theses={thesesFromLeaderboard} />
            ) : (
              <UniversityLeaderboardTable universities={universityRankings} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * User Leaderboard Table (from Yjs)
 */
function UserLeaderboardTable({ 
  entries, 
  currentUserAddress 
}: { 
  entries: any[]
  currentUserAddress?: string
}) {
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Researcher</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">University</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">IPNFTs</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Forks</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {entries.map((entry) => {
                const isCurrentUser = currentUserAddress && 
                  entry.address.toLowerCase() === currentUserAddress.toLowerCase()
                
                return (
                  <tr 
                    key={entry.address} 
                    className={`hover:bg-muted/50 transition-colors ${
                      isCurrentUser ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 && <Medal className={`h-5 w-5 ${getMedalColor(entry.rank)}`} />}
                        <span className={`font-semibold ${entry.rank <= 3 ? "text-accent-kente" : "text-foreground/60"}`}>
                          #{entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {entry.displayName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs mt-1">You</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-foreground">{entry.university}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline">{entry.totalIPNFTs}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GitFork className="h-4 w-4 text-accent-kente" />
                        <span className="text-sm font-medium">{entry.totalForks}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-accent-warm/10 text-accent-warm">
                        ${entry.totalEarnings.toFixed(2)}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
