"use client"

import { useState } from "react"
import { useAuth } from "@campnetwork/origin/react"
import { 
  CONTRACT_ADDRESSES, 
  THESIS_REGISTRY_ABI, 
  FORK_TRACKER_ABI,
  ROYALTY_SPLITTER_ABI 
} from "./contracts"
import { toast } from "sonner"
import { createPublicClient, createWalletClient, custom, http } from "viem"
import { BASECAMP_TESTNET } from "./contracts"

/**
 * Hook for minting thesis on ThesisRegistry contract
 */
export function useMintThesisContract() {
  const auth = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [hash, setHash] = useState<string | null>(null)

  const mintThesis = async (uri: string, royaltyBps: number) => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK")
    }

    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet provider found")
    }

    setIsPending(true)
    try {
      // Create wallet client from window.ethereum
      const walletClient = createWalletClient({
        chain: BASECAMP_TESTNET,
        transport: custom(window.ethereum)
      })

      const [account] = await walletClient.getAddresses()
      if (!account) {
        throw new Error("No account connected")
      }

      // Call the contract using viem
      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.ThesisRegistry as `0x${string}`,
        abi: THESIS_REGISTRY_ABI,
        functionName: "mintThesis",
        args: [uri, BigInt(royaltyBps)],
        account
      })

      setHash(txHash)
      toast.success("Transaction submitted", {
        description: "Waiting for confirmation..."
      })

      // Wait for transaction receipt
      const publicClient = createPublicClient({
        chain: BASECAMP_TESTNET,
        transport: http()
      })
      
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      
      toast.success("Transaction confirmed!")
      return txHash
    } catch (error) {
      console.error("Error minting thesis:", error)
      toast.error("Failed to mint thesis", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    mintThesis,
    isPending,
    hash
  }
}

/**
 * Hook for forking thesis on ForkTracker contract
 */
export function useForkThesisContract() {
  const auth = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [hash, setHash] = useState<string | null>(null)

  const forkThesis = async (parentId: bigint, newUri: string) => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK")
    }

    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet provider found")
    }

    setIsPending(true)
    try {
      const walletClient = createWalletClient({
        chain: BASECAMP_TESTNET,
        transport: custom(window.ethereum)
      })

      const [account] = await walletClient.getAddresses()
      if (!account) {
        throw new Error("No account connected")
      }

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.ForkTracker as `0x${string}`,
        abi: FORK_TRACKER_ABI,
        functionName: "forkThesis",
        args: [parentId, newUri],
        account
      })

      setHash(txHash)
      toast.success("Fork transaction submitted", {
        description: "Waiting for confirmation..."
      })

      const publicClient = createPublicClient({
        chain: BASECAMP_TESTNET,
        transport: http()
      })
      
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      
      toast.success("Fork confirmed!")
      return txHash
    } catch (error) {
      console.error("Error forking thesis:", error)
      toast.error("Failed to fork thesis", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    forkThesis,
    isPending,
    hash
  }
}

/**
 * Hook for reading thesis data from ThesisRegistry
 */
export function useGetThesisContract(tokenId: bigint) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const publicClient = createPublicClient({
        chain: BASECAMP_TESTNET,
        transport: http()
      })

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ThesisRegistry as `0x${string}`,
        abi: THESIS_REGISTRY_ABI,
        functionName: "getThesis",
        args: [tokenId]
      })

      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    thesis: data,
    isLoading,
    error,
    refetch
  }
}

/**
 * Hook for reading fork tree from ForkTracker
 */
export function useGetForkTree(tokenId: bigint) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const publicClient = createPublicClient({
        chain: BASECAMP_TESTNET,
        transport: http()
      })

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ForkTracker as `0x${string}`,
        abi: FORK_TRACKER_ABI,
        functionName: "getForkTree",
        args: [tokenId]
      })

      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    forkTree: data,
    isLoading,
    error,
    refetch
  }
}

/**
 * Hook for reading royalty shares from RoyaltySplitter
 */
export function useGetRoyaltyShares(tokenId: bigint) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const publicClient = createPublicClient({
        chain: BASECAMP_TESTNET,
        transport: http()
      })

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.RoyaltySplitter as `0x${string}`,
        abi: ROYALTY_SPLITTER_ABI,
        functionName: "getRoyaltyShares",
        args: [tokenId]
      })

      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    royaltyShares: data,
    isLoading,
    error,
    refetch
  }
}

/**
 * Hook for claiming royalties from RoyaltySplitter
 */
export function useClaimRoyaltiesContract() {
  const auth = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [hash, setHash] = useState<string | null>(null)

  const claimRoyalties = async () => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK")
    }

    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet provider found")
    }

    setIsPending(true)
    try {
      const walletClient = createWalletClient({
        chain: BASECAMP_TESTNET,
        transport: custom(window.ethereum)
      })

      const [account] = await walletClient.getAddresses()
      if (!account) {
        throw new Error("No account connected")
      }

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.RoyaltySplitter as `0x${string}`,
        abi: ROYALTY_SPLITTER_ABI,
        functionName: "claimRoyalties",
        account
      })

      setHash(txHash)
      toast.success("Claim transaction submitted", {
        description: "Waiting for confirmation..."
      })

      const publicClient = createPublicClient({
        chain: BASECAMP_TESTNET,
        transport: http()
      })
      
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      
      toast.success("Royalties claimed!")
      return txHash
    } catch (error) {
      console.error("Error claiming royalties:", error)
      toast.error("Failed to claim royalties", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    claimRoyalties,
    isPending,
    hash
  }
}
