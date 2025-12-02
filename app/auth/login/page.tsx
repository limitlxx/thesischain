"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState, useModal, CampModal } from "@campnetwork/origin/react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { authenticated, loading: authLoading } = useAuthState()
  const { openModal } = useModal()

  useEffect(() => {
    if (authenticated && !authLoading) {
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    }
  }, [authenticated, authLoading, router])

  const handleLogin = () => {
    // Open the Camp modal for wallet connection
    openModal()
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="card w-full max-w-md space-y-6 p-8 bg-card rounded-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Connect your wallet to login</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleLogin} 
            className="w-full bg-gradient-to-r from-accent-deep to-accent-warm hover:opacity-90"
            size="lg"
          >
            <Wallet className="mr-2 h-5 w-5" /> Connect Wallet
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-accent-deep hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Camp Modal for wallet connection */}
        <CampModal injectButton={false} />
      </div>
    </div>
  )
}
