"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2 } from "lucide-react"
import { useForkThesis } from "@/lib/camp"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatUnits } from "viem"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-mobile"

interface ForkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentTokenId: string
  parentTitle: string
}

export function ForkModal({ open, onOpenChange, parentTokenId, parentTitle }: ForkModalProps) {
  const [step, setStep] = useState<"upload" | "confirm">("upload")
  const [versionTitle, setVersionTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const router = useRouter()
  const { width, height } = useWindowSize()
  const { forkThesis, usdcBalance, parentTerms } = useForkThesis(parentTokenId)

  // Calculate license fee (0.05 USDC as per design)
  const licenseFee = BigInt("50000") // 0.05 USDC (6 decimals)
  const royaltyFee = licenseFee * BigInt(40) / BigInt(100) // 40% royalty
  const totalFee = licenseFee + royaltyFee

  // Check if user has sufficient balance
  const hasSufficientBalance = usdcBalance >= totalFee

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      const validTypes = ['.pdf', '.zip', '.tar.gz', '.mp4', '.mov']
      const fileExtension = selectedFile.name.toLowerCase()
      const isValid = validTypes.some(type => fileExtension.endsWith(type))
      
      if (!isValid) {
        toast.error("Invalid file type", {
          description: "Supported formats: PDF, ZIP, TAR.GZ, MP4, MOV"
        })
        return
      }
      
      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (selectedFile.size > maxSize) {
        toast.error("File too large", {
          description: "Maximum file size is 100MB"
        })
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleNext = () => {
    if (versionTitle && description && file) {
      if (!hasSufficientBalance) {
        toast.error("Insufficient USDC balance", {
          description: `You need ${formatUnits(totalFee, 6)} USDC to fork this thesis`
        })
        return
      }
      setStep("confirm")
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    
    setIsSubmitting(true)
    setUploadProgress(0)
    
    try {
      // Prepare metadata
      const metadata = {
        name: versionTitle,
        description: description,
        attributes: [
          { trait_type: "Type", value: "Fork" },
          { trait_type: "Parent", value: parentTitle },
          { trait_type: "Parent Token ID", value: parentTokenId }
        ]
      }
      
      // Fork the thesis
      const newTokenId = await forkThesis(
        [file],
        metadata,
        1000, // 10% royalty for the fork
        (progress) => setUploadProgress(progress)
      )
      
      // Show success
      setShowConfetti(true)
      toast.success("Thesis forked successfully!", {
        description: "Your derivative work has been created"
      })
      
      // Wait a moment for confetti, then redirect
      setTimeout(() => {
        setShowConfetti(false)
        onOpenChange(false)
        router.push(`/thesis/${newTokenId}`)
        
        // Reset form
        setStep("upload")
        setVersionTitle("")
        setDescription("")
        setFile(null)
        setUploadProgress(0)
      }, 3000)
      
    } catch (error) {
      console.error("Fork error:", error)
      // Error toast is already shown by useForkThesis hook
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setStep("upload")
      setVersionTitle("")
      setDescription("")
      setFile(null)
      setUploadProgress(0)
      setIsSubmitting(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {step === "upload" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Fork & Improve</DialogTitle>
              <DialogDescription>Create a new version of this thesis with your improvements</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Version Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-medium">
                  Version Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Extended Analysis with ML Applications"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">
                  What Changed?
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your improvements and modifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-background border-border resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file" className="text-foreground font-medium">
                  Upload PDF
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input id="file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="file" className="cursor-pointer">
                    {file ? (
                      <div className="space-y-2">
                        <div className="text-2xl">✓</div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-2xl">📄</div>
                        <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF files only</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`rounded-lg p-4 flex gap-3 ${
                hasSufficientBalance 
                  ? "bg-green-500/5 border border-green-500/20" 
                  : "bg-red-500/5 border border-red-500/20"
              }`}>
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  hasSufficientBalance ? "text-green-500" : "text-red-500"
                }`} />
                <div className="space-y-1">
                  <p className="text-xs font-medium">
                    Your USDC Balance: {formatUnits(usdcBalance, 6)} USDC
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasSufficientBalance 
                      ? "You have sufficient balance to fork this thesis"
                      : `You need ${formatUnits(totalFee, 6)} USDC to fork this thesis`
                    }
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-accent-deep/5 border border-accent-deep/20 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-4 h-4 text-accent-deep flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Your improved thesis will be linked to the original, with automatic {formatUnits(royaltyFee, 6)} USDC royalty payment to the
                  original author upon minting.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!versionTitle || !description || !file || !hasSufficientBalance}
                className="flex-1 bg-accent-deep hover:bg-accent-deep/90"
              >
                Review Fork
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Confirm Fork</DialogTitle>
              <DialogDescription>Review your improvements before minting</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Summary */}
              <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Version Title</p>
                  <p className="font-medium text-foreground">{versionTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Changes</p>
                  <p className="text-sm text-foreground line-clamp-3">{description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File</p>
                  <p className="text-sm text-foreground">{file?.name}</p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 border-t border-b border-border py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License Fee</span>
                  <span className="font-medium text-foreground">{formatUnits(licenseFee, 6)} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Author Royalty (40%)</span>
                  <span className="font-medium text-foreground">{formatUnits(royaltyFee, 6)} USDC</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-accent-deep">{formatUnits(totalFee, 6)} USDC</span>
                </div>
              </div>
              
              {/* Upload Progress */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Upload Progress</span>
                    <span className="font-medium text-foreground">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent-deep h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Confirmation Info */}
              <div className="bg-accent-deep/5 border border-accent-deep/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By confirming, you agree to mint this thesis version on Camp Network and automatically transfer
                  royalties to the original author.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep("upload")} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-accent-deep hover:bg-accent-deep/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadProgress < 100 ? `Uploading ${Math.round(uploadProgress)}%` : "Minting..."}
                  </>
                ) : (
                  `Mint Fork (${formatUnits(totalFee, 6)} USDC)`
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
      
      {/* Confetti on success */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
    </Dialog>
  )
}
