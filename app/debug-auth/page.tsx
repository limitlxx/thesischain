"use client"

import { useAuth, useAuthState } from "@campnetwork/origin/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function DebugAuthPage() {
  const auth = useAuth()
  const { authenticated, loading } = useAuthState()
  const [chainId, setChainId] = useState<string>("")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [jwt, setJwt] = useState<string>("")
  const [jwtPayload, setJwtPayload] = useState<any>(null)

  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const currentChainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
          const decimal = parseInt(currentChainId as string, 16)
          setChainId(`${currentChainId} (${decimal})`)
        } catch (error) {
          console.error("Failed to get chain ID:", error)
        }
      }
    }

    const checkAuth = () => {
      if (auth?.origin) {
        const token = auth.origin.getJwt()
        setJwt(token || "No JWT")
        
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setJwtPayload(payload)
            setWalletAddress(payload.address || "No address in JWT")
          } catch (error) {
            console.error("Failed to parse JWT:", error)
          }
        }
      }
    }

    checkNetwork()
    checkAuth()
  }, [auth, authenticated])

  const handleReconnect = async () => {
    if (auth?.origin) {
      // Force disconnect and reconnect
      window.location.reload()
    }
  }

  const handleSwitchNetwork = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const CAMP_TESTNET_CHAIN_ID = 123420001114
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CAMP_TESTNET_CHAIN_ID.toString(16)}` }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${CAMP_TESTNET_CHAIN_ID.toString(16)}`,
              chainName: 'Camp Network Testnet',
              nativeCurrency: {
                name: 'CAMP',
                symbol: 'CAMP',
                decimals: 18
              },
              rpcUrls: ['https://rpc-campnetwork.xyz'],
              blockExplorerUrls: ['https://camp-network-testnet.blockscout.com']
            }],
          })
        }
      }
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Authentication Debug</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current Origin SDK authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Loading</p>
                <p className="font-mono">{loading ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Authenticated</p>
                <p className="font-mono">{authenticated ? "✅ Yes" : "❌ No"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Has Origin</p>
                <p className="font-mono">{auth?.origin ? "✅ Yes" : "❌ No"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Has JWT</p>
                <p className="font-mono">{jwt && jwt !== "No JWT" ? "✅ Yes" : "❌ No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Information</CardTitle>
            <CardDescription>Current wallet network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Chain ID</p>
              <p className="font-mono">{chainId || "Not detected"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Expected: 0x1cc4d0f5a (123420001114) for Camp Testnet
              </p>
            </div>
            <Button onClick={handleSwitchNetwork} variant="outline">
              Switch to Camp Testnet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
            <CardDescription>Connected wallet details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="font-mono text-xs break-all">{walletAddress || "Not connected"}</p>
            </div>
            {jwtPayload && (
              <div>
                <p className="text-sm text-muted-foreground">JWT Payload</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(jwtPayload, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Troubleshooting actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={handleReconnect} className="w-full">
                Disconnect & Reconnect Wallet
              </Button>
              <p className="text-xs text-muted-foreground">
                This will reload the page and clear your current session
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-semibold">❌ "Failed to get signature" error</p>
              <p className="text-muted-foreground">
                • Make sure you're on Camp Network Testnet (Chain ID: 123420001114)
                <br />
                • Try disconnecting and reconnecting your wallet
                <br />
                • Clear your browser cache and cookies
                <br />
                • Make sure your wallet is unlocked
              </p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">❌ Wallet not popping up</p>
              <p className="text-muted-foreground">
                • Check if your wallet extension is installed and enabled
                <br />
                • Try refreshing the page
                <br />
                • Check browser console for errors (F12)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
