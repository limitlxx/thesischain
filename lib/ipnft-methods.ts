"use client"

/**
 * Comprehensive IPNFT Methods
 * All methods for fetching and interacting with IPNFTs via Origin SDK
 */

import type { Auth } from "@campnetwork/origin"

export interface IPNFTData {
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
  balance?: bigint
  metadata?: any
}

export interface AccessInfo {
  hasAccess: boolean
  expiryTimestamp?: number
  daysRemaining?: number
}

/**
 * Get complete IPNFT information by token ID
 */
export async function getIPNFTById(
  auth: Auth | null,
  tokenId: string
): Promise<IPNFTData | null> {
  if (!auth?.origin) {
    throw new Error("Not authenticated with Origin SDK")
  }

  try {
    const tokenIdBigInt = BigInt(tokenId)

    // Fetch all data in parallel
    const [owner, tokenURI, terms, dataStatus] = await Promise.allSettled([
      auth.origin.ownerOf(tokenIdBigInt),
      auth.origin.tokenURI(tokenIdBigInt),
      auth.origin.getTerms(tokenIdBigInt),
      auth.origin.dataStatus(tokenIdBigInt)
    ])

    const ipnftData: IPNFTData = {
      tokenId,
      owner: owner.status === 'fulfilled' ? owner.value : '',
      tokenURI: tokenURI.status === 'fulfilled' ? tokenURI.value : '',
      terms: terms.status === 'fulfilled' ? terms.value : {
        price: BigInt(0),
        duration: 0,
        royaltyBps: 0,
        paymentToken: ''
      },
      dataStatus: dataStatus.status === 'fulfilled' ? dataStatus.value : null
    }

    // Try to fetch metadata from IPFS
    if (ipnftData.tokenURI && ipnftData.tokenURI.startsWith('ipfs://')) {
      try {
        const ipfsHash = ipnftData.tokenURI.replace('ipfs://', '')
        const metadataUrl = `https://ipfs.io/ipfs/${ipfsHash}`
        
        const response = await fetch(metadataUrl, { 
          signal: AbortSignal.timeout(10000)
        })
        
        if (response.ok) {
          ipnftData.metadata = await response.json()
        }
      } catch (error) {
        console.warn('Failed to fetch IPFS metadata:', error)
      }
    }

    return ipnftData
  } catch (error) {
    console.error('Error fetching IPNFT:', error)
    return null
  }
}

/**
 * Get IPNFT owner address
 */
export async function getIPNFTOwner(
  auth: Auth | null,
  tokenId: string
): Promise<string | null> {
  if (!auth?.origin) return null

  try {
    const owner = await auth.origin.ownerOf(BigInt(tokenId))
    return owner
  } catch (error) {
    console.error('Error fetching owner:', error)
    return null
  }
}

/**
 * Get IPNFT license terms
 */
export async function getIPNFTTerms(
  auth: Auth | null,
  tokenId: string
) {
  if (!auth?.origin) return null

  try {
    const terms = await auth.origin.getTerms(BigInt(tokenId))
    return terms
  } catch (error) {
    console.error('Error fetching terms:', error)
    return null
  }
}

/**
 * Get IPNFT metadata URI
 */
export async function getIPNFTTokenURI(
  auth: Auth | null,
  tokenId: string
): Promise<string | null> {
  if (!auth?.origin) return null

  try {
    const tokenURI = await auth.origin.tokenURI(BigInt(tokenId))
    return tokenURI
  } catch (error) {
    console.error('Error fetching token URI:', error)
    return null
  }
}

/**
 * Get IPNFT data status
 */
export async function getIPNFTDataStatus(
  auth: Auth | null,
  tokenId: string
) {
  if (!auth?.origin) return null

  try {
    const dataStatus = await auth.origin.dataStatus(BigInt(tokenId))
    return dataStatus
  } catch (error) {
    console.error('Error fetching data status:', error)
    return null
  }
}

/**
 * Check if user has access to IPNFT
 */
export async function checkIPNFTAccess(
  auth: Auth | null,
  tokenId: string,
  userAddress: string
): Promise<AccessInfo> {
  if (!auth?.origin) {
    return { hasAccess: false }
  }

  try {
    const hasAccess = await (auth.origin as any).hasAccess?.(
      BigInt(tokenId), 
      userAddress as `0x${string}`
    )

    if (!hasAccess) {
      return { hasAccess: false }
    }

    // Try to get subscription expiry
    try {
      const expiryTimestamp = await (auth.origin as any).subscriptionExpiry?.(
        BigInt(tokenId),
        userAddress as `0x${string}`
      )

      if (expiryTimestamp) {
        const now = Math.floor(Date.now() / 1000)
        const daysRemaining = Math.max(0, Math.floor((Number(expiryTimestamp) - now) / 86400))
        
        return {
          hasAccess: true,
          expiryTimestamp: Number(expiryTimestamp),
          daysRemaining
        }
      }
    } catch (error) {
      console.warn('Could not fetch subscription expiry:', error)
    }

    return { hasAccess: true }
  } catch (error) {
    console.error('Error checking access:', error)
    return { hasAccess: false }
  }
}

