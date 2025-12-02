"use client"

import { useAuth } from "@campnetwork/origin/react"
import { useState, useEffect } from "react"

export interface OriginIPNFT {
  tokenId: string
  name: string
  description: string
  image?: string
  owner: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  terms: {
    price: bigint
    duration: number
    royaltyBps: number
  }
  createdAt?: number
}

/**
 * Hook to fetch user's owned IPNFTs from Origin SDK
 */
export function useUserIPNFTs(walletAddress?: string) {
  const auth = useAuth()
  const [ipnfts, setIpnfts] = useState<OriginIPNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUserIPNFTs() {
      if (!auth?.origin || !walletAddress) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get user's balance
        const balance = await auth.origin.balanceOf(walletAddress as `0x${string}`)
        
        if (!balance || balance === BigInt(0)) {
          setIpnfts([])
          setIsLoading(false)
          return
        }

        // Note: Origin SDK doesn't have a direct method to get all tokens by owner
        // We'll need to implement this differently or use events
        // For now, we'll return empty and note this limitation
        console.log("User has", balance.toString(), "IPNFTs")
        
        // TODO: Implement proper token enumeration
        // This would require either:
        // 1. Listening to Transfer events
        // 2. Using a subgraph/indexer
        // 3. Maintaining our own database
        
        setIpnfts([])
      } catch (err) {
        console.error("Error fetching user IPNFTs:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch IPNFTs"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserIPNFTs()
  }, [auth, walletAddress])

  return { ipnfts, isLoading, error }
}

/**
 * Hook to fetch a specific IPNFT by token ID
 */
export function useIPNFT(tokenId: bigint | string) {
  const auth = useAuth()
  const [ipnft, setIpnft] = useState<OriginIPNFT | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchIPNFT() {
      if (!auth?.origin) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const tokenIdBigInt = typeof tokenId === 'string' ? BigInt(tokenId) : tokenId

        // Fetch IPNFT data
        const [owner, tokenURI, terms] = await Promise.all([
          auth.origin.ownerOf(tokenIdBigInt),
          auth.origin.tokenURI(tokenIdBigInt),
          auth.origin.getTerms(tokenIdBigInt)
        ])

        // Fetch metadata from tokenURI (IPFS)
        const metadataResponse = await fetch(tokenURI)
        const metadata = await metadataResponse.json()

        setIpnft({
          tokenId: tokenId.toString(),
          name: metadata.name || "Untitled",
          description: metadata.description || "",
          image: metadata.image,
          owner,
          attributes: metadata.attributes || [],
          terms: {
            price: terms.price,
            duration: terms.duration,
            royaltyBps: terms.royaltyBps
          }
        })
      } catch (err) {
        console.error("Error fetching IPNFT:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch IPNFT"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchIPNFT()
  }, [auth, tokenId])

  return { ipnft, isLoading, error }
}

/**
 * Helper to get attribute value from IPNFT
 */
export function getAttributeValue(ipnft: OriginIPNFT, traitType: string): string {
  const attr = ipnft.attributes.find(a => a.trait_type === traitType)
  return attr?.value?.toString() || ""
}

/**
 * Helper to format IPNFT for display
 */
export function formatIPNFTForDisplay(ipnft: OriginIPNFT) {
  return {
    id: ipnft.tokenId,
    title: ipnft.name,
    author: ipnft.owner,
    university: getAttributeValue(ipnft, "University"),
    department: getAttributeValue(ipnft, "Department"),
    year: parseInt(getAttributeValue(ipnft, "Year")) || new Date().getFullYear(),
    thumbnail: ipnft.image || "/placeholder.svg",
    royaltyBps: ipnft.terms.royaltyBps,
    price: ipnft.terms.price,
    duration: ipnft.terms.duration,
    forks: parseInt(getAttributeValue(ipnft, "Forks")) || 0,
    earnings: 0 // Would need to calculate from royalties
  }
}
