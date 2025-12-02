"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Download, TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useAuthState } from "@campnetwork/origin/react"
import { useWalletAddress } from "@/lib/wallet"

export function EarningsSummary() {
  const { authenticated } = useAuthState()
  const address = useWalletAddress()
  const [isClaiming, setIsClaiming] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingRoyalties, setPendingRoyalties] = useState(0)
  const [thesesCount, setThesesCount] = useState(0)

  // Fetch earnings data
  useEffect(() => {
    if (authenticated && address) {
      // TODO: Implement fetching earnings from Origin SDK
      // For now, using placeholder data
      setTotalEarnings(0)
      setPendingRoyalties(0)
      setThesesCount(0)
    }
  }, [authenticated, address])

  const handleClaimRoyalties = async () => {
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to claim royalties"
      })
      return
    }

    if (pendingRoyalties === 0) {
      toast.error("No royalties to claim", {
        description: "You don't have any unclaimed royalties at this time"
      })
      return
    }

    setIsClaiming(true)
    const toastId = toast.loading("Claiming royalties...", {
      description: "Please confirm the transaction in your wallet"
    })
    
    try {
      // TODO: Implement claiming royalties via Origin SDK
      // await auth.origin.claimRoyalties(tokenId, address)

      toast.success("Royalties claimed successfully!", {
        id: toastId,
        description: `${pendingRoyalties.toFixed(2)} CAMP transferred to your wallet`
      })

      // Refresh earnings after claiming
      setPendingRoyalties(0)
    } catch (error) {
      console.error("Error claiming royalties:", error)
      
      if (error instanceof Error) {
        if (error.message.includes("rejected") || error.message.includes("denied")) {
          toast.error("Transaction rejected", {
            id: toastId,
            description: "You rejected the transaction"
          })
        } else {
          toast.error("Failed to claim royalties", {
            id: toastId,
            description: error.message
          })
        }
      } else {
        toast.error("Failed to claim royalties", {
          id: toastId,
          description: "An unknown error occurred"
        })
      }
    } finally {
      setIsClaiming(false)
    }
  }

  const hasUnclaimedRoyalties = pendingRoyalties > 0

  return (
    <Card className="border-border/40 bg-gradient-to-br from-accent-deep/10 to-accent-warm/10">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground/60 mb-1">Total Earnings</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-accent-deep to-accent-warm bg-clip-text text-transparent">
                ${totalEarnings.toFixed(2)}
              </span>
              <span className="text-sm text-foreground/60">CAMP</span>
            </div>
            <p className="text-xs text-foreground/50 mt-2">
              from {thesesCount} {thesesCount === 1 ? 'thesis' : 'theses'}
            </p>
            
            {/* Claim Button */}
            {hasUnclaimedRoyalties && (
              <Button
                onClick={handleClaimRoyalties}
                disabled={isClaiming}
                className="mt-4"
                size="sm"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  `Claim ${pendingRoyalties.toFixed(2)} CAMP`
                )}
              </Button>
            )}
          </div>

          {/* Icon */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-accent-deep to-accent-warm/80">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40">
          <div className="flex items-center gap-3">
            <Download className="h-4 w-4 text-accent-warm" />
            <div>
              <p className="text-xs text-foreground/60">Theses</p>
              <p className="text-lg font-semibold text-foreground">{thesesCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-accent-deep" />
            <div>
              <p className="text-xs text-foreground/60">Unclaimed</p>
              <p className="text-lg font-semibold text-accent-warm">
                ${hasUnclaimedRoyalties ? pendingRoyalties.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
