"use client"

/**
 * Client-side tracker for minted IPNFTs with full metadata
 * 
 * Stores IPNFT data in localStorage for quick access and offline viewing.
 * 
 * Note: This is a client-side solution. In production, consider:
 * - A backend database (PostgreSQL, MongoDB)
 * - The Graph protocol subgraph
 * - Camp Network's indexer API
 * - IPFS pinning service
 */

export interface IPNFTMetadata {
  name: string
  description: string
  image?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface TrackedIPNFT {
  tokenId: string
  owner: string
  name: string
  description: string
  metadata: IPNFTMetadata
  royaltyBps: number
  mintedAt: number
  fileInfo?: {
    name: string
    type: string
    size: number
  }
}

const STORAGE_KEY = "thesischain_ipnfts"
const MAX_STORED = 1000 // Prevent localStorage from getting too large

/**
 * Track a newly minted IPNFT with full metadata
 */
export function trackMintedIPNFT(
  tokenId: string,
  owner: string,
  metadata: IPNFTMetadata,
  royaltyBps: number,
  fileInfo?: { name: string; type: string; size: number }
) {
  if (typeof window === 'undefined') return

  const tracked: TrackedIPNFT = {
    tokenId,
    owner: owner.toLowerCase(),
    name: metadata.name,
    description: metadata.description,
    metadata,
    royaltyBps,
    mintedAt: Date.now(),
    fileInfo
  }

  const existing = getAllTrackedIPNFTs()
  
  // Check if already tracked (avoid duplicates)
  const isDuplicate = existing.some(ipnft => ipnft.tokenId === tokenId)
  if (isDuplicate) {
    console.log(`IPNFT ${tokenId} already tracked`)
    return
  }

  // Add new IPNFT at the beginning (most recent first)
  const updated = [tracked, ...existing]
  
  // Limit storage size
  const trimmed = updated.slice(0, MAX_STORED)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    console.log(`✓ Tracked IPNFT ${tokenId}:`, tracked)
  } catch (error) {
    console.error('Failed to track IPNFT:', error)
    // If storage is full, try removing oldest entries
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const reduced = updated.slice(0, Math.floor(MAX_STORED / 2))
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced))
        console.log('Reduced storage and tracked IPNFT')
      } catch {
        console.error('Storage quota exceeded, could not track IPNFT')
      }
    }
  }
}

/**
 * Get all tracked IPNFTs
 */
export function getAllTrackedIPNFTs(): TrackedIPNFT[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get IPNFTs owned by a specific address
 */
export function getIPNFTsByOwner(owner: string): TrackedIPNFT[] {
  const all = getAllTrackedIPNFTs()
  return all.filter(ipnft => ipnft.owner.toLowerCase() === owner.toLowerCase())
}

/**
 * Get a specific IPNFT by token ID
 */
export function getIPNFTByTokenId(tokenId: string): TrackedIPNFT | null {
  const all = getAllTrackedIPNFTs()
  return all.find(ipnft => ipnft.tokenId === tokenId) || null
}

/**
 * Get recent IPNFTs (most recent first)
 */
export function getRecentIPNFTs(limit: number = 10): TrackedIPNFT[] {
  const all = getAllTrackedIPNFTs()
  return all.slice(0, limit)
}

/**
 * Search IPNFTs by name or description
 */
export function searchIPNFTs(query: string): TrackedIPNFT[] {
  const all = getAllTrackedIPNFTs()
  const lowerQuery = query.toLowerCase()
  
  return all.filter(ipnft => 
    ipnft.name.toLowerCase().includes(lowerQuery) ||
    ipnft.description.toLowerCase().includes(lowerQuery) ||
    ipnft.metadata.attributes.some(attr => 
      String(attr.value).toLowerCase().includes(lowerQuery)
    )
  )
}

/**
 * Get IPNFTs by university
 */
export function getIPNFTsByUniversity(university: string): TrackedIPNFT[] {
  const all = getAllTrackedIPNFTs()
  
  return all.filter(ipnft => 
    ipnft.metadata.attributes.some(attr => 
      attr.trait_type === 'University' && 
      String(attr.value).toLowerCase().includes(university.toLowerCase())
    )
  )
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const all = getAllTrackedIPNFTs()
  const storageSize = new Blob([JSON.stringify(all)]).size
  
  return {
    count: all.length,
    sizeBytes: storageSize,
    sizeMB: (storageSize / 1024 / 1024).toFixed(2),
    maxCount: MAX_STORED
  }
}

/**
 * Export all tracked IPNFTs as JSON
 */
export function exportIPNFTs(): string {
  const all = getAllTrackedIPNFTs()
  return JSON.stringify(all, null, 2)
}

/**
 * Import IPNFTs from JSON
 */
export function importIPNFTs(jsonData: string): boolean {
  try {
    const imported = JSON.parse(jsonData) as TrackedIPNFT[]
    
    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array')
    }
    
    const existing = getAllTrackedIPNFTs()
    const merged = [...imported, ...existing]
    
    // Remove duplicates by tokenId
    const unique = merged.filter((ipnft, index, self) =>
      index === self.findIndex(t => t.tokenId === ipnft.tokenId)
    )
    
    // Sort by mintedAt (most recent first)
    unique.sort((a, b) => b.mintedAt - a.mintedAt)
    
    // Limit size
    const trimmed = unique.slice(0, MAX_STORED)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    console.log(`Imported ${imported.length} IPNFTs, total: ${trimmed.length}`)
    
    return true
  } catch (error) {
    console.error('Failed to import IPNFTs:', error)
    return false
  }
}

/**
 * Clear all tracked IPNFTs (for testing)
 */
export function clearTrackedIPNFTs() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  console.log('Cleared all tracked IPNFTs')
}
