/**
 * IPNFT Operations using MongoDB
 * Server-side database operations for tracking IPNFTs
 */

import type { IPNFTMetadata } from '../ipnft-tracker'

/**
 * Track a newly minted IPNFT in MongoDB
 */
export async function trackMintedIPNFT(
  tokenId: string,
  owner: string,
  metadata: IPNFTMetadata,
  royaltyBps: number,
  fileInfo?: { name: string; type: string; size: number }
): Promise<void> {
  // Extract metadata
  const university = metadata.attributes.find(a => a.trait_type === 'University')?.value || 'Unknown'
  const department = metadata.attributes.find(a => a.trait_type === 'Department')?.value || ''
  const year = parseInt(String(metadata.attributes.find(a => a.trait_type === 'Year')?.value || new Date().getFullYear()))
  const author = metadata.attributes.find(a => a.trait_type === 'Author')?.value || ''
  
  const mintedAt = Date.now()
  const mintedTimestamp = new Date(mintedAt).toISOString()

  try {
    // Insert thesis via API
    const thesisResponse = await fetch('/api/theses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenId,
        owner: owner.toLowerCase(),
        author: String(author),
        authorWallet: owner.toLowerCase(),
        name: metadata.name,
        description: metadata.description,
        university: String(university),
        department: String(department),
        year,
        royaltyBps,
        imageUrl: metadata.image || '',
        ipfsHash: metadata.image?.replace('ipfs://', '') || '',
        fileName: fileInfo?.name || '',
        fileType: fileInfo?.type || '',
        fileSize: fileInfo?.size || 0,
        forks: 0,
        parentTokenId: '',
        mintedAt,
        mintedTimestamp,
        updatedAt: Date.now(),
        isDeleted: false
      })
    })

    if (!thesisResponse.ok) {
      throw new Error('Failed to insert thesis')
    }

    // Add activity via API
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `mint-${tokenId}-${Date.now()}`,
        type: 'minted',
        userAddress: owner.toLowerCase(),
        tokenId,
        thesisName: metadata.name,
        amount: '0',
        timestamp: Date.now(),
        transactionHash: ''
      })
    })

    // Update user profile
    await updateUserProfile(owner)

    // Sync to leaderboard
    await syncUserToLeaderboard(owner)

    console.log(`✓ Tracked IPNFT ${tokenId} in MongoDB`)
  } catch (error) {
    console.error('Failed to track IPNFT in MongoDB:', error)
    throw error
  }
}

/**
 * Update user profile stats
 */
async function updateUserProfile(address: string): Promise<void> {
  const lowerAddress = address.toLowerCase()

  // Get user's theses via API
  const thesesResponse = await fetch(`/api/theses?owner=${lowerAddress}`)
  const userTheses = await thesesResponse.json()

  const totalIPNFTs = userTheses.length
  const totalForks = userTheses.reduce((sum: number, thesis: any) => sum + (thesis.forks || 0), 0)

  // Update profile via API
  await fetch('/api/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: lowerAddress,
      updates: {
        totalIPNFTs,
        totalForks,
        university: userTheses[0]?.university || ''
      }
    })
  })
}

/**
 * Record a fork event
 */
export async function trackForkEvent(
  parentTokenId: string,
  childTokenId: string,
  forkerAddress: string
): Promise<void> {
  try {
    // Increment parent's fork count via API
    await fetch('/api/theses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenId: parentTokenId,
        updates: {
          $inc: { forks: 1 }
        }
      })
    })

    // Get child thesis
    const childResponse = await fetch(`/api/theses?tokenId=${childTokenId}`)
    const child = await childResponse.json()

    if (child) {
      // Add activity for forker
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `fork-${childTokenId}-${Date.now()}`,
          type: 'forked',
          userAddress: forkerAddress.toLowerCase(),
          tokenId: childTokenId,
          thesisName: child.name,
          amount: '0',
          timestamp: Date.now(),
          transactionHash: ''
        })
      })
    }

    // Get parent thesis to update owner
    const parentResponse = await fetch(`/api/theses?tokenId=${parentTokenId}`)
    const parent = await parentResponse.json()

    // Update profiles and leaderboard
    await updateUserProfile(forkerAddress)
    await syncUserToLeaderboard(forkerAddress)

    if (parent) {
      await updateUserProfile(parent.owner)
      await syncUserToLeaderboard(parent.owner)
    }

    console.log(`✓ Tracked fork event: ${parentTokenId} -> ${childTokenId}`)
  } catch (error) {
    console.error('Failed to track fork event:', error)
    throw error
  }
}

