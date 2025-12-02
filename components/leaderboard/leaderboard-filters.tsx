"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface LeaderboardFiltersProps {
  filterCountry: string
  setFilterCountry: (country: string) => void
  filterUniversity: string
  setFilterUniversity: (university: string) => void
}

const COUNTRIES = [
  "Ghana",
  "Nigeria",
  "Kenya",
  "Sudan",
  "South Africa",
  "Uganda",
  "Ethiopia",
  "Tanzania",
  "Zambia",
  "Zimbabwe",
]

const UNIVERSITIES = [
  "University of Ghana",
  "University of Lagos",
  "University of Nairobi",
  "University of Khartoum",
  "University of South Africa",
  "Covenant University",
  "Kwame Nkrumah University",
  "University of Nigeria",
  "University of Witwatersrand",
  "University of Zambia",
]

export function LeaderboardFilters({
  filterCountry,
  setFilterCountry,
  filterUniversity,
  setFilterUniversity,
}: LeaderboardFiltersProps) {
  const handleReset = () => {
    setFilterCountry("")
    setFilterUniversity("")
  }

  return (
    <div className="space-y-4">
      {/* Country Filter */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Country</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          <button
            onClick={() => setFilterCountry("")}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
              !filterCountry ? "bg-accent-deep/20 text-foreground font-medium" : "text-foreground/60 hover:bg-muted"
            }`}
          >
            All Countries
          </button>
          {COUNTRIES.map((country) => (
            <button
              key={country}
              onClick={() => setFilterCountry(filterCountry === country ? "" : country)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                filterCountry === country
                  ? "bg-accent-deep/20 text-foreground font-medium"
                  : "text-foreground/60 hover:bg-muted"
              }`}
            >
              {country}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* University Filter */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">University</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          <button
            onClick={() => setFilterUniversity("")}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
              !filterUniversity ? "bg-accent-deep/20 text-foreground font-medium" : "text-foreground/60 hover:bg-muted"
            }`}
          >
            All Universities
          </button>
          {UNIVERSITIES.map((uni) => (
            <button
              key={uni}
              onClick={() => setFilterUniversity(filterUniversity === uni ? "" : uni)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm truncate ${
                filterUniversity === uni
                  ? "bg-accent-deep/20 text-foreground font-medium"
                  : "text-foreground/60 hover:bg-muted"
              }`}
            >
              {uni}
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
