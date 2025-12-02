/**
 * MongoDB-based Leaderboard
 * Replaces Yjs/IndexedDB with server-side MongoDB storage
 */

export interface LeaderboardEntry {
  address: string
  displayName?: string
  university: string
  totalEarnings: number
  totalIPNFTs: number
  totalForks: number
  rank?: number
  lastUpdated: number
}

/**
 * Update user's leaderboard entry
 */
export async function updateLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  try {
    const response = await fetch('/api/leaderboard', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: entry.address,
        updates: {
          displayName: entry.displayName,
          university: entry.university,
          totalEarnings: entry.totalEarnings,
          totalIPNFTs: entry.totalIPNFTs,
          totalForks: entry.totalForks,
          lastUpdated: Date.now()
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update leaderboard entry')
    }

    console.log('📊 Updated leaderboard entry:', entry.address)
  } catch (error) {
    console.error('Failed to update leaderboard:', error)
    throw error
  }
}

/**
 * Get all leaderboard entries sorted by earnings
 */
export async function getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch('/api/leaderboard')
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard')
    }

    const entries: LeaderboardEntry[] = await response.json()
    
    // Add ranks
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return []
  }
}

/**
 * Get user's leaderboard entry
 */
export async function getUserLeaderboardEntry(address: string): Promise<LeaderboardEntry | null> {
  try {
    const response = await fetch(`/api/leaderboard?address=${address}`)
    
    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch user leaderboard entry:', error)
    return null
  }
}

/**
 * Subscribe to leaderboard changes (polling-based)
 */
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  intervalMs: number = 5000
): () => void {
  let isActive = true

  const poll = async () => {
    if (!isActive) return

    const entries = await getLeaderboardEntries()
    callback(entries)

    if (isActive) {
      setTimeout(poll, intervalMs)
    }
  }

  // Initial call
  poll()

  // Return unsubscribe function
  return () => {
    isActive = false
  }
}

/**
 * Subscribe to specific user's entry (polling-based)
 */
export function subscribeToUserEntry(
  address: string,
  callback: (entry: LeaderboardEntry | null) => void,
  intervalMs: number = 5000
): () => void {
  let isActive = true

  const poll = async () => {
    if (!isActive) return

    const entry = await getUserLeaderboardEntry(address)
    callback(entry)

    if (isActive) {
      setTimeout(poll, intervalMs)
    }
  }

  // Initial call
  poll()

  // Return unsubscribe function
  return () => {
    isActive = false
  }
}

/**
 * Clear all leaderboard data (for testing)
 */
export async function clearLeaderboard(): Promise<void> {
  try {
    const response = await fetch('/api/leaderboard', {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to clear leaderboard')
    }

    console.log('🗑️ Leaderboard cleared')
  } catch (error) {
    console.error('Failed to clear leaderboard:', error)
    throw error
  }
}