/**
 * Record earnings event
 */
export async function trackEarningsEvent(
  userAddress: string,
  tokenId: string,
  amount: string,
  transactionHash: string
): Promise<void> {
  try {
    // Get thesis
    const thesisResponse = await fetch(`/api/theses?tokenId=${tokenId}`)
    const thesis = await thesisResponse.json()

    // Add activity
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `earn-${tokenId}-${Date.now()}`,
        type: 'earned',
        userAddress: userAddress.toLowerCase(),
        tokenId,
        thesisName: thesis?.name || 'Unknown',
        amount,
        timestamp: Date.now(),
        transactionHash
      })
    })

    // Get current profile
    const profileResponse = await fetch(`/api/profiles?address=${userAddress.toLowerCase()}`)
    const profile = await profileResponse.json()

    if (profile) {
      const currentEarnings = profile.totalEarnings || 0
      const newEarnings = currentEarnings + parseFloat(amount)
      
      // Update profile earnings
      await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: userAddress.toLowerCase(),
          updates: {
            totalEarnings: newEarnings
          }
        })
      })
    }

    // Sync to leaderboard
    await syncUserToLeaderboard(userAddress)

    console.log(`✓ Tracked earnings: ${amount} for ${userAddress}`)
  } catch (error) {
    console.error('Failed to track earnings:', error)
    throw error
  }
}

/**
 * Update user's social links
 */
export async function updateUserSocials(
  address: string,
  socials: {
    twitter?: string
    spotify?: string
    tiktok?: string
  }
): Promise<void> {
  const lowerAddress = address.toLowerCase()

  await fetch('/api/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: lowerAddress,
      updates: { socials }
    })
  })

  console.log(`✓ Updated socials for ${address}`)
}

/**
 * Export all data as JSON (for backup)
 */
export async function exportAllData(): Promise<string> {
  const [thesesResponse, profilesResponse, activitiesResponse] = await Promise.all([
    fetch('/api/theses'),
    fetch('/api/profiles'),
    fetch('/api/activities')
  ])

  const [theses, profiles, activities] = await Promise.all([
    thesesResponse.json(),
    profilesResponse.json(),
    activitiesResponse.json()
  ])

  const data = {
    theses,
    profiles,
    activities,
    exportedAt: new Date().toISOString()
  }

  return JSON.stringify(data, null, 2)
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const [thesesResponse, profilesResponse, activitiesResponse] = await Promise.all([
    fetch('/api/theses'),
    fetch('/api/profiles'),
    fetch('/api/activities')
  ])

  const [theses, profiles, activities] = await Promise.all([
    thesesResponse.json(),
    profilesResponse.json(),
    activitiesResponse.json()
  ])

  return {
    theses: theses.length,
    profiles: profiles.length,
    activities: activities.length
  }
}

/**
 * Sync user to leaderboard
 */
async function syncUserToLeaderboard(address: string): Promise<void> {
  const lowerAddress = address.toLowerCase()

  // Get user's theses via API
  const thesesResponse = await fetch(`/api/theses?owner=${lowerAddress}`)
  const userTheses = await thesesResponse.json()

  // Calculate stats
  const totalIPNFTs = userTheses.length
  const totalForks = userTheses.reduce((sum: number, thesis: any) => sum + (thesis.forks || 0), 0)
  
  // Get user profile
  const profileResponse = await fetch(`/api/profiles?address=${lowerAddress}`)
  const profile = await profileResponse.json()
  const totalEarnings = profile?.totalEarnings || 0

  // Update leaderboard via API
  await fetch('/api/leaderboard', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: lowerAddress,
      updates: {
        displayName: profile?.displayName || address.slice(0, 6) + '...' + address.slice(-4),
        university: profile?.university || userTheses[0]?.university || 'Unknown',
        totalEarnings,
        totalIPNFTs,
        totalForks,
        lastUpdated: Date.now()
      }
    })
  })

  console.log(`✓ Synced user ${address} to leaderboard`)
}
