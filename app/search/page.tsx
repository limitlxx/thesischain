"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ThesisSearchCard } from "@/components/search/thesis-search-card"
import { ThesisSearchCardSkeleton } from "@/components/search/thesis-search-card-skeleton"
import { SearchFilters } from "@/components/search/search-filters"
import { Search } from "lucide-react"
import { useAllIPNFTs } from "@/lib/db/hooks"
import type { ThesisDocType } from "@/lib/db/types"
import { Navbar } from "@/components/navbar"

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTheses, setFilteredTheses] = useState<Thesis[]>([])
  const [filters, setFilters] = useState({
    university: "",
    department: "",
    year: "",
    sortBy: "relevant",
  })
  const [hasMore, setHasMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Fetch all IPNFTs from RxDB (global sync - all users' IPNFTs)
  const { ipnfts: allIPNFTs, isLoading } = useAllIPNFTs()

  // Convert ThesisDocType to Thesis format
  function convertIPNFTToThesis(ipnft: ThesisDocType): Thesis {
    return {
      id: ipnft.tokenId,
      title: ipnft.name,
      author: ipnft.author || ipnft.owner,
      university: ipnft.university,
      department: ipnft.department,
      year: ipnft.year,
      citations: 0, // Not tracked yet
      earnings: 0, // Would need to calculate from royalties
      thumbnail: ipnft.imageUrl || "/placeholder.svg",
      universityLogo: "/placeholder-logo.svg",
      forks: ipnft.forks,
    }
  }

  // Convert all IPNFTs to thesis format
  const allTheses = allIPNFTs.map(convertIPNFTToThesis)

  // Filter and sort theses when search query or filters change
  useEffect(() => {
    const results = allTheses.filter((thesis) => {
      const matchesSearch =
        thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.university.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesUniversity = !filters.university || thesis.university === filters.university
      const matchesDepartment = !filters.department || thesis.department === filters.department
      const matchesYear = !filters.year || thesis.year.toString() === filters.year

      return matchesSearch && matchesUniversity && matchesDepartment && matchesYear
    })

    // Sort results
    if (filters.sortBy === "cited") {
      results.sort((a, b) => b.citations - a.citations)
    } else if (filters.sortBy === "earnings") {
      results.sort((a, b) => b.earnings - a.earnings)
    } else if (filters.sortBy === "recent") {
      results.sort((a, b) => b.year - a.year)
    } else if (filters.sortBy === "forks") {
      results.sort((a, b) => b.forks - a.forks)
    }

    setFilteredTheses(results)
  }, [searchQuery, filters, allTheses])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // Simulate loading more items
          setTimeout(() => setHasMore(false), 500)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Discover African Theses</h1>
          <p className="text-foreground/60 mb-6">
            Search and explore peer-reviewed academic research from across Africa
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-foreground/40" />
            <Input
              placeholder="Search by title, author, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {!isLoading && filteredTheses.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-foreground/60">
                    Showing {filteredTheses.length} of {allTheses.length} results
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTheses.map((thesis) => (
                    <ThesisSearchCard key={thesis.id} thesis={thesis} />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                <div ref={observerTarget} className="h-10 mt-8 flex items-center justify-center">
                  {hasMore && (
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <div className="h-1 w-1 rounded-full bg-accent-warm animate-pulse" />
                      Loading more theses...
                    </div>
                  )}
                </div>
              </>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ThesisSearchCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-foreground/60 mb-2">No theses found</p>
                <p className="text-sm text-foreground/40">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
