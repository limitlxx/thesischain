"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@campnetwork/origin/react"

/**
 * Hook to get the connected wallet address from Origin SDK
 */
export function useWalletAddress() {
  const auth = useAuth()
  const [address, setAddress] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if Origin SDK is available
    if (!auth?.origin) {
      console.log("❌ No auth.origin available")
      setAddress(null)
      setIsChecking(false)
      return
    }

    try {
      // Try to get the JWT which contains wallet info
      const jwt = auth.origin.getJwt()
      
      if (!jwt) {
        console.log("❌ No JWT available")
        setAddress(null)
        setIsChecking(false)
        return
      }

      console.log("✓ JWT exists")
      
      // Parse JWT to extract wallet address
      const parts = jwt.split('.')
      if (parts.length !== 3) {
        console.error("❌ Invalid JWT format")
        setAddress(null)
        setIsChecking(false)
        return
      }

      const payload = JSON.parse(atob(parts[1]))
      console.log("JWT payload keys:", Object.keys(payload))
      
      // Try different possible field names
      const walletAddress = payload.address || payload.wallet || payload.walletAddress || payload.sub
      
      if (walletAddress) {
        console.log("✓ Found wallet address:", walletAddress)
        setAddress(walletAddress)
      } else {
        console.log("❌ No wallet address found in JWT payload:", payload)
        setAddress(null)
      }
    } catch (error) {
      console.error("❌ Error parsing JWT:", error)
      setAddress(null)
    } finally {
      setIsChecking(false)
    }
  }, [auth?.origin])

  // console.log("useWalletAddress state:", { address, isChecking, hasAuth: !!auth, hasOrigin: !!auth?.origin })

  return address
}
