"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useAuth } from "@campnetwork/origin/react"
import { createLicenseTerms } from "@campnetwork/origin"
import { toast } from "sonner"
import { zeroAddress } from "viem"
import axios from "axios"
import Confetti from "react-confetti"

interface ShareToXProps {
  thesisId: string
  title: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "icon"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareToX({ 
  thesisId, 
  title, 
  className,
  variant = "outline",
  size = "sm"
}: ShareToXProps) {
  const auth = useAuth()
  const [isSharing, setIsSharing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleShare = async () => {
    try {
      setIsSharing(true)

      // Compose tweet text
      const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/thesis/${thesisId}`
      const tweetText = `Check out "${title}" on ThesisChain Africa! 🎓💡\n\n${shareUrl}\n\n#ThesisChainAfrica #CampNetwork`

      // Attempt to post via Twitter API if bearer token is available
      const bearerToken = process.env.NEXT_PUBLIC_X_BEARER_TOKEN

      let tweetPosted = false
      let tweetUrl = ""

      if (bearerToken) {
        try {
          // Attempt to post via Twitter API
          const response = await axios.post(
            "https://api.twitter.com/2/tweets",
            {
              text: tweetText
            },
            {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json"
              }
            }
          )

          if (response.data?.data?.id) {
            tweetPosted = true
            tweetUrl = `https://twitter.com/user/status/${response.data.data.id}`
          }
        } catch (apiError) {
          console.error("Twitter API error:", apiError)
          // Fall through to fallback method
        }
      }

      // Fallback: Open Twitter compose window if API failed or no token
      if (!tweetPosted) {
        const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
        window.open(twitterIntentUrl, "twitter-share", "width=550,height=420")
        
        toast.info("Opening Twitter...", {
          description: "Please complete your tweet to create a Share IP"
        })
      }

      // Create Share IP via Origin SDK mintSocial
      if (auth?.origin) {
        try {
          // Create license terms with 5% royalty
          const license = createLicenseTerms(
            BigInt("1000000000000000"), // 0.001 CAMP minimum price
            86400, // 1 day duration
            500, // 5% royalty (500 basis points)
            zeroAddress // Native currency (CAMP)
          )

          // Mint Share IP
          const shareTokenId = await auth.origin.mintSocial(
            "twitter",
            {
              name: `Share: ${title}`,
              description: `Shared thesis "${title}" on Twitter/X`,
              attributes: [
                { trait_type: "Type", value: "Share" },
                { trait_type: "Platform", value: "Twitter/X" },
                { trait_type: "Original Thesis", value: thesisId }
              ]
            },
            license
          )

          // Show success with confetti
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 5000)

          toast.success("Share IP created!", {
            description: `Your share has been minted as IPNFT #${shareTokenId} with 5% royalty`
          })
        } catch (mintError) {
          console.error("Error minting Share IP:", mintError)
          toast.warning("Tweet shared, but Share IP creation failed", {
            description: mintError instanceof Error ? mintError.message : "Please try again"
          })
        }
      } else {
        toast.warning("Share posted, but not authenticated with Origin", {
          description: "Connect your wallet to create a Share IP"
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 200}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <Button
        // variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isSharing}
        className={className}
        title="Share on X (Twitter)"
      >
        <Share2 className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">{isSharing ? "Sharing..." : "Share on X"}</span>}
      </Button>
    </>
  )
}
