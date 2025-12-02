"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { LeaderboardTableSkeleton } from "@/components/leaderboard/leaderboard-table-skeleton"
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters"
import { Trophy, TrendingUp, Medal, Building2, GitFork } from "lucide-react"
import { getAllTrackedIPNFTs, type TrackedIPNFT } from "@/lib/ipnft-tracker"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

import { Navbar } from "@/components/navbar"

export default function LeaderboardPage() {
  const [filterCountry, setFilterCountry] = useState("")
  const [filterUniversity, setFilterUniversity] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [allTheses, setAllTheses] = useState<ThesisRank[]>([])
  const [filteredTheses, setFilteredTheses] = useState<ThesisRank[]>([])
  const [viewMode, setViewMode] = useState<"thesis" | "university">("thesis")
  const [universityRankings, setUniversityRankings] = useState<UniversityRank[]>([])

  // Fetch all theses from localStorage on mount
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true)

        // Get all tracked IPNFTs from localStorage
        const trackedIPNFTs = getAllTrackedIPNFTs()
        
        if (trackedIPNFTs.length === 0) {
          setAllTheses([])
          setFilteredTheses([])
          setIsLoading(false)
          return
        }

        // Convert to ThesisRank format
        const thesesData = trackedIPNFTs.map(convertIPNFTToThesisRank)

        // Sort by earnings (descending) and assign ranks
        thesesData.sort((a, b) => b.earnings - a.earnings)
        thesesData.forEach((thesis, index) => {
          thesis.rank = index + 1
        })

        setAllTheses(thesesData)
        setFilteredTheses(thesesData)

        // Calculate university rankings
        calculateUniversityRankings(thesesData)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Convert TrackedIPNFT to ThesisRank format
  function convertIPNFTToThesisRank(ipnft: TrackedIPNFT): ThesisRank {
    const getAttributeValue = (traitType: string) => {
      const attr = ipnft.metadata.attributes.find(a => a.trait_type === traitType)
      return attr?.value?.toString() || ""
    }

    return {
      rank: 0, // Will be assigned after sorting
      id: ipnft.tokenId,
      title: ipnft.name,
      author: ipnft.owner,
      university: getAttributeValue("University") || "Unknown University",
      country: "Africa", // Default for now
      earnings: 0, // Would need to calculate from royalties
      forks: parseInt(getAttributeValue("Forks")) || 0,
      citations: 0, // Not tracked yet
      year: parseInt(getAttributeValue("Year")) || new Date().getFullYear(),
    }
  }



  // Calculate university rankings from thesis data
  function calculateUniversityRankings(theses: ThesisRank[]) {
    const universityMap = new Map<string, {
      totalEarnings: number
      thesisCount: number
      totalForks: number
      country: string
    }>()

    theses.forEach((thesis) => {
      if (!thesis.university) return

      const existing = universityMap.get(thesis.university) || {
        totalEarnings: 0,
        thesisCount: 0,
        totalForks: 0,
        country: thesis.country,
      }

      universityMap.set(thesis.university, {
        totalEarnings: existing.totalEarnings + thesis.earnings,
        thesisCount: existing.thesisCount + 1,
        totalForks: existing.totalForks + thesis.forks,
        country: thesis.country,
      })
    })

    const rankings: UniversityRank[] = Array.from(universityMap.entries()).map(([university, data]) => ({
      rank: 0,
      university,
      country: data.country,
      totalEarnings: data.totalEarnings,
      thesisCount: data.thesisCount,
      totalForks: data.totalForks,
    }))

    // Sort by total earnings and assign ranks
    rankings.sort((a, b) => b.totalEarnings - a.totalEarnings)
    rankings.forEach((uni, index) => {
      uni.rank = index + 1
    })

    setUniversityRankings(rankings)
  }

  // Filter theses when filters change
  useEffect(() => {
    const filtered = allTheses.filter((thesis) => {
      const countryMatch = !filterCountry || thesis.country === filterCountry
      const universityMatch = !filterUniversity || thesis.university === filterUniversity
      return countryMatch && universityMatch
    })

    setFilteredTheses(filtered)
  }, [filterCountry, filterUniversity, allTheses])

  const handleFilterChange = (country: string, university: string) => {
    setFilterCountry(country)
    setFilterUniversity(university)
  }

  const topUniversity = universityRankings.length > 0 ? universityRankings[0].university : "Loading..."

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-accent-kente" />
            <h1 className="text-4xl font-serif font-bold text-foreground">African Theses Leaderboard</h1>
          </div>
          <p className="text-foreground/60">Top 100 theses ranked by earnings, citations, and community impact</p>
        </div>
      </div>

      {/* Top University Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border-accent-kente/40 bg-gradient-to-r from-accent-kente/10 to-accent-warm/10">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Leading Institution</p>
              <h2 className="text-2xl font-serif font-bold text-foreground">{topUniversity} is currently #1</h2>
            </div>
            <TrendingUp className="h-12 w-12 text-accent-kente opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* View Mode Toggle */}
              <Card className="border-border/40">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">View Mode</p>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "thesis" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("thesis")}
                      className="flex-1"
                    >
                      Theses
                    </Button>
                    <Button
                      variant={viewMode === "university" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("university")}
                      className="flex-1"
                    >
                      Universities
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <LeaderboardFilters
                filterCountry={filterCountry}
                setFilterCountry={(country) => handleFilterChange(country, filterUniversity)}
                filterUniversity={filterUniversity}
                setFilterUniversity={(university) => handleFilterChange(filterCountry, university)}
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <LeaderboardTableSkeleton />
            ) : viewMode === "thesis" ? (
              <LeaderboardTable theses={filteredTheses} />
            ) : (
              <UniversityLeaderboardTable universities={universityRankings} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
