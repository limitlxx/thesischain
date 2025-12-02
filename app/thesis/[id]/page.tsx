"use client"

import { use, Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ThesisViewerOrigin } from "@/components/thesis/thesis-viewer-origin"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { isValidTokenId } from "@/lib/fetch-ipnft"

function ThesisLoader() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading thesis...</p>
        </div>
      </div>
    </div>
  )
}

function InvalidTokenId({ tokenId }: { tokenId: string }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Token ID</h2>
          <p className="text-muted-foreground mb-4">
            The token ID "{tokenId}" is not valid.
          </p>
          <p className="text-sm text-muted-foreground">
            Token IDs must be valid positive numbers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ThesisPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  
  // Validate token ID
  if (!isValidTokenId(id)) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <InvalidTokenId tokenId={id} />
        <Footer />
      </main>
    )
  }
  
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<ThesisLoader />}>
        <ThesisViewerOrigin thesisId={id} />
      </Suspense>
      <Footer />
    </main>
  )
}
