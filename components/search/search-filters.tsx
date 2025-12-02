"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SearchFiltersProps {
  filters: {
    university: string
    department: string
    year: string
    sortBy: string
  }
  setFilters: (filters: any) => void
}

const UNIVERSITIES = [
  "University of Ghana",
  "University of Lagos",
  "University of Nairobi",
  "Covenant University",
  "Kwame Nkrumah University",
  "University of Khartoum",
]

const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Environmental Science",
  "Agriculture",
  "Medicine",
  "Business",
  "Arts & Humanities",
]

const YEARS = ["2024", "2023", "2022", "2021", "2020"]

const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "cited", label: "Most Cited" },
  { value: "earnings", label: "Highest Earnings" },
  { value: "recent", label: "Most Recent" },
]

export function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const handleReset = () => {
    setFilters({
      university: "",
      department: "",
      year: "",
      sortBy: "relevant",
    })
  }

  return (
    <div className="space-y-4">
      {/* Sort */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilters({ ...filters, sortBy: option.value })}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                filters.sortBy === option.value
                  ? "bg-accent-deep/20 text-foreground font-medium"
                  : "text-foreground/60 hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* University */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">University</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {UNIVERSITIES.map((uni) => (
            <button
              key={uni}
              onClick={() => setFilters({ ...filters, university: filters.university === uni ? "" : uni })}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm truncate ${
                filters.university === uni
                  ? "bg-accent-deep/20 text-foreground font-medium"
                  : "text-foreground/60 hover:bg-muted"
              }`}
            >
              {uni}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Department */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setFilters({ ...filters, department: filters.department === dept ? "" : dept })}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                filters.department === dept
                  ? "bg-accent-deep/20 text-foreground font-medium"
                  : "text-foreground/60 hover:bg-muted"
              }`}
            >
              {dept}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Year */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Year</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setFilters({ ...filters, year: filters.year === year ? "" : year })}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                filters.year === year
                  ? "bg-accent-deep/20 text-foreground font-medium"
                  : "text-foreground/60 hover:bg-muted"
              }`}
            >
              {year}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button onClick={handleReset} variant="outline" size="sm" className="w-full bg-transparent">
        Reset Filters
      </Button>
    </div>
  )
}
