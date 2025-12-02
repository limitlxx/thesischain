"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, GitFork, FileText, CheckCircle, Loader2 } from "lucide-react"
import { PDFViewer } from "./pdf-viewer"
import { VersionTree } from "./version-tree"
import { ForkModal } from "./fork-modal"
import { ShareToX } from "@/components/ShareToX"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACT_ADDRESSES, UNIVERSITY_VALIDATOR_ABI } from "@/lib/contracts"
import { toast } from "sonner"
import type { Address } from "viem"
import { useWalletAddress } from "@/lib/wallet"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-mobile"

// Mock thesis data - replace with API call
const mockThesis = {
  id: "thesis-001",
  title: "Decentralized Knowledge Networks: Exploring Blockchain-Based Research Collaboration in African Academia",
  author: "Dr. Amara Okonkwo",
  university: "University of Lagos",
  mintedDate: "2024-11-15",
  pdfUrl: "/thesis-sample.pdf",
  tags: ["Blockchain", "Research", "Africa", "Web3", "Academia"],
  downloads: 324,
  forks: 12,
  versions: [
    { id: "v1", title: "Original Research", date: "2024-11-15", author: "Dr. Amara Okonkwo" },
    { id: "v2", title: "Extended Analysis", date: "2024-12-01", author: "Dr. Okonkwo & Prof. Adeyemi", isFork: true },
    { id: "v3", title: "Improved Methodology", date: "2024-12-10", author: "Research Team", isFork: true },
  ],
}

export function ThesisViewer({ thesisId }: { thesisId: string }) {
  const [showForkModal, setShowForkModal] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const address = useWalletAddress()
  const { width, height } = useWindowSize()
  
  // TODO: Re-implement with Origin SDK or custom contract integration
  // Temporarily disabled Wagmi hooks to prevent errors
  const isSupervisor = false
  const validationInfo = null
  const refetchValidation = () => {}
  const isConfirming = false
  
  const isValidated = false
  const validator = null
  
  const handleValidate = async () => {
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to validate theses"
      })
      return
    }
    
    if (!isSupervisor) {
      toast.error("Permission denied", {
        description: "You don't have permission to validate theses. Supervisor role required."
      })
      return
    }
    
    if (isValidated) {
      toast.error("Already validated", {
        description: `This thesis has already been validated by ${validator}`
      })
      return
    }
    
    setIsValidating(true)
    
    try {
      // Create a simple signature (empty bytes for now, as the contract may not require it)
      const signature = "0x"
      
      const tx = await useWriteContract({
        address: CONTRACT_ADDRESSES.UniversityValidator as Address,
        abi: UNIVERSITY_VALIDATOR_ABI,
        functionName: "validate",
        args: [BigInt(thesisId), signature as `0x${string}`]
      })
      
      toast.success("Validation submitted", {
        description: "Waiting for transaction confirmation..."
      })
      
      // Wait a moment then refetch validation status
      setTimeout(() => {
        refetchValidation()
        
        // Show confetti on successful validation
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
        
        toast.success("Thesis validated successfully!", {
          description: "The verified badge is now displayed"
        })
      }, 3000)
      
    } catch (error) {
      console.error("Validation error:", error)
      
      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          toast.error("Transaction rejected", {
            description: "You rejected the transaction signature"
          })
        } else if (error.message.includes("Supervisor")) {
          toast.error("Not a supervisor", {
            description: "You don't have permission to validate theses"
          })
        } else {
          toast.error("Validation failed", {
            description: error.message
          })
        }
      }
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      {/* Confetti on successful validation */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header Section */}
        <div className="mb-12 space-y-6">
          {/* Title and Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <h1 className="text-4xl font-serif font-bold text-foreground leading-tight text-balance flex-1">
                {mockThesis.title}
              </h1>
              {isValidated && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-lg text-muted-foreground">
                by <span className="font-semibold text-foreground">{mockThesis.author}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-accent-deep/10 text-accent-deep border-accent-deep/20">
                  {mockThesis.university}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Minted:{" "}
                  {new Date(mockThesis.mintedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {isValidated && validator && (
                  <span className="text-sm text-muted-foreground">
                    Validated by: {validator.slice(0, 6)}...{validator.slice(-4)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Tags */}
          <div className="flex flex-wrap gap-2 pt-4">
            {mockThesis.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-background hover:bg-muted">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6">
            <Button size="lg" className="bg-accent-deep hover:bg-accent-deep/90 gap-2">
              <Download className="w-4 h-4" />
              Download PDF (0.1 USDC)
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowForkModal(true)} className="gap-2">
              <GitFork className="w-4 h-4" />
              Fork & Improve This Project
            </Button>
            <ShareToX 
              thesisId={thesisId} 
              title={mockThesis.title}
              variant="outline"
              size="lg"
            />
            {isSupervisor && !isValidated && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleValidate}
                disabled={isValidating || isConfirming}
                className="gap-2 border-green-500/20 text-green-500 hover:bg-green-500/10"
              >
                {isValidating || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Validate Thesis
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-4 text-sm border-t border-border pt-6">
            <div>
              <p className="text-muted-foreground">Downloads</p>
              <p className="text-lg font-semibold text-foreground">{mockThesis.downloads}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Version Forks</p>
              <p className="text-lg font-semibold text-foreground">{mockThesis.forks}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PDF Viewer - Left Column */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Research Document</h2>
              </div>
              <PDFViewer pdfUrl={mockThesis.pdfUrl} />
            </Card>
          </div>

          {/* Version Tree - Right Column */}
          <div className="lg:col-span-1">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Version History</h2>
                <VersionTree versions={mockThesis.versions} />
              </div>

              {/* Royalty Breakdown */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Royalty Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Original Author</span>
                    <span className="font-semibold text-accent-deep">40%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent-deep h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Future Earnings (You)</span>
                    <span className="font-semibold text-accent-warm">60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent-warm h-2 rounded-full ml-auto" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-accent-deep/5 border border-accent-deep/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When you fork and improve this thesis, the original author automatically receives 40% of your future
                  earnings, ensuring fair attribution and incentivizing quality research.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fork Modal */}
      <ForkModal 
        open={showForkModal} 
        onOpenChange={setShowForkModal}
        parentTokenId={thesisId}
        parentTitle={mockThesis.title}
      />
    </div>
  )
}
