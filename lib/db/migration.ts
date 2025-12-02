/**
 * Migration utilities to move from localStorage to MongoDB
 */

import { getAllTrackedIPNFTs } from '../ipnft-tracker'
import { updateLeaderboardEntry } from './leaderboard'

/**
 * Migrate IPNFTs from localStorage to MongoDB
 */
export async function migrateIPNFTsToMongoDB(): Promise<{
  migrated: number
  skipped: number
  errors: number
}> {
  console.log('🔄 Starting IPNFT migration from localStorage to MongoDB...')

  const localIPNFTs = getAllTrackedIPNFTs()

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const ipnft of localIPNFTs) {
    try {
      // Check if already exists
      const existingResponse = await fetch(`/api/theses?tokenId=${ipnft.tokenId}`)
      const existing = await existingResponse.json()
      
      if (existing) {
        skipped++
        continue
      }

      // Extract metadata
      const university = ipnft.metadata.attributes.find(a => a.trait_type === 'University')?.value || 'Unknown'
      const department = ipnft.metadata.attributes.find(a => a.trait_type === 'Department')?.value || ''
      const year = parseInt(String(ipnft.metadata.attributes.find(a => a.trait_type === 'Year')?.value || new Date().getFullYear()))
      const forks = parseInt(String(ipnft.metadata.attributes.find(a => a.trait_type === 'Forks')?.value || 0))
      const author = ipnft.metadata.attributes.find(a => a.trait_type === 'Author')?.value || ''

      // Insert into MongoDB via API
      const response = await fetch('/api/theses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: ipnft.tokenId,
          owner: ipnft.owner.toLowerCase(),
          author: String(author),
          authorWallet: ipnft.owner.toLowerCase(),
          name: ipnft.name,
          description: ipnft.description,
          university: String(university),
          department: String(department),
          year,
          royaltyBps: ipnft.royaltyBps,
          imageUrl: ipnft.metadata.image || '',
          ipfsHash: ipnft.metadata.image?.replace('ipfs://', '') || '',
          fileName: ipnft.fileInfo?.name || '',
          fileType: ipnft.fileInfo?.type || '',
          fileSize: ipnft.fileInfo?.size || 0,
          forks,
          parentTokenId: '',
          mintedAt: ipnft.mintedAt,
          mintedTimestamp: new Date(ipnft.mintedAt).toISOString(),
          updatedAt: Date.now(),
          isDeleted: false
        })
      })

      if (response.ok) {
        migrated++
        console.log(`✓ Migrated IPNFT ${ipnft.tokenId}`)
      } else {
        errors++
      }
    } catch (error) {
      console.error(`✗ Failed to migrate IPNFT ${ipnft.tokenId}:`, error)
      errors++
    }
  }

  console.log(`✅ Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`)

  return { migrated, skipped, errors }
}

/**
 * Sync user data to leaderboard
 */
export async function syncUserToLeaderboard(address: string): Promise<void> {
  // Get user's theses via API
  const thesesResponse = await fetch(`/api/theses?owner=${address.toLowerCase()}`)
  const userTheses = await thesesResponse.json()

  // Calculate stats
  const totalIPNFTs = userTheses.length
  const totalForks = userTheses.reduce((sum: number, thesis: any) => sum + (thesis.forks || 0), 0)
  
  // Get user profile
  const profileResponse = await fetch(`/api/profiles?address=${address.toLowerCase()}`)
  const profile = await profileResponse.json()
  const totalEarnings = profile?.totalEarnings || 0

  // Update leaderboard
  await updateLeaderboardEntry({
    address: address.toLowerCase(),
    displayName: profile?.displayName || address.slice(0, 6) + '...' + address.slice(-4),
    university: profile?.university || userTheses[0]?.university || 'Unknown',
    totalEarnings,
    totalIPNFTs,
    totalForks,
    lastUpdated: Date.now()
  })

  console.log(`✓ Synced user ${address} to leaderboard`)
}

/**
 * Rebuild entire leaderboard from MongoDB data
 */
export async function rebuildLeaderboard(): Promise<number> {
  console.log('🔄 Rebuilding leaderboard from MongoDB...')

  // Get all theses via API
  const thesesResponse = await fetch('/api/theses')
  const allTheses = await thesesResponse.json()

  const ownerMap = new Map<string, {
    totalIPNFTs: number
    totalForks: number
    university: string
  }>()

  // Aggregate by owner
  for (const thesis of allTheses) {
    const owner = thesis.owner.toLowerCase()
    const thesisUniversity = thesis.university
    const thesisForks = thesis.forks || 0
    
    const existing = ownerMap.get(owner) || {
      totalIPNFTs: 0,
      totalForks: 0,
      university: thesisUniversity
    }

    ownerMap.set(owner, {
      totalIPNFTs: existing.totalIPNFTs + 1,
      totalForks: existing.totalForks + thesisForks,
      university: existing.university || thesisUniversity
    })
  }

  // Update leaderboard for each user
  let count = 0
  for (const [address, stats] of ownerMap.entries()) {
    const profileResponse = await fetch(`/api/profiles?address=${address}`)
    const profile = await profileResponse.json()

    await updateLeaderboardEntry({
      address,
      displayName: profile?.displayName || address.slice(0, 6) + '...' + address.slice(-4),
      university: stats.university,
      totalEarnings: profile?.totalEarnings || 0,
      totalIPNFTs: stats.totalIPNFTs,
      totalForks: stats.totalForks,
      lastUpdated: Date.now()
    })

    count++
  }

  console.log(`✅ Rebuilt leaderboard with ${count} entries`)

  return count
}

/**
 * Check if migration is needed
 */
export async function needsMigration(): Promise<boolean> {
  const localIPNFTs = getAllTrackedIPNFTs()
  
  const thesesResponse = await fetch('/api/theses')
  const theses = await thesesResponse.json()
  const dbCount = theses.length

  return localIPNFTs.length > 0 && dbCount === 0
}

/**
 * Auto-migrate on first load
 */
export async function autoMigrate(): Promise<void> {
  if (await needsMigration()) {
    console.log('🔄 Auto-migration triggered')
    await migrateIPNFTsToMongoDB()
    await rebuildLeaderboard()
  }
}
