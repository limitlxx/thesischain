"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDatabase } from "@/lib/db/rxdb-setup"
import { ClearDatabaseButton } from "@/components/clear-db-button"

export default function DatabaseTestPage() {
  const [theses, setTheses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTheses()
  }, [])

  async function loadTheses() {
    try {
      setLoading(true)
      const db = await getDatabase()
      
      const allTheses = await db.theses.find().exec()
      const thesesData = allTheses.map(doc => doc.toJSON())
      
      console.log("All theses in database:", thesesData)
      setTheses(thesesData)
      setError(null)
    } catch (err) {
      console.error("Error loading theses:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Database Test - All Theses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={loadTheses}>
              Refresh
            </Button>
            <ClearDatabaseButton />
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          
          <div className="space-y-4">
            <p className="font-semibold">Total theses: {theses.length}</p>
            
            {theses.map((thesis) => (
              <Card key={thesis.tokenId} className="p-4">
                <p className="font-bold">{thesis.name}</p>
                <p className="text-sm text-muted-foreground">Token ID: {thesis.tokenId}</p>
                <p className="text-sm">Owner: {thesis.owner}</p>
                <p className="text-sm">University: {thesis.university}</p>
                <p className="text-sm">Minted: {new Date(thesis.mintedAt).toLocaleString()}</p>
              </Card>
            ))}
            
            {theses.length === 0 && !loading && (
              <p className="text-muted-foreground">No theses found in database</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
