"use client"

import { useAuth } from "@campnetwork/origin/react"
import { useState, useCallback } from "react"

/**
 * Complete IPNFT information from Origin SDK
 */
export interface IPNFTInfo {
  tokenId: string
  owner: string
  tokenURI: string
  terms: {
    price: bigint
    duration: number
    royaltyBps: number
    paymentToken: string
  }
  dataStatus: any
  metadata?: any // Parsed from tokenURI if available
}

/**
 * Simple in-memory cache for IPNFT data
 */
const ipnftCache = new Map<string, { data: IPNFTInfo; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Hook to fetch complete IPNFT information by token ID
 */
export function useFetchIPNFT() {
  const auth = useAuth()
  const [cache, setCache] = useState<Map<string, IPNFTInfo>>(new Map())

  const fetchIPNFT = useCallback(async (
    tokenId: string, 
    options?: { skipCache?: boolean }
  ): Promise<IPNFTInfo | null> => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK")
    }

    // Check cache first
    if (!options?.skipCache) {
      const cached = ipnftCache.get(tokenId)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("📦 Using cached IPNFT data:", tokenId)
        return cached.data
      }
    }

    try {
      console.log("🔍 Fetching IPNFT from Origin SDK:", tokenId)

      // Fetch all available information in parallel
      const [owner, tokenURI, terms, dataStatus] = await Promise.allSettled([
        auth.origin.ownerOf(BigInt(tokenId)),
        auth.origin.tokenURI(BigInt(tokenId)),
        auth.origin.getTerms(BigInt(tokenId)),
        auth.origin.dataStatus(BigInt(tokenId))
      ])

      const ipnftInfo: IPNFTInfo = {
        tokenId,
        owner: owner.status === 'fulfilled' ? owner.value : 'unknown',
        tokenURI: tokenURI.status === 'fulfilled' ? tokenURI.value : '',
        terms: terms.status === 'fulfilled' ? terms.value : {
          price: BigInt(0),
          duration: 0,
          royaltyBps: 0,
          paymentToken: ''
        },
        dataStatus: dataStatus.status === 'fulfilled' ? dataStatus.value : null
      }

      // Try to fetch and parse metadata from IPFS
      if (ipnftInfo.tokenURI && ipnftInfo.tokenURI.startsWith('ipfs://')) {
        try {
          const ipfsHash = ipnftInfo.tokenURI.replace('ipfs://', '')
          const metadataUrl = `https://ipfs.io/ipfs/${ipfsHash}`
          
          const response = await fetch(metadataUrl, { 
            signal: AbortSignal.timeout(10000) // 10s timeout
          })
          if (response.ok) {
            ipnftInfo.metadata = await response.json()
            console.log("✓ Fetched metadata from IPFS")
          }
        } catch (metadataError) {
          console.warn("Could not fetch metadata from IPFS:", metadataError)
        }
      }

      // Cache the result
      ipnftCache.set(tokenId, { data: ipnftInfo, timestamp: Date.now() })
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.set(tokenId, ipnftInfo)
        return newCache
      })

      console.log("✅ IPNFT info fetched:", ipnftInfo)
      return ipnftInfo

    } catch (error) {
      console.error("❌ Error fetching IPNFT:", error)
      throw error
    }
  }, [auth])

  const fetchMultipleIPNFTs = useCallback(async (
    tokenIds: string[]
  ): Promise<Map<string, IPNFTInfo | null>> => {
    const results = new Map<string, IPNFTInfo | null>()
    
    // Fetch in parallel with error handling for each
    await Promise.allSettled(
      tokenIds.map(async (tokenId) => {
        try {
          const info = await fetchIPNFT(tokenId)
          results.set(tokenId, info)
        } catch (error) {
          console.error(`Failed to fetch IPNFT ${tokenId}:`, error)
          results.set(tokenId, null)
        }
      })
    )

    return results
  }, [fetchIPNFT])

  const checkAccess = useCallback(async (tokenId: string, userAddress: string): Promise<boolean> => {
    if (!auth?.origin) return false

    try {
      // Check if the user has access to the IPNFT
      // This could be implemented via the Origin SDK or custom logic
      const hasAccess = await (auth.origin as any).hasAccess?.(BigInt(tokenId), userAddress as `0x${string}`)
      return hasAccess ?? false
    } catch (error) {
      console.error("Error checking access:", error)
      return false
    }
  }, [auth])

  const buyAccess = useCallback(async (tokenId: string): Promise<void> => {
    if (!auth?.origin) {
      throw new Error("Not authenticated")
    }

    try {
      // Use buyAccessSmart which handles everything automatically
      await auth.origin.buyAccessSmart(BigInt(tokenId))
      console.log("✅ Access purchased successfully")
    } catch (error) {
      console.error("❌ Error buying access:", error)
      throw error
    }
  }, [auth])

  const clearCache = useCallback(() => {
    ipnftCache.clear()
    setCache(new Map())
  }, [])

  return {
    fetchIPNFT,
    fetchMultipleIPNFTs,
    checkAccess,
    buyAccess,
    clearCache,
    cachedIPNFTs: cache
  }
}

/**
 * Standalone function to fetch IPNFT (without hook)
 */
export async function fetchIPNFTById(
  auth: any,
  tokenId: string
): Promise<IPNFTInfo | null> {
  if (!auth?.origin) {
    throw new Error("Not authenticated with Origin SDK")
  }

  try {
    const [owner, tokenURI, terms] = await Promise.all([
      auth.origin.ownerOf(BigInt(tokenId)),
      auth.origin.tokenURI(BigInt(tokenId)),
      auth.origin.getTerms(BigInt(tokenId))
    ])

    return {
      tokenId,
      owner,
      tokenURI,
      terms,
      dataStatus: null
    }
  } catch (error) {
    console.error("Error fetching IPNFT:", error)
    return null
  }
}

/**
 * Helper functions for formatting IPNFT data
 */
export const formatIPNFTPrice = (price: bigint): string => {
  try {
    const campAmount = Number(price) / 1e18
    return `${campAmount.toFixed(6)} CAMP`
  } catch {
    return price.toString()
  }
}

export const formatIPNFTDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const formatIPNFTRoyalty = (royaltyBps: number): string => {
  return `${(royaltyBps / 100).toFixed(2)}%`
}

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Validate if a string is a valid token ID
 */
export const isValidTokenId = (tokenId: string): boolean => {
  if (!tokenId || tokenId.trim() === '') return false
  
  try {
    const num = BigInt(tokenId)
    return num >= BigInt(0)
  } catch {
    return false
  }
}
