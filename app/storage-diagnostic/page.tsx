"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2 } from "lucide-react"
import { useWalletAddress } from "@/lib/wallet"
import { getIPNFTsByOwner, getAllTrackedIPNFTs } from "@/lib/ipnft-tracker"

export default function StorageDiagnostic() {
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [userIPNFTs, setUserIPNFTs] = useState<any[]>([])
  const [allIPNFTs, setAllIPNFTs] = useState<any[]>([])
  const walletAddress = useWalletAddress()

  const loadData = () => {
    // Get raw localStorage data
    const rawData = localStorage.getItem('thesischain_ipnfts')
    setLocalStorageData(rawData ? JSON.parse(rawData) : null)

    // Get all IPNFTs
    const all = getAllTrackedIPNFTs()
    setAllIPNFTs(all)

    // Get user's IPNFTs
    if (walletAddress) {
      const user = getIPNFTsByOwner(walletAddress)
      setUserIPNFTs(user)
    }
  }

  useEffect(() => {
    loadData()
  }, [walletAddress])

  const clearLocalStorage = () => {
    if (confirm('Clear all localStorage data?')) {
      localStorage.removeItem('thesischain_ipnfts')
      loadData()
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Storage Diagnostic</h1>
        <p className="text-muted-foreground">
          View localStorage data used by the dashboard
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <Button onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="destructive" onClick={clearLocalStorage}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear localStorage
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total IPNFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allIPNFTs.length}</div>
            <p className="text-xs text-muted-foreground">In localStorage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your IPNFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userIPNFTs.length}</div>
            <p className="text-xs text-muted-foreground">
              {walletAddress ? 'For your wallet' : 'Connect wallet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Storage Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localStorageData ? (JSON.stringify(localStorageData).length / 1024).toFixed(2) : 0} KB
            </div>
            <p className="text-xs text-muted-foreground">localStorage</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wallet Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connected Wallet</span>
              <Badge variant="outline" className="font-mono text-xs">
                {walletAddress || 'Not connected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your IPNFTs in localStorage</span>
              <Badge>{userIPNFTs.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All IPNFTs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All IPNFTs in localStorage ({allIPNFTs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allIPNFTs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No IPNFTs in localStorage</p>
              <p className="text-sm mt-2">Mint a thesis to populate localStorage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allIPNFTs.map((ipnft) => (
                <div key={ipnft.tokenId} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{ipnft.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{ipnft.description}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Token: {ipnft.tokenId.slice(0, 10)}...</span>
                        <span>Owner: {ipnft.owner.slice(0, 6)}...{ipnft.owner.slice(-4)}</span>
                        <span>Royalty: {ipnft.royaltyBps / 100}%</span>
                      </div>
                    </div>
                    {walletAddress && ipnft.owner.toLowerCase() === walletAddress.toLowerCase() && (
                      <Badge>Yours</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw localStorage Data</CardTitle>
        </CardHeader>
        <CardContent>
          {localStorageData ? (
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data in localStorage
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
