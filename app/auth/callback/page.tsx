"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Confetti from "react-confetti"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isProcessing, setIsProcessing] = useState(true)
  const [hasProcessed, setHasProcessed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [processingStep, setProcessingStep] = useState("Verifying authentication...")

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed) return

    const processCallback = async () => {
      try {
        setIsProcessing(true)
        setProcessingStep("Verifying authentication...")

        // Parse OAuth query parameters
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const error = searchParams.get("error")

        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        // Wait for the OAuth flow to complete
        await new Promise(resolve => setTimeout(resolve, 2000))

        setProcessingStep("Social account linked successfully!")

        // Show confetti on successful linking
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setProcessingStep("Redirecting to dashboard...")
        
        toast.success("Account connected!", {
          description: "Welcome to ThesisChain Africa"
        })

        // Clean up stored data
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedUniversity")
          localStorage.removeItem("pendingSocialLink")
        }

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } catch (error) {
        console.error("Error processing OAuth callback:", error)
        toast.error("Authentication failed", {
          description: error instanceof Error ? error.message : "Please try again",
          action: {
            label: "Try Again",
            onClick: () => router.push("/auth/signup")
          }
        })
        
        // Redirect back to signup on failure
        setTimeout(() => {
          router.push("/auth/signup")
        }, 3000)
      } finally {
        setIsProcessing(false)
        setHasProcessed(true)
      }
    }

    processCallback()
  }, [searchParams, hasProcessed, router])



  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      {/* Confetti on successful profile creation */}
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 200}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      
      {/* Loading overlay */}
      <div className="text-center space-y-6 p-8 bg-card rounded-lg border border-border shadow-lg max-w-md">
        <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">
            {isProcessing ? "Setting up your account" : "Success!"}
          </h2>
          <p className="text-muted-foreground">
            {processingStep}
          </p>
          {isProcessing && (
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "70%" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
