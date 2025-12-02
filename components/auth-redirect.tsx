"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthState } from "@campnetwork/origin/react"

// Global flag to prevent redirect during re-authentication
let isReauthenticating = false

export function setReauthenticating(value: boolean) {
  isReauthenticating = value
}

/**
 * Component that redirects to homepage when user disconnects
 * Place this in the root layout to monitor auth state globally
 */
export function AuthRedirect() {
  const { authenticated } = useAuthState()
  const router = useRouter()
  const pathname = usePathname()
  const wasAuthenticatedRef = useRef(authenticated)
  const disconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Check if user just disconnected (was authenticated, now not)
    if (wasAuthenticatedRef.current && !authenticated) {
      // Clear any existing timeout
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current)
      }
      
      // Wait a moment to see if this is a re-authentication flow
      // If user reconnects within 3 seconds, don't redirect
      disconnectTimeoutRef.current = setTimeout(() => {
        // Check if still disconnected and not re-authenticating
        if (!authenticated && !isReauthenticating) {
          console.log("🔓 User disconnected, redirecting to homepage...")
          
          // Only redirect if not already on homepage or public pages
          const publicPages = ["/", "/search", "/leaderboard", "/auth/signup"]
          const isPublicPage = publicPages.includes(pathname) || pathname.startsWith("/thesis/")
          
          if (!isPublicPage) {
            router.push("/")
          }
        }
      }, 3000) // 3 second grace period
    }
    
    // Update the ref for next render
    wasAuthenticatedRef.current = authenticated
    
    // Cleanup timeout on unmount
    return () => {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current)
      }
    }
  }, [authenticated, router, pathname])

  return null // This component doesn't render anything
}
