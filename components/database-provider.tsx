"use client"

/**
 * Database Provider Component
 * Handles MongoDB connection check and auto-migration from localStorage
 */

import { useEffect, useState, createContext, useContext } from 'react'
import { autoMigrate } from '@/lib/db/migration'
import { Loader2 } from 'lucide-react'

interface DatabaseContextType {
  isReady: boolean
  error: Error | null
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  error: null
})

export function useDatabaseContext() {
  return useContext(DatabaseContext)
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        console.log('🚀 Checking database connection...')

        // Test MongoDB connection
        const response = await fetch('/api/theses')
        if (!response.ok) {
          throw new Error('Failed to connect to database')
        }

        // Auto-migrate from localStorage if needed
        await autoMigrate()

        if (mounted) {
          setIsReady(true)
          console.log('✅ Database ready')
        }
      } catch (err) {
        console.error('❌ Database initialization failed:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Database initialization failed'))
          setIsReady(true) // Still set ready to allow app to load
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Connecting to database...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-destructive mb-2">Database Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <DatabaseContext.Provider value={{ isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  )
}
