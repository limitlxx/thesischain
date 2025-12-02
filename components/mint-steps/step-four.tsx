"use client"

import { Copy, Check, Twitter, Mail, MessageCircle } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface StepFourProps {
  formData: any
  isLoading: boolean
  shareLink: string
}

export function StepFour({ formData, isLoading, shareLink }: StepFourProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToTwitter = () => {
    const tweetText = `I just minted my final year project as IP and can earn forever! 🎓💰 Check out "${formData.title}" on ThesisChain Africa - earning royalties on the Camp Network blockchain.`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareLink)}`
    window.open(url, "twitter-share", "width=550,height=420")
    toast.success("Sharing on Twitter!")
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out: ${formData.title}`)
    const body = encodeURIComponent(
      `I just minted my thesis on ThesisChain Africa!\n\nTitle: ${formData.title}\nUniversity: ${formData.university}\n\nView it here: ${shareLink}`,
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    toast.success("Opening email client...")
  }

  const shareToDiscord = () => {
    navigator.clipboard.writeText(`Check out my thesis on ThesisChain: ${shareLink}`)
    toast.success("Discord message copied to clipboard!")
  }

  if (shareLink) {
    return (
      <div className="space-y-6">
        <Card className="p-8 bg-gradient-to-br from-accent-deep/10 to-accent-warm/10 border-accent-warm/50 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-accent-warm mb-2">Thesis Minted Successfully!</h3>
          <p className="text-muted-foreground mb-6">
            Your thesis is now on the Camp Network and earning royalties from derivatives.
          </p>

          <div className="bg-background rounded-lg p-4 border border-accent-deep/20">
            <p className="text-sm text-muted-foreground mb-2">Share your thesis</p>
            <div className="flex items-center gap-2">
              <input type="text" value={shareLink} readOnly className="flex-1 bg-muted px-3 py-2 rounded text-sm" />
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2 bg-transparent">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={shareToTwitter}
            className="h-auto py-4 px-4 flex flex-col items-center gap-2 bg-gradient-to-br from-accent-deep/10 to-accent-warm/10 hover:from-accent-deep/20 hover:to-accent-warm/20 border border-accent-deep/20 text-foreground"
            variant="outline"
          >
            <Twitter className="h-5 w-5 text-accent-deep" />
            <span className="text-sm font-semibold">Share on X</span>
            <span className="text-xs text-foreground/60">"I just minted my thesis..."</span>
          </Button>
          <Button
            onClick={shareToDiscord}
            className="h-auto py-4 px-4 flex flex-col items-center gap-2 bg-gradient-to-br from-accent-deep/10 to-accent-warm/10 hover:from-accent-deep/20 hover:to-accent-warm/20 border border-accent-deep/20 text-foreground"
            variant="outline"
          >
            <MessageCircle className="h-5 w-5 text-accent-deep" />
            <span className="text-sm font-semibold">Share on Discord</span>
            <span className="text-xs text-foreground/60">Copy to clipboard</span>
          </Button>
          <Button
            onClick={shareViaEmail}
            className="h-auto py-4 px-4 flex flex-col items-center gap-2 bg-gradient-to-br from-accent-deep/10 to-accent-warm/10 hover:from-accent-deep/20 hover:to-accent-warm/20 border border-accent-deep/20 text-foreground"
            variant="outline"
          >
            <Mail className="h-5 w-5 text-accent-deep" />
            <span className="text-sm font-semibold">Email</span>
            <span className="text-xs text-foreground/60">Send to friends</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Review Your Thesis Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewCard label="Title" value={formData.title} />
        <ReviewCard label="University" value={formData.university} />
        <ReviewCard label="Department" value={formData.department} />
        <ReviewCard label="Year" value={formData.year} />
        <ReviewCard label="Royalty %" value={`${formData.royaltyPercentage}%`} />
        <ReviewCard label="Allow Forking" value={formData.allowForking ? "Yes" : "No"} />
      </div>

      <Card className="p-4 bg-muted/50 border-muted">
        <p className="text-sm font-semibold mb-2">Abstract</p>
        <p className="text-sm text-muted-foreground line-clamp-3">{formData.abstract}</p>
      </Card>

      <Card className="p-4 bg-accent-deep/5 border-accent-deep/20">
        <p className="text-sm">
          <strong>Important:</strong> Once minted, your thesis details are immutable on the blockchain. You can always
          update metadata through the management dashboard.
        </p>
      </Card>
    </div>
  )
}

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 bg-muted/50">
      <p className="text-xs text-muted-foreground font-semibold uppercase">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1 truncate">{value || "-"}</p>
    </Card>
  )
}
