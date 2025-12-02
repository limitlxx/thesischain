"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { clearAndReload } from "@/lib/db/clear-database"
import { toast } from "sonner"

export function ClearDatabaseButton() {
  const [isClearing, setIsClearing] = useState(false)

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear the local database? This will remove all cached data.')) {
      return
    }

    setIsClearing(true)
    toast.info('Clearing database...')
    
    try {
      await clearAndReload()
    } catch (error) {
      console.error('Failed to clear database:', error)
      toast.error('Failed to clear database')
      setIsClearing(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClear}
      disabled={isClearing}
    >
      {isClearing ? 'Clearing...' : 'Clear Local Database'}
    </Button>
  )
}
