"use client"

/**
 * Thesis Viewer using RxDB + Origin SDK
 * Displays thesis data from local database with Origin SDK fallback
 */

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, GitFork, FileText, CheckCircle, Loader2, Calendar, User, Building2, Award, Eye, RefreshCw } from "lucide-react"
import { ForkModal } from "./fork-modal"
import { ShareToX } from "@/components/ShareToX"
import { toast } from "sonner"
import { useWalletAddress } from "@/lib/wallet"
import { getDatabase } from "@/lib/db/rxdb-setup"
import type { ThesisDocument } from "@/lib/db/types"
import { formatDistanceToNow } from "date-fns"
import { useFetchIPNFT, formatIPNFTPrice, formatIPNFTDuration } from "@/lib/fetch-ipnft"
import { useAuth } from "@campnetwork/origin/react"

export function ThesisViewerRxDB({ thesisId }: { thesisId: string }) {
  const [showForkModal, setShowForkModal] = useState(false)
  const [thesis, setThesis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingFromOrigin, setLoadingFromOrigin] = useState(false)
  const [dataSource, setDataSource] = useState<'database' | 'origin' | null>(null)
  
  const walletAddress = useWalletAddress()
  const auth = useAuth()
  const { fetchIPNFT } = useFetchIPNFT()
  
  // Load thesis from RxDB with Origin SDK fallback
  useEffect(() => {
    let subscription: any

    async function loadThesis() {
      try {
        setIsLoading(true)
        console.log("📖 Loading thesis from database:", thesisId)
        
        const db = await getDatabase()
        console.log("✓ Database connection established")
        
        // Subscribe to thesis document (reactive!)
        subscription = db.theses
          .findOne(thesisId)
          .$.subscribe(async (doc: any) => {
            if (doc) {
              const thesisData = doc.toJSON()
              console.log("✅ Thesis found in database:", thesisData)
              setThesis(thesisData)
              setDataSource('database')
              setError(null)
              setIsLoading(false)
            } else {
              console.warn("⚠️ Thesis not found in database, trying Origin SDK...")
              
              // Try fetching from Origin SDK as fallback
              if (auth?.origin) {
                try {
                  setLoadingFromOrigin(true)
                  const ipnftInfo = await fetchIPNFT(thesisId)
                  
                  if (ipnftInfo) {
                    console.log("✅ IPNFT fetched from Origin SDK:", ipnftInfo)
                    
                    // Convert IPNFT data to thesis format
                    const thesisFromOrigin = {
                      tokenId: ipnftInfo.tokenId,
                      owner: ipnftInfo.owner,
                      name: ipnftInfo.metadata?.name || 'Untitled Thesis',
                      description: ipnftInfo.metadata?.description || 'No description available',
                      university: ipnftInfo.metadata?.university || 'Unknown',
                      department: ipnftInfo.metadata?.department || '',
                      year: ipnftInfo.metadata?.year || new Date().getFullYear(),
                      royaltyBps: ipnftInfo.terms.royaltyBps,
                      imageUrl: ipnftInfo.metadata?.image || '',
                      ipfsHash: ipnftInfo.tokenURI?.replace('ipfs://', '') || '',
                      fileType: ipnftInfo.metadata?.fileType || 'application/pdf',
                      fileSize: ipnftInfo.metadata?.fileSize || 0,
                      forks: 0,
                      parentTokenId: '',
                      mintedAt: Date.now(),
                      updatedAt: Date.now(),
                      price: ipnftInfo.terms.price,
                      duration: ipnftInfo.terms.duration,
                      paymentToken: ipnftInfo.terms.paymentToken
                    }
                    
                    setThesis(thesisFromOrigin)
                    setDataSource('origin')
                    setError(null)
                  } else {
                    setError("Thesis not found in database or blockchain")
                  }
                } catch (originError) {
                  console.error("❌ Error fetching from Origin SDK:", originError)
                  setError("Thesis not found. Please check the token ID.")
                } finally {
                  setLoadingFromOrigin(false)
                }
              } else {
                setError("Thesis not found in database. Connect your wallet to fetch from blockchain.")
              }
              
              setIsLoading(false)
            }
          })
      } catch (err) {
        console.error("❌ Error loading thesis:", err)
        setError("Failed to load thesis")
        setIsLoading(false)
      }
    }

    loadThesis()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [thesisId, auth, fetchIPNFT])

  const handleFork = () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet to fork this thesis")
      return
    }
    setShowForkModal(true)
  }

  const handleDownload = () => {
    if (thesis?.imageUrl) {
      window.open(thesis.imageUrl, '_blank')
      toast.success("Opening thesis file...")
    } else {
      toast.error("No file available for download")
    }
  }

  if (isLoading || loadingFromOrigin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              {loadingFromOrigin ? 'Fetching from blockchain...' : 'Loading thesis...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !thesis) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Thesis Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The thesis you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild>
              <a href="/search">Browse All Theses</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = walletAddress && thesis.owner.toLowerCase() === walletAddress.toLowerCase()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">{thesis.name}</h1>
              {dataSource === 'origin' && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Live from Blockchain
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{thesis.description}</p>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Your Thesis
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{thesis.university}</span>
          </div>
          {thesis.department && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{thesis.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{thesis.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-mono text-xs">
              {thesis.owner.slice(0, 6)}...{thesis.owner.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thesis Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Thesis Content</CardTitle>
            </CardHeader>
            <CardContent>
              {thesis.imageUrl ? (
                <div className="space-y-4">
                  <img 
                    src={thesis.imageUrl} 
                    alt={thesis.name}
                    className="w-full rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleDownload} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      View Full Content
                    </Button>
                    <ShareToX
                      thesisId={thesisId}
                      title={thesis.name}
                      variant="outline"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No preview available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Information */}
          {thesis.fileType && (
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Type:</span>
                    <span className="font-medium">{thesis.fileType}</span>
                  </div>
                  {thesis.fileSize > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium">
                        {(thesis.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID:</span>
                    <span className="font-mono text-xs">{thesis.tokenId}</span>
                  </div>
                  {thesis.ipfsHash && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IPFS Hash:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">
                        {thesis.ipfsHash}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GitFork className="h-4 w-4" />
                  <span>Forks</span>
                </div>
                <span className="font-bold text-lg">{thesis.forks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Royalty</span>
                </div>
                <span className="font-bold text-lg">{thesis.royaltyBps / 100}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Minted</span>
                </div>
                <span className="text-sm">
                  {formatDistanceToNow(thesis.mintedAt, { addSuffix: true })}
                </span>
              </div>
              {thesis.price && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Access Price</span>
                  </div>
                  <span className="font-bold text-sm">{formatIPNFTPrice(thesis.price)}</span>
                </div>
              )}
              {thesis.duration && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Duration</span>
                  </div>
                  <span className="text-sm">{formatIPNFTDuration(thesis.duration)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleFork} 
                className="w-full"
                disabled={!walletAddress}
              >
                <GitFork className="h-4 w-4 mr-2" />
                Fork This Thesis
              </Button>
              <Button 
                onClick={handleDownload} 
                variant="outline" 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {isOwner && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <a href="/dashboard">
                    <Eye className="h-4 w-4 mr-2" />
                    View in Dashboard
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Pending validation</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This thesis is awaiting supervisor validation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fork Modal */}
      <ForkModal
        open={showForkModal}
        onOpenChange={setShowForkModal}
        parentTokenId={thesisId}
        parentTitle={thesis.name}
      />
    </div>
  )
}
