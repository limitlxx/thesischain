"use client"

/**
 * React hooks for MongoDB database operations via API
 */

import { useState, useEffect } from 'react'
import type { ThesisDocType } from './types'

/**
 * Hook to fetch all IPNFTs from MongoDB
 * This allows all users to see all minted IPNFTs
 */
export function useAllIPNFTs() {
  const [ipnfts, setIpnfts] = useState<ThesisDocType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadIPNFTs() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/theses')
        
        if (!response.ok) {
          throw new Error('Failed to fetch IPNFTs')
        }
        
        const data = await response.json()
        setIpnfts(data)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load IPNFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load IPNFTs')
        setIsLoading(false)
      }
    }

    loadIPNFTs()
  }, [])

  return { ipnfts, isLoading, error }
}

/**
 * Hook to fetch IPNFTs by owner address
 */
export function useUserIPNFTs(ownerAddress: string | null) {
  const [ipnfts, setIpnfts] = useState<ThesisDocType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ownerAddress) {
      setIpnfts([])
      setIsLoading(false)
      return
    }

    async function loadUserIPNFTs() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/theses?owner=${ownerAddress?.toLowerCase()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch user IPNFTs')
        }
        
        const data = await response.json()
        setIpnfts(data)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load user IPNFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user IPNFTs')
        setIsLoading(false)
      }
    }

    loadUserIPNFTs()
  }, [ownerAddress])

  return { ipnfts, isLoading, error }
}

/**
 * Hook to fetch a single IPNFT by token ID
 */
export function useIPNFT(tokenId: string | null) {
  const [ipnft, setIpnft] = useState<ThesisDocType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setIpnft(null)
      setIsLoading(false)
      return
    }

    async function loadIPNFT() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/theses?tokenId=${tokenId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch IPNFT')
        }
        
        const data = await response.json()
        setIpnft(data)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load IPNFT:', err)
        setError(err instanceof Error ? err.message : 'Failed to load IPNFT')
        setIsLoading(false)
      }
    }

    loadIPNFT()
  }, [tokenId])

  return { ipnft, isLoading, error }
}

/**
 * Hook to search IPNFTs
 */
export function useSearchIPNFTs(query: string) {
  const [ipnfts, setIpnfts] = useState<ThesisDocType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setIpnfts([])
      return
    }

    async function searchIPNFTs() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/theses?search=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error('Failed to search IPNFTs')
        }
        
        const data = await response.json()
        setIpnfts(data)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to search IPNFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to search IPNFTs')
        setIsLoading(false)
      }
    }

    searchIPNFTs()
  }, [query])

  return { ipnfts, isLoading, error }
}

/**
 * Hook to get database statistics
 */
export function useDatabaseStats() {
  const [stats, setStats] = useState({
    totalIPNFTs: 0,
    totalUsers: 0,
    totalActivities: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const data = await response.json()
        setStats({
          totalIPNFTs: data.theses,
          totalUsers: data.profiles,
          totalActivities: data.activities
        })
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load stats:', err)
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return { stats, isLoading }
}
