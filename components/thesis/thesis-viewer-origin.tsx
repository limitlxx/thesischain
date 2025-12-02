"use client"

/**
 * Thesis Viewer using Origin SDK only
 * Fetches data directly from blockchain without local database
 */

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, GitFork, FileText, Loader2, Calendar, User, Building2, Award, Eye, AlertCircle } from "lucide-react"
import { ForkModal } from "./fork-modal"
import { ShareToX } from "@/components/ShareToX"
import { toast } from "sonner"
import { useWalletAddress } from "@/lib/wallet"
import { formatDistanceToNow } from "date-fns"
import { useFetchIPNFT, formatIPNFTPrice, formatIPNFTDuration } from "@/lib/fetch-ipnft"
import { useAuth } from "@campnetwork/origin/react"

export function ThesisViewerOrigin({ thesisId }: { thesisId: string }) {
  const [showForkModal, setShowForkModal] = useState(false)
  const [thesis, setThesis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'database' | 'blockchain' | null>(null)
  
  const walletAddress = useWalletAddress()
  const auth = useAuth()
  const { fetchIPNFT } = useFetchIPNFT()
  
  // Load thesis from RxDB first, then fallback to blockchain
  useEffect(() => {
    async function loadThesis() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Try RxDB first (faster, offline-capable)
        console.log("🔍 Checking RxDB for IPNFT:", thesisId)
        try {
          const { getDatabase } = await import('@/lib/db/rxdb-setup')
          const db = await getDatabase()
          const doc = await db.theses.findOne(thesisId).exec()
          
          if (doc) {
            const ipnft = doc.toJSON() as any
            console.log("✅ IPNFT found in RxDB:", ipnft)
            
            setThesis({
              tokenId: ipnft.tokenId,
              owner: ipnft.owner,
              author: ipnft.author,
              name: ipnft.name,
              description: ipnft.description,
              university: ipnft.university,
              department: ipnft.department,
              year: ipnft.year,
              royaltyBps: ipnft.royaltyBps,
              imageUrl: ipnft.imageUrl,
              ipfsHash: ipnft.ipfsHash,
              fileName: ipnft.fileName,
              fileType: ipnft.fileType,
              fileSize: ipnft.fileSize,
              forks: ipnft.forks,
              parentTokenId: ipnft.parentTokenId,
              mintedAt: ipnft.mintedAt,
              mintedTimestamp: ipnft.mintedTimestamp,
              updatedAt: ipnft.updatedAt
            })
            setDataSource('database')
            setIsLoading(false)
            return
          }
        } catch (dbError) {
          console.warn("⚠️ RxDB lookup failed, trying blockchain:", dbError)
        }
        
        // Fallback to blockchain if not in RxDB
        if (!auth?.origin) {
          setError("Please connect your wallet to view this thesis")
          setIsLoading(false)
          return
        }

        console.log("🔍 Fetching IPNFT from blockchain:", thesisId)
        const ipnftInfo = await fetchIPNFT(thesisId)
        
        if (!ipnftInfo) {
          setError("Thesis not found")
          setIsLoading(false)
          return
        }
        
        console.log("✅ IPNFT fetched from blockchain:", ipnftInfo)
        
        // Convert IPNFT data to thesis format
        const thesisData = {
          tokenId: ipnftInfo.tokenId,
          owner: ipnftInfo.owner,
          author: ipnftInfo.metadata?.attributes?.find((a: any) => a.trait_type === 'Author')?.value || '',
          name: ipnftInfo.metadata?.name || 'Untitled Thesis',
          description: ipnftInfo.metadata?.description || 'No description available',
          university: ipnftInfo.metadata?.attributes?.find((a: any) => a.trait_type === 'University')?.value || 'Unknown',
          department: ipnftInfo.metadata?.attributes?.find((a: any) => a.trait_type === 'Department')?.value || '',
          year: ipnftInfo.metadata?.attributes?.find((a: any) => a.trait_type === 'Year')?.value || new Date().getFullYear(),
          royaltyBps: ipnftInfo.terms.royaltyBps,
          imageUrl: ipnftInfo.metadata?.image || '',
          ipfsHash: ipnftInfo.tokenURI?.replace('ipfs://', '') || '',
          fileName: '',
          fileType: ipnftInfo.metadata?.attributes?.find((a: any) => a.trait_type === 'File Type')?.value || 'application/pdf',
          fileSize: ipnftInfo.metadata?.attributes?.find((a: any) => a.trait_type === 'File Size')?.value || 0,
          forks: 0,
          parentTokenId: '',
          mintedAt: Date.now(),
          mintedTimestamp: new Date().toISOString(),
          updatedAt: Date.now(),
          price: ipnftInfo.terms.price,
          duration: ipnftInfo.terms.duration,
          paymentToken: ipnftInfo.terms.paymentToken
        }
        
        setThesis(thesisData)
        setDataSource('blockchain')
        setError(null)
      } catch (err) {
        console.error("❌ Error loading thesis:", err)
        setError(err instanceof Error ? err.message : "Failed to load thesis")
      } finally {
        setIsLoading(false)
      }
    }

    loadThesis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thesisId, auth?.origin])

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Fetching from blockchain...</p>
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
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Thesis</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The thesis you're looking for doesn't exist or couldn't be loaded."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="outline" asChild>
                <a href="/search">Browse All Theses</a>
              </Button>
            </div>
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
              <Badge variant="outline" className="text-xs">
                {dataSource === 'database' ? 'From Database' : 'Live from Blockchain'}
              </Badge>
            </div>
            {thesis.author && (
              <p className="text-sm text-muted-foreground mb-2">by {thesis.author}</p>
            )}
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
                  {thesis.fileName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Name:</span>
                      <span className="font-medium truncate max-w-[200px]">{thesis.fileName}</span>
                    </div>
                  )}
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
                    <span className="font-mono text-xs break-all">{thesis.tokenId}</span>
                  </div>
                  {thesis.ipfsHash && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IPFS Hash:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">
                        {thesis.ipfsHash}
                      </span>
                    </div>
                  )}
                  {thesis.mintedTimestamp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minted:</span>
                      <span className="text-xs">{new Date(thesis.mintedTimestamp).toLocaleDateString()}</span>
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

          {/* Data Source Info */}
          <Card>
            <CardHeader>
              <CardTitle>Data Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  <span>{dataSource === 'database' ? 'From local database' : 'Live from blockchain'}</span>
                </div>
                <p className="text-muted-foreground">
                  {dataSource === 'database' 
                    ? 'Data is synced from the local RxDB database for fast access'
                    : 'Data is fetched directly from the Camp Network blockchain'}
                </p>
              </div>
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
