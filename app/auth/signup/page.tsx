"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLinkSocials, useAuthState, useModal, CampModal } from "@campnetwork/origin/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Music, Wallet } from "lucide-react"
import { XIcon } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { authenticated, loading: authLoading } = useAuthState()
  const { openModal } = useModal()
  const { linkTwitter, linkSpotify } = useLinkSocials()

  const [linking, setLinking] = useState(false)
  const [pendingSocial, setPendingSocial] = useState<"twitter" | "spotify" | null>(null)
  const [hasProcessedAuth, setHasProcessedAuth] = useState(false)

  useEffect(() => {
    // Prevent processing auth multiple times
    if (hasProcessedAuth) return
    
    if (authenticated && !authLoading) {
      setHasProcessedAuth(true)
      
      // If we have a pending social link, execute it
      if (pendingSocial) {
        const executePendingLink = async () => {
          setLinking(true)
          try {
            if (pendingSocial === "twitter") {
              await linkTwitter()
            } else if (pendingSocial === "spotify") {
              await linkSpotify()
            }
            toast.success("Connected! Welcome to ThesisChain Africa 🎉")
            setPendingSocial(null)
            
            // Wait a bit before redirecting
            setTimeout(() => {
              router.push("/dashboard")
            }, 1000)
          } catch (err: any) {
            console.error("Social connection error:", err)
            toast.error(err.message || "Connection failed")
            setPendingSocial(null)
            setHasProcessedAuth(false) // Allow retry
          } finally {
            setLinking(false)
          }
        }
        executePendingLink()
      } else {
        // No pending social, just redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    }
  }, [authenticated, authLoading, hasProcessedAuth, router, pendingSocial, linkTwitter, linkSpotify])

  const handleSocialLink = async (platform: "twitter" | "spotify") => {
    setLinking(true)
    try {
      if (platform === "twitter") {
        await linkTwitter()
      } else if (platform === "spotify") {
        await linkSpotify()
      }

      toast.success("Connected! Welcome to ThesisChain Africa 🎉")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Social connection error:", err)
      toast.error(err.message || "Connection failed")
    } finally {
      setLinking(false)
    }
  }

  const handleSocial = async (platform: "twitter" | "spotify") => {
    // If not authenticated, store the pending social and open modal
    if (!authenticated) {
      setPendingSocial(platform)
      openModal()
    } else {
      // Already authenticated, just link the social
      await handleSocialLink(platform)
    }
  }

  const handleWalletOnly = () => {
    // Open the Camp modal for wallet connection
    openModal()
  }

  if (authLoading || linking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-8 w-8 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {linking ? "Connecting your account..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="card w-full max-w-md space-y-6 p-8 bg-card rounded-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Join ThesisChain Africa</h1>
          <p className="text-muted-foreground mt-2">Connect your wallet to get started</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => handleSocial("twitter")} 
            disabled={linking} 
            className="w-full" 
            variant="outline"
          >
            <XIcon className="mr-2 h-4 w-4" /> Continue with X (Twitter)
          </Button>

          <Button 
            onClick={() => handleSocial("spotify")} 
            disabled={linking} 
            className="w-full" 
            variant="outline"
          >
            <Music className="mr-2 h-4 w-4" /> Continue with Spotify
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            onClick={handleWalletOnly} 
            disabled={linking} 
            className="w-full bg-gradient-to-r from-accent-deep to-accent-warm hover:opacity-90"
          >
            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet Only
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/login" className="text-accent-deep hover:underline">
            Login
          </a>
        </p>

        {/* Camp Modal for wallet connection */}
        <CampModal injectButton={false} />
      </div>
    </div>
  )
}
