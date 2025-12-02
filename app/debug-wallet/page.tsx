"use client"

import { useAuth } from "@campnetwork/origin/react"
import { useWalletAddress } from "@/lib/wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getIPNFTsByOwner, getAllTrackedIPNFTs } from "@/lib/ipnft-tracker"

/**
 * Debug page to test wallet connection and IPNFT tracking
 */
export default function DebugWalletPage() {
  const auth = useAuth()
  const walletAddress = useWalletAddress()
  const [jwtPayload, setJwtPayload] = useState<any>(null)
  const [ipnfts, setIpnfts] = useState<any[]>([])
  const [allIpnfts, setAllIpnfts] = useState<any[]>([])

  useEffect(() => {
    // Try to decode JWT
    if (auth?.origin) {
      try {
        const jwt = auth.origin.getJwt()
        if (jwt) {
          const payload = JSON.parse(atob(jwt.split('.')[1]))
          setJwtPayload(payload)
        }
      } catch (error) {
        console.error("Error decoding JWT:", error)
      }
    }

    // Get IPNFTs
    if (walletAddress) {
      const userIpnfts = getIPNFTsByOwner(walletAddress)
      setIpnfts(userIpnfts)
    }

    // Get all IPNFTs
    const all = getAllTrackedIPNFTs()
    setAllIpnfts(all)
  }, [auth, walletAddress])

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Wallet Connection Debug</h1>

      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Auth Object:</span>
            <span className={auth ? "text-green-600" : "text-red-600"}>
              {auth ? "✓ Available" : "✗ Not Available"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Origin SDK:</span>
            <span className={auth?.origin ? "text-green-600" : "text-red-600"}>
              {auth?.origin ? "✓ Available" : "✗ Not Available"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">JWT Token:</span>
            <span className={auth?.origin?.getJwt() ? "text-green-600" : "text-red-600"}>
              {auth?.origin?.getJwt() ? "✓ Present" : "✗ Missing"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Address */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Detected Address:</span>
            <span className={walletAddress ? "text-green-600 font-mono" : "text-red-600"}>
              {walletAddress || "Not detected"}
            </span>
          </div>
          {!walletAddress && (
            <div className="text-sm text-muted-foreground">
              Check browser console for detailed logs
            </div>
          )}
        </CardContent>
      </Card>

      {/* JWT Payload */}
      {jwtPayload && (
        <Card>
          <CardHeader>
            <CardTitle>JWT Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(jwtPayload, null, 2)}
            </pre>
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <span className="font-semibold">Available fields:</span>{" "}
                {Object.keys(jwtPayload).join(", ")}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Address field:</span>{" "}
                <span className="font-mono">
                  {jwtPayload.address || jwtPayload.wallet || jwtPayload.walletAddress || jwtPayload.sub || "Not found"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User's IPNFTs */}
      <Card>
        <CardHeader>
          <CardTitle>Your IPNFTs</CardTitle>
        </CardHeader>
        <CardContent>
          {walletAddress ? (
            <>
              <div className="mb-4">
                <span className="font-semibold">Count:</span> {ipnfts.length}
              </div>
              {ipnfts.length > 0 ? (
                <div className="space-y-2">
                  {ipnfts.map((ipnft) => (
                    <div key={ipnft.tokenId} className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">{ipnft.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Token ID: {ipnft.tokenId}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Owner: {ipnft.owner}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  No IPNFTs found for this address. Try minting one!
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">
              Connect wallet to see your IPNFTs
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Tracked IPNFTs */}
      <Card>
        <CardHeader>
          <CardTitle>All Tracked IPNFTs (localStorage)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="font-semibold">Total Count:</span> {allIpnfts.length}
          </div>
          {allIpnfts.length > 0 ? (
            <div className="space-y-2">
              {allIpnfts.map((ipnft) => (
                <div key={ipnft.tokenId} className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold">{ipnft.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Token ID: {ipnft.tokenId}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Owner: {ipnft.owner}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Minted: {new Date(ipnft.mintedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">
              No IPNFTs tracked yet. Mint one to see it here!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full">
            <a href="/auth/signup">Connect / Reconnect Wallet</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/mint">Mint Test IPNFT</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (confirm("Clear all localStorage data?")) {
                localStorage.clear()
                window.location.reload()
              }
            }}
          >
            Clear localStorage & Reload
          </Button>
        </CardContent>
      </Card>

      {/* Console Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Console Debug Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Run these in browser console (F12):</p>
            <pre className="bg-muted p-3 rounded-lg overflow-auto">
{`// Check localStorage
console.log("IPNFTs:", JSON.parse(localStorage.getItem('thesischain_ipnfts') || '[]'))

// Check all localStorage keys
console.log("All keys:", Object.keys(localStorage))

// Clear specific key
localStorage.removeItem('thesischain_ipnfts')

// Clear all
localStorage.clear()`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
