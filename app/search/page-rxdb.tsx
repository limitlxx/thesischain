"use client"

/**
 * Search Page using RxDB
 * Shows ALL theses from all users (public data)
 */

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ThesisSearchCard } from "@/components/search/thesis-search-card"
import { ThesisSearchCardSkeleton } from "@/components/search/thesis-search-card-skeleton"
import { SearchFilters } from "@/components/search/search-filters"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useAllTheses, useSearchTheses } from "@/lib/db/hooks"
import { useWalletAddress } from "@/lib/wallet"

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
  isOwner?: boolean
}

export default function SearchPageRxDB() {
  const [searchQuery, setSearchQuery] = useState("")
  const walletAddress = useWalletAddress()
  const [filters, setFilters] = useState({
    university: "",
    department: "",
    year: "",
    sortBy: "relevant",
  })
  const [hasMore, setHasMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Get all theses from RxDB (reactive query - auto-updates!)
  const { theses: allThesesRaw, isLoading } = useAllTheses(100)
  
  // Search query (only when user types)
  const { results: searchResults, isLoading: isSearching } = useSearchTheses(
    searchQuery.length >= 2 ? searchQuery : ""
  )

  // Convert RxDB theses to display format
  const convertToThesis = (thesis: any): Thesis => ({
    id: thesis.tokenId,
    title: thesis.name,
    author: thesis.owner,
    university: thesis.university || "Unknown University",
    department: thesis.department || "Unknown Department",
    year: thesis.year || new Date().getFullYear(),
    citations: 0, // TODO: Calculate from blockchain
    earnings: 0, // TODO: Calculate from activities
    thumbnail: thesis.imageUrl || "/placeholder.svg",
    universityLogo: "/placeholder-logo.svg",
    forks: thesis.forks || 0,
    isOwner: walletAddress ? thesis.owner.toLowerCase() === walletAddress.toLowerCase() : false
  })

  // Use search results if searching, otherwise use all theses
  const displayTheses = searchQuery.length >= 2 
    ? searchResults.map(convertToThesis)
    : allThesesRaw.map(convertToThesis)

  // Apply filters
  const filteredTheses = displayTheses.filter((thesis) => {
    const matchesUniversity = !filters.university || thesis.university === filters.university
    const matchesDepartment = !filters.department || thesis.department === filters.department
    const matchesYear = !filters.year || thesis.year.toString() === filters.year

    return matchesUniversity && matchesDepartment && matchesYear
  })

  // Sort results
  const sortedTheses = [...filteredTheses].sort((a, b) => {
    switch (filters.sortBy) {
      case "cited":
        return b.citations - a.citations
      case "earnings":
        return b.earnings - a.earnings
      case "recent":
        return b.year - a.year
      case "forks":
        return b.forks - a.forks
      default:
        return 0
    }
  })

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
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

  const showLoading = isLoading || (searchQuery.length >= 2 && isSearching)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
            Discover African Theses
          </h1>
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
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="text-xs text-muted-foreground mt-1">
                Type at least 2 characters to search
              </p>
            )}
          </div>

          {/* Database Info */}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {sortedTheses.length} of {allThesesRaw.length} theses from RxDB
              {walletAddress && " • Your theses are highlighted"}
            </p>
          )}
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
            {!showLoading && sortedTheses.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-foreground/60">
                    {searchQuery.length >= 2 ? (
                      <>Search results: {sortedTheses.length} theses</>
                    ) : (
                      <>Showing {sortedTheses.length} theses</>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedTheses.map((thesis) => (
                    <div key={thesis.id} className="relative">
                      {thesis.isOwner && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Your Thesis
                          </span>
                        </div>
                      )}
                      <ThesisSearchCard thesis={thesis} />
                    </div>
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
            ) : showLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ThesisSearchCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-foreground/60 mb-2">
                  {searchQuery.length >= 2 ? "No theses found" : "No theses available yet"}
                </p>
                <p className="text-sm text-foreground/40">
                  {searchQuery.length >= 2 
                    ? "Try adjusting your search or filters"
                    : "Be the first to mint a thesis!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
