"use client"

import { useState } from "react"
import { useAuth, useAuthState } from "@campnetwork/origin/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { forceOriginReauth, isJwtLikelyStale } from "@/lib/origin-auth-refresh"
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function RefreshAuthPage() {
  const auth = useAuth()
  const { authenticated } = useAuthState()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<"success" | "error" | null>(null)
  const [jwtInfo, setJwtInfo] = useState<any>(null)

  const checkJwtStatus = () => {
    if (!auth?.origin) return

    const jwt = auth.origin.getJwt()
    if (!jwt) {
      setJwtInfo({ exists: false })
      return
    }

    try {
      const parts = jwt.split('.')
      const payload = JSON.parse(atob(parts[1]))
      const now = Math.floor(Date.now() / 1000)
      const createdAt = payload.createdAt || payload.iat || 0
      const age = now - createdAt

      setJwtInfo({
        exists: true,
        walletAddress: payload.walletAddress || payload.address,
        ageMinutes: Math.floor(age / 60),
        isStale: isJwtLikelyStale(auth),
        createdAt: new Date(createdAt * 1000).toLocaleString()
      })
    } catch (error) {
      setJwtInfo({ exists: true, error: "Failed to parse JWT" })
    }
  }

  const handleRefresh = async () => {
    if (!auth) return

    setIsRefreshing(true)
    setRefreshResult(null)

    try {
      const success = await forceOriginReauth(auth)
      
      if (success) {
        setRefreshResult("success")
        toast.success("Authentication refreshed successfully!")
        setTimeout(() => checkJwtStatus(), 1000)
      } else {
        setRefreshResult("error")
        toast.error("Failed to refresh authentication")
      }
    } catch (error) {
      setRefreshResult("error")
      toast.error("Error during refresh", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Check JWT status on mount
  useState(() => {
    if (authenticated) {
      checkJwtStatus()
    }
  })

  if (!authenticated) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Refresh Authentication</CardTitle>
            <CardDescription>
              You need to connect your wallet first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to use this feature
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Refresh Origin SDK Authentication</CardTitle>
          <CardDescription>
            If you're experiencing authentication errors when minting, use this tool to force a fresh authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current JWT Status */}
          <div className="space-y-2">
            <h3 className="font-semibold">Current Authentication Status</h3>
            {jwtInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {jwtInfo.exists ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>JWT Token: {jwtInfo.exists ? "Present" : "Missing"}</span>
                </div>
                
                {jwtInfo.exists && !jwtInfo.error && (
                  <>
                    <div className="pl-6 space-y-1 text-muted-foreground">
                      <p>Wallet: {jwtInfo.walletAddress}</p>
                      <p>Created: {jwtInfo.createdAt}</p>
                      <p>Age: {jwtInfo.ageMinutes} minutes</p>
                    </div>
                    
                    {jwtInfo.isStale && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Your authentication token is stale (over 1 hour old). This may cause minting errors.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
                
                {jwtInfo.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{jwtInfo.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={checkJwtStatus}>
                Check Status
              </Button>
            )}
          </div>

          {/* Refresh Button */}
          <div className="space-y-2">
            <h3 className="font-semibold">Force Refresh</h3>
            <p className="text-sm text-muted-foreground">
              This will disconnect your wallet, clear all cached tokens, and request a fresh signature.
            </p>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Authentication
                </>
              )}
            </Button>
          </div>

          {/* Result */}
          {refreshResult && (
            <Alert variant={refreshResult === "success" ? "default" : "destructive"}>
              {refreshResult === "success" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Authentication refreshed successfully! You can now try minting again.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to refresh authentication. Try refreshing the page and reconnecting your wallet.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          {/* Instructions */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">When to use this:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>You're getting "Failed to get signature" errors when minting</li>
              <li>Your authentication token is over 1 hour old</li>
              <li>You recently switched wallets or networks</li>
              <li>Minting was working before but suddenly stopped</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