/**
 * Buy access to IPNFT
 */
export async function buyIPNFTAccess(
  auth: Auth | null,
  tokenId: string
): Promise<boolean> {
  if (!auth?.origin) {
    throw new Error("Not authenticated")
  }

  try {
    await auth.origin.buyAccessSmart(BigInt(tokenId))
    return true
  } catch (error) {
    console.error('Error buying access:', error)
    throw error
  }
}

/**
 * Get IPNFT data (requires access)
 */
export async function getIPNFTData(
  auth: Auth | null,
  tokenId: string
): Promise<any> {
  if (!auth?.origin) {
    throw new Error("Not authenticated")
  }

  try {
    const data = await auth.origin.getData(BigInt(tokenId))
    return data
  } catch (error) {
    console.error('Error fetching IPNFT data:', error)
    throw error
  }
}

/**
 * Get user's IPNFT balance
 */
export async function getUserIPNFTBalance(
  auth: Auth | null,
  userAddress: string
): Promise<number> {
  if (!auth?.origin) return 0

  try {
    const balance = await auth.origin.balanceOf(userAddress as `0x${string}`)
    return Number(balance)
  } catch (error) {
    console.error('Error fetching balance:', error)
    return 0
  }
}

/**
 * Get royalty information for IPNFT
 * Pass tokenId to get royalties for specific IPNFT, or omit to get all royalties for owner
 */
export async function getIPNFTRoyalties(
  auth: Auth | null,
  tokenId?: string,
  ownerAddress?: string
) {
  if (!auth?.origin) return null

  try {
    // Call with appropriate parameters based on what's provided
    if (tokenId && ownerAddress) {
      const royalties = await (auth.origin as any).getRoyalties(
        BigInt(tokenId),
        ownerAddress as `0x${string}`
      )
      return royalties
    } else if (tokenId) {
      const royalties = await (auth.origin as any).getRoyalties(BigInt(tokenId))
      return royalties
    } else if (ownerAddress) {
      const royalties = await (auth.origin as any).getRoyalties(
        undefined,
        ownerAddress as `0x${string}`
      )
      return royalties
    } else {
      const royalties = await (auth.origin as any).getRoyalties()
      return royalties
    }
  } catch (error) {
    console.error('Error fetching royalties:', error)
    return null
  }
}

/**
 * Claim royalties for IPNFT
 * Pass tokenId to claim for specific IPNFT, or omit to claim all royalties for owner
 */
export async function claimIPNFTRoyalties(
  auth: Auth | null,
  tokenId?: string,
  ownerAddress?: string
): Promise<boolean> {
  if (!auth?.origin) {
    throw new Error("Not authenticated")
  }

  try {
    // Call with appropriate parameters based on what's provided
    if (tokenId && ownerAddress) {
      await (auth.origin as any).claimRoyalties(
        BigInt(tokenId),
        ownerAddress as `0x${string}`
      )
    } else if (tokenId) {
      await (auth.origin as any).claimRoyalties(BigInt(tokenId))
    } else if (ownerAddress) {
      await (auth.origin as any).claimRoyalties(
        undefined,
        ownerAddress as `0x${string}`
      )
    } else {
      await (auth.origin as any).claimRoyalties()
    }
    return true
  } catch (error) {
    console.error('Error claiming royalties:', error)
    throw error
  }
}

/**
 * Transfer IPNFT to another address
 */
export async function transferIPNFT(
  auth: Auth | null,
  from: string,
  to: string,
  tokenId: string
): Promise<boolean> {
  if (!auth?.origin) {
    throw new Error("Not authenticated")
  }

  try {
    await auth.origin.transferFrom(
      from as `0x${string}`,
      to as `0x${string}`,
      BigInt(tokenId)
    )
    return true
  } catch (error) {
    console.error('Error transferring IPNFT:', error)
    throw error
  }
}

/**
 * Approve operator for IPNFT
 */
export async function approveIPNFTOperator(
  auth: Auth | null,
  operator: string,
  approved: boolean
): Promise<boolean> {
  if (!auth?.origin) {
    throw new Error("Not authenticated")
  }

  try {
    await auth.origin.setApprovalForAll(
      operator as `0x${string}`,
      approved
    )
    return true
  } catch (error) {
    console.error('Error setting approval:', error)
    throw error
  }
}

/**
 * Check if operator is approved
 */
export async function isIPNFTOperatorApproved(
  auth: Auth | null,
  owner: string,
  operator: string
): Promise<boolean> {
  if (!auth?.origin) return false

  try {
    const isApproved = await auth.origin.isApprovedForAll(
      owner as `0x${string}`,
      operator as `0x${string}`
    )
    return isApproved
  } catch (error) {
    console.error('Error checking approval:', error)
    return false
  }
}
