"use client"

import { useState } from "react"
import { useAuthState, useAuth } from "@campnetwork/origin/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StepOne } from "@/components/mint-steps/step-one"
import { StepTwo, validateStepTwo } from "@/components/mint-steps/step-two"
import { StepThree, validateStepThree } from "@/components/mint-steps/step-three"
import { StepFour } from "@/components/mint-steps/step-four"
import { MintStepper } from "@/components/mint-stepper"
import { useMintThesis } from "@/lib/camp"
import { toast } from "sonner"
import Confetti from "react-confetti"

interface MintFormData {
  // Step 1
  thesisPdf: File | null
  sourceCode: File | null
  demoVideo: File | null
  coverImage: File | null
  // Step 2
  title: string
  abstract: string
  author: string
  department: string
  university: string
  year: string
  supervisorWallet: string
  // Step 3
  royaltyPercentage: number
  licensePrice: number // In CAMP
  licenseDuration: number // In days
  allowForking: boolean
  // Step 4 (computed)
  estimatedEarnings?: number
}

export function MintWizard() {
  const { authenticated } = useAuthState()
  const router = useRouter()
  const { mintThesis } = useMintThesis()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [mintedTokenId, setMintedTokenId] = useState<string>("")
  const [formData, setFormData] = useState<MintFormData>({
    thesisPdf: null,
    sourceCode: null,
    demoVideo: null,
    coverImage: null,
    title: "",
    abstract: "",
    author: "",
    department: "",
    university: "",
    year: "",
    supervisorWallet: "",
    royaltyPercentage: 10,
    licensePrice: 0.001, // Default 0.001 CAMP
    licenseDuration: 1, // Default 1 day
    allowForking: false,
  })

  const updateFormData = (updates: Partial<MintFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 2) {
      const validation = validateStepTwo(formData)
      if (!validation.isValid) {
        toast.error("Please complete all required fields", {
          description: validation.errors.join(", ")
        })
        return
      }
    }
    
    if (currentStep === 3) {
      const validation = validateStepThree(formData)
      if (!validation.isValid) {
        toast.error("Invalid royalty percentage", {
          description: validation.errors.join(", ")
        })
        return
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleMint = async () => {
    if (!authenticated) {
      toast.error("Please connect your wallet first")
      router.push("/auth/signup")
      return
    }

    // Validate that thesis PDF (TXT file) is uploaded
    if (!formData.thesisPdf) {
      toast.error("Please upload your thesis as a TXT file")
      return
    }
    
    // Validate file type is TXT
    if (formData.thesisPdf.type !== 'text/plain') {
      toast.error("Only TXT files are supported. Please convert your thesis to TXT format.")
      return
    }

    // Final validation
    const stepTwoValidation = validateStepTwo(formData)
    if (!stepTwoValidation.isValid) {
      toast.error("Please complete all required fields", {
        description: stepTwoValidation.errors.join(", ")
      })
      return
    }

    const stepThreeValidation = validateStepThree(formData)
    if (!stepThreeValidation.isValid) {
      toast.error("Invalid royalty percentage", {
        description: stepThreeValidation.errors.join(", ")
      })
      return
    }

    setIsLoading(true)
    setUploadProgress(0)
    
    try {
      // Check authentication before minting
      if (!authenticated) {
        toast.error("Not authenticated", {
          description: "Please connect your wallet to mint a thesis"
        })
        setIsLoading(false)
        return
      }

      // Store cover image in browser localStorage if provided
      if (formData.coverImage) {
        try {
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageData = e.target?.result as string
            localStorage.setItem(`thesis-cover-${Date.now()}`, imageData)
          }
          reader.readAsDataURL(formData.coverImage)
        } catch (error) {
          console.warn("Failed to store cover image:", error)
        }
      }

      // Prepare metadata
      const metadata = {
        name: formData.title,
        description: formData.abstract,
        image: formData.coverImage ? URL.createObjectURL(formData.coverImage) : undefined,
        attributes: [
          { trait_type: "Author", value: formData.author },
          { trait_type: "University", value: formData.university },
          { trait_type: "Department", value: formData.department },
          { trait_type: "Year", value: formData.year },
          ...(formData.supervisorWallet ? [{ trait_type: "Supervisor", value: formData.supervisorWallet }] : []),
          { trait_type: "Allow Forking", value: formData.allowForking ? "Yes" : "No" },
          { trait_type: "Has Cover Image", value: formData.coverImage ? "Yes" : "No" }
        ]
      }

      // Convert royalty percentage to basis points (1% = 100 BPS)
      const royaltyBps = formData.royaltyPercentage * 100

      // Mint thesis with only the TXT file
      const tokenId = await mintThesis(
        [formData.thesisPdf], // Only mint the TXT file
        metadata,
        royaltyBps,
        formData.licensePrice, // Price in CAMP
        formData.licenseDuration, // Duration in days
        (progress) => {
          setUploadProgress(progress)
        }
      )

      setMintedTokenId(tokenId)

      // Generate shareable link
      const shareUrl = `${window.location.origin}/thesis/${tokenId}`
      setShareLink(shareUrl)

      // Show confetti
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 30000)

      // Redirect to thesis page after a short delay
      setTimeout(() => {
        router.push(`/thesis/${tokenId}`)
      }, 30000)

    } catch (error) {
      console.error("Minting failed:", error)
      toast.error("Failed to mint thesis", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 text-balance">Mint Your Thesis</h1>
        <p className="text-muted-foreground">Complete these 4 steps to tokenize your research on Camp Network</p>
      </div>

      {/* Warning about Origin SDK auth issues */}
      {/* <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-yellow-500 mt-0.5">⚠️</div>
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium">Known Issue: Authentication Errors</p>
              <p className="text-xs text-muted-foreground">
                The Origin SDK may show "Failed to get signature" errors. If minting fails, please refresh the page and try again, 
                or use <a href="https://origin.camp.network" target="_blank" rel="noopener noreferrer" className="underline">Origin's official interface</a>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <MintStepper currentStep={currentStep} />

      <Card className="mt-8 bg-gradient-to-br from-accent-deep/5 to-accent-warm/5 border-accent-deep/20">
        <CardHeader>
          <CardTitle>Step {currentStep}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Upload your thesis files and documentation"}
            {currentStep === 2 && "Provide project details and metadata"}
            {currentStep === 3 && "Configure royalties and sharing settings"}
            {currentStep === 4 && "Review everything and mint on-chain"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <StepOne formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <StepTwo formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <StepThree formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && (
            <>
              {isLoading && uploadProgress > 0 && (
                <div className="mb-6 p-4 bg-accent-deep/5 border border-accent-deep/20 rounded-lg">
                  <p className="text-sm font-semibold mb-2">
                    {uploadProgress < 40 ? "Uploading files to IPFS..." : 
                     uploadProgress < 60 ? "Minting via Origin SDK..." : 
                     uploadProgress < 80 ? "Registering on blockchain..." : 
                     "Finalizing..."}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-accent-deep to-accent-warm h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{Math.round(uploadProgress)}% complete</p>
                </div>
              )}
              <StepFour formData={formData} isLoading={isLoading} shareLink={shareLink} />
            </>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-8 bg-transparent"
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="px-8 bg-gradient-to-r from-accent-deep to-accent-warm hover:from-accent-deep/90 hover:to-accent-warm/90"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleMint}
                disabled={isLoading || !authenticated}
                className="px-8 bg-gradient-to-r from-accent-deep to-accent-warm hover:from-accent-deep/90 hover:to-accent-warm/90"
              >
                {isLoading 
                  ? `Minting... ${Math.round(uploadProgress)}%` 
                  : !authenticated 
                  ? "Connect Wallet" 
                  : "Mint on Camp Network"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
