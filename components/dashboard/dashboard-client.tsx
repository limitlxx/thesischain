"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSidebar } from "./dashboard-sidebar"
import { ThesisGrid } from "./thesis-grid"
import { EarningsChart } from "./earnings-chart"
import { EarningsSummary } from "./earnings-summary"
import { ValidationRequests } from "./validation-requests"
import { EmptyState } from "./empty-state"
import { useSocials, useLinkSocials, CampModal, useAuth } from "@campnetwork/origin/react"
import { toast } from "sonner"
import { Music, Video, Loader2, FileText, GitFork, Share2, CheckCircle, BarChart3, Settings, Image, FileAudio, FileVideo, Download, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Navbar } from "@/components/navbar"
import { useWalletAddress } from "@/lib/wallet"
import { useUserIPNFTs } from "@/lib/db/hooks"
import type { ThesisDocType } from "@/lib/db/types"
import { XIcon } from "lucide-react"

export function DashboardClient() {
  const [activeTab, setActiveTab] = useState("overview")
  const auth = useAuth()
  const walletAddress = useWalletAddress()
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)

  // Wait for auth to be ready
  useEffect(() => {
    // Give auth time to initialize
    const timer = setTimeout(() => {
      setIsLoadingWallet(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Load user's IPNFTs from RxDB (with live updates)
  const { ipnfts: userIPNFTs, isLoading: isLoadingData } = useUserIPNFTs(walletAddress)

  // Fetch user earnings data
  const [earningsData, setEarningsData] = useState<any>(null)
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    if (!walletAddress) return

    async function loadEarnings() {
      try {
        const response = await fetch(`/api/earnings?userAddress=${walletAddress?.toLowerCase() || ''}`)
        if (response.ok) {
          const data = await response.json()
          setEarningsData(data)
          setTotalEarnings(data.totalEarnings || 0)
        }
      } catch (error) {
        console.error('Failed to load earnings:', error)
      }
    }

    loadEarnings()
  }, [walletAddress])

  // Convert ThesisDocType to thesis format for ThesisGrid
  const userTheses = userIPNFTs.map(ipnft => {
    // Get earnings for this specific IPNFT from earnings data
    const ipnftEarning = earningsData?.earningsByIPNFT?.find(
      (e: any) => e.tokenId === ipnft.tokenId
    )
    const ipnftEarnings = ipnftEarning?.totalEarnings || 0

    return {
      id: ipnft.tokenId,
      title: ipnft.name,
      university: ipnft.university,
      totalEarnings: ipnftEarnings,
      forks: ipnft.forks,
      thumbnail: ipnft.imageUrl || "/placeholder.svg",
      earnings: ipnftEarnings,
      description: ipnft.description,
      royaltyBps: ipnft.royaltyBps,
      mintedAt: ipnft.mintedAt,
      author: ipnft.author
    }
  })

  // Fetch pending validations from activities
  const [pendingValidations, setPendingValidations] = useState<any[]>([])

  useEffect(() => {
    if (!walletAddress) return

    async function loadValidations() {
      try {
        const response = await fetch(`/api/activities?userAddress=${walletAddress?.toLowerCase() || ''}&type=validated`)
        if (response.ok) {
          const validations = await response.json()
          setPendingValidations(validations)
        }
      } catch (error) {
        console.error('Failed to load validations:', error)
      }
    }

    loadValidations()
  }, [walletAddress])

  const hasTheses = userTheses.length > 0

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        {/* Camp Modal for social linking */}
        <CampModal injectButton={false} />
        
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="mt-2 text-foreground/60">
              {walletAddress ? (
                <>Manage your IPNFTs and track your research impact</>
              ) : (
                <>Connect your wallet to view your dashboard</>
              )}
            </p>
          </div>

          {isLoadingWallet ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Checking wallet connection...</p>
            </div>
          ) : !auth?.origin ? (
            <Card className="border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-muted-foreground mb-4">Please connect your wallet to view your dashboard</p>
                <Button asChild>
                  <a href="/auth/signup">Connect Wallet</a>
                </Button>
              </CardContent>
            </Card>
          ) : !walletAddress ? (
            <Card className="border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-muted-foreground mb-4">Unable to detect wallet address</p>
                <p className="text-sm text-muted-foreground mb-4">Please try disconnecting and reconnecting your wallet</p>
                <Button asChild>
                  <a href="/auth/signup">Reconnect Wallet</a>
                </Button>
              </CardContent>
            </Card>
          ) : isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading your IPNFTs...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 max-w-3xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ipnfts">My IPNFTs</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total IPNFTs</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userIPNFTs.length}</div>
                      <p className="text-xs text-muted-foreground">Minted research papers</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
                      <GitFork className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userTheses.reduce((sum, t) => sum + t.forks, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Research derivatives</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Royalty</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userIPNFTs.length > 0 
                          ? (userIPNFTs.reduce((sum, i) => sum + i.royaltyBps, 0) / userIPNFTs.length / 100).toFixed(1)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Per IPNFT</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">USDC earned</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile & Socials Section */}
                <ProfileAndSocials />

                {/* Recent IPNFTs or Empty State */}
                {hasTheses ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-foreground">Recent IPNFTs</h2>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("ipnfts")}>
                        View All
                      </Button>
                    </div>
                    <ThesisGrid theses={userTheses.slice(0, 3)} />
                  </div>
                ) : (
                  <Card className="border-border/40">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No IPNFTs Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                        Start your research journey by minting your first IPNFT. Transform your academic work into a valuable digital asset.
                      </p>
                      <Button asChild>
                        <a href="/mint">Mint Your First IPNFT</a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* IPNFTs Tab */}
              <TabsContent value="ipnfts" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">All Your IPNFTs</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      You have {userIPNFTs.length} minted research paper{userIPNFTs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/mint">Mint New IPNFT</a>
                  </Button>
                </div>
                
                {/* IPNFT List with Details */}
                {userIPNFTs.length > 0 ? (
                  <div className="space-y-4">
                    {userIPNFTs.map((ipnft) => (
                      <IPNFTCard key={ipnft.tokenId} ipnft={ipnft} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-border/40">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No IPNFTs Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                        You haven't minted any IPNFTs yet. Start by uploading your research work.
                      </p>
                      <Button asChild>
                        <a href="/mint">Mint Your First IPNFT</a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <ActivityFeed walletAddress={walletAddress} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsView 
                  userIPNFTs={userIPNFTs} 
                  userTheses={userTheses}
                  earningsData={earningsData}
                  totalEarnings={totalEarnings}
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <SettingsView userIPNFTs={userIPNFTs} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      </div>
    </>
  )
}

/**
 * Activity Feed Section Component
 * Displays user's IPNFT activities (mints, forks, shares)
 */
function ActivityFeed({ walletAddress }: { walletAddress: string | null }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => {
    if (!walletAddress) {
      setIsLoading(false)
      return
    }

    async function loadActivities() {
      try {
        // Get user's activities from MongoDB via API
        const response = await fetch(`/api/activities?userAddress=${walletAddress?.toLowerCase() || ''}`)
        if (!response.ok) throw new Error('Failed to fetch activities')
        
        const data = await response.json()
        setActivities(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load activities:', error)
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [walletAddress])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'minted':
        return <FileText className="h-5 w-5" />
      case 'forked':
        return <GitFork className="h-5 w-5" />
      case 'shared':
        return <Share2 className="h-5 w-5" />
      case 'validated':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'minted':
        return 'text-blue-500 bg-blue-500/10'
      case 'forked':
        return 'text-purple-500 bg-purple-500/10'
      case 'shared':
        return 'text-green-500 bg-green-500/10'
      case 'validated':
        return 'text-yellow-500 bg-yellow-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'minted':
        return 'Minted'
      case 'forked':
        return 'Forked'
      case 'shared':
        return 'Shared'
      case 'validated':
        return 'Validated'
      default:
        return 'Activity'
    }
  }

  const displayedActivities = activities.slice(0, displayCount)
  const hasMore = activities.length > displayCount

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>
          Your recent thesis activities and earnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities yet. Start by minting your first thesis!
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {getActivityLabel(activity.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground/80 truncate">
                    {activity.thesisName}
                  </p>
                  
                  {activity.earnings !== '0' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      +${activity.earnings} USDC
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDisplayCount(prev => prev + 5)}
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Profile & Socials Section Component
 * Displays linked social accounts and allows linking/unlinking
 */
function ProfileAndSocials() {
  const { data: socials, isLoading, error } = useSocials()
  const { 
    linkTwitter, 
    linkSpotify, 
    linkTiktok, 
    unlinkTwitter, 
    unlinkSpotify, 
    unlinkTiktok 
  } = useLinkSocials()
  const [unlinkingPlatform, setUnlinkingPlatform] = useState<string | null>(null)

  const handleUnlink = async (platform: 'twitter' | 'spotify' | 'tiktok') => {
    setUnlinkingPlatform(platform)
    try {
      if (platform === 'twitter') {
        await unlinkTwitter()
        toast.success("X (Twitter) unlinked successfully")
      } else if (platform === 'spotify') {
        await unlinkSpotify()
        toast.success("Spotify unlinked successfully")
      } else if (platform === 'tiktok') {
        await unlinkTiktok()
        toast.success("TikTok unlinked successfully")
      }
    } catch (error) {
      toast.error(`Failed to unlink ${platform}`, {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setUnlinkingPlatform(null)
    }
  }

  const linkedSocials = socials as { twitter?: boolean; spotify?: boolean; tiktok?: boolean } | undefined
  
  const socialPlatforms = [
    {
      name: 'X (Twitter)',
      key: 'twitter' as const,
      icon: XIcon,
      color: 'text-foreground',
      bgColor: 'bg-foreground/10',
      isLinked: linkedSocials?.twitter ?? false,
      linkAction: () => linkTwitter(),
      unlinkAction: () => handleUnlink('twitter')
    },
    {
      name: 'Spotify',
      key: 'spotify' as const,
      icon: Music,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      isLinked: linkedSocials?.spotify ?? false,
      linkAction: () => linkSpotify(),
      unlinkAction: () => handleUnlink('spotify')
    },
    {
      name: 'TikTok',
      key: 'tiktok' as const,
      icon: Video,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      isLinked: linkedSocials?.tiktok ?? false,
      linkAction: () => {
        // TikTok requires a handle, so we'll prompt for it
        const handle = prompt("Enter your TikTok handle:")
        if (handle) {
          linkTiktok(handle)
        }
      },
      unlinkAction: () => handleUnlink('tiktok')
    }
  ]

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Profile & Socials</CardTitle>
        <CardDescription>
          Link your social accounts to increase your visibility and credibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Failed to load social accounts
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon
              const isUnlinking = unlinkingPlatform === platform.key
              
              return (
                <div
                  key={platform.key}
                  className={`flex flex-col items-center justify-between p-4 rounded-lg border ${
                    platform.isLinked ? 'border-green-500/50 bg-green-500/5' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 mb-3">
                    <div className={`p-3 rounded-full ${platform.bgColor}`}>
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                    </div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <span
                      className={`text-sm ${
                        platform.isLinked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}
                    >
                      {platform.isLinked ? 'Linked' : 'Not Linked'}
                    </span>
                  </div>
                  
                  {platform.isLinked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={platform.unlinkAction}
                      disabled={isUnlinking}
                      className="w-full"
                    >
                      {isUnlinking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unlinking...
                        </>
                      ) : (
                        'Unlink'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={platform.linkAction}
                      className="w-full"
                    >
                      Link {platform.name}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * IPNFT Card Component
 * Displays detailed information about a single IPNFT
 */
function IPNFTCard({ ipnft }: { ipnft: ThesisDocType }) {
  const getFileIcon = (type?: string) => {
    if (!type) return <FileText className="h-5 w-5" />
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />
    if (type.startsWith('audio/')) return <FileAudio className="h-5 w-5" />
    if (type.startsWith('video/')) return <FileVideo className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  return (
    <Card className="border-border/40 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {ipnft.imageUrl ? (
              <img 
                src={ipnft.imageUrl} 
                alt={ipnft.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                {getFileIcon(ipnft.fileType)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{ipnft.name}</h3>
                {ipnft.author && (
                  <p className="text-xs text-muted-foreground">by {ipnft.author}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {ipnft.description}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/thesis/${ipnft.tokenId}`}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Token ID:</span>{" "}
                <span className="font-mono text-xs">{ipnft.tokenId.slice(0, 10)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">University:</span>{" "}
                <span>{ipnft.university}</span>
              </div>
              {ipnft.department && (
                <div>
                  <span className="text-muted-foreground">Department:</span>{" "}
                  <span>{ipnft.department}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Year:</span>{" "}
                <span>{ipnft.year}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Royalty:</span>{" "}
                <span>{ipnft.royaltyBps / 100}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Minted:</span>{" "}
                <span>{formatDistanceToNow(ipnft.mintedAt, { addSuffix: true })}</span>
              </div>
            </div>

            {/* File Info */}
            {ipnft.fileName && (
              <div className="mt-3 text-xs text-muted-foreground">
                File: {ipnft.fileName} ({(ipnft.fileSize / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Analytics View Component
 * Shows charts and statistics about user's IPNFTs
 */
function AnalyticsView({ 
  userIPNFTs, 
  userTheses, 
  earningsData,
  totalEarnings 
}: { 
  userIPNFTs: ThesisDocType[], 
  userTheses: any[],
  earningsData: any,
  totalEarnings: number
}) {
  // Calculate statistics
  const totalIPNFTs = userIPNFTs.length
  const totalForks = userTheses.reduce((sum, t) => sum + t.forks, 0)
  const avgRoyalty = totalIPNFTs > 0 
    ? userIPNFTs.reduce((sum, i) => sum + i.royaltyBps, 0) / totalIPNFTs / 100
    : 0

  // Group by university
  const byUniversity = userIPNFTs.reduce((acc, ipnft) => {
    acc[ipnft.university] = (acc[ipnft.university] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by month
  const byMonth = userIPNFTs.reduce((acc, ipnft) => {
    const date = new Date(ipnft.mintedAt)
    const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get earnings by month from earnings data
  const earningsByMonth = earningsData?.earningsByMonth || {}

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>IPNFT Statistics</CardTitle>
          <CardDescription>Overview of your research portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">{totalIPNFTs}</div>
              <div className="text-sm text-muted-foreground">Total IPNFTs Minted</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{totalForks}</div>
              <div className="text-sm text-muted-foreground">Total Forks</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{avgRoyalty.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Average Royalty</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${totalEarnings.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>IPNFTs by University</CardTitle>
          <CardDescription>Distribution across institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(byUniversity).map(([uni, count]) => (
              <div key={uni} className="flex items-center justify-between">
                <span className="text-sm">{uni}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${(count / totalIPNFTs) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Minting Timeline</CardTitle>
          <CardDescription>IPNFTs minted over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(byMonth).length > 0 ? (
              Object.entries(byMonth).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm">{month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(count / totalIPNFTs) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No minting activity yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Earnings by IPNFT */}
      {earningsData?.earningsByIPNFT && earningsData.earningsByIPNFT.length > 0 && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Earnings by IPNFT</CardTitle>
            <CardDescription>Revenue generated from each research paper</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earningsData.earningsByIPNFT
                .sort((a: any, b: any) => b.totalEarnings - a.totalEarnings)
                .map((item: any) => (
                  <div key={item.tokenId} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{item.thesisName}</span>
                      <span className="text-xs text-muted-foreground">{item.count} earnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(item.totalEarnings / totalEarnings) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right text-green-600 dark:text-green-400">
                        ${item.totalEarnings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Timeline */}
      {Object.keys(earningsByMonth).length > 0 && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Earnings Timeline</CardTitle>
            <CardDescription>Revenue earned over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(earningsByMonth)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([month, amount]) => {
                  const amountNum = typeof amount === 'number' ? amount : parseFloat(String(amount))
                  return (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm">{month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500"
                            style={{ width: `${(amountNum / totalEarnings) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right text-green-600 dark:text-green-400">
                          ${amountNum.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Settings View Component
 * Manage data and preferences
 */
function SettingsView({ userIPNFTs }: { userIPNFTs: ThesisDocType[] }) {
  const [stats, setStats] = useState({ 
    totalTheses: 0, 
    totalActivities: 0,
    totalProfiles: 0,
    userIPNFTs: 0,
    estimatedSizeMB: '0'
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        
        // Calculate estimated size (rough estimate based on document counts)
        const estimatedSize = (
          (data.theses || 0) * 0.05 + // ~50KB per thesis
          (data.activities || 0) * 0.002 + // ~2KB per activity
          (data.profiles || 0) * 0.01 // ~10KB per profile
        ).toFixed(2)
        
        setStats({
          totalTheses: data.theses || 0,
          totalActivities: data.activities || 0,
          totalProfiles: data.profiles || 0,
          userIPNFTs: userIPNFTs.length,
          estimatedSizeMB: estimatedSize
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    loadStats()
  }, [userIPNFTs.length])

  const handleExport = async () => {
    try {
      // Export all theses from MongoDB
      const response = await fetch('/api/theses')
      if (!response.ok) throw new Error('Failed to fetch theses')
      const theses = await response.json()
      
      const data = JSON.stringify({ theses, exportedAt: new Date().toISOString() }, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thesischain-database-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Database exported successfully")
    } catch (error) {
      toast.error("Failed to export database")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
          <CardDescription>MongoDB storage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your IPNFTs</span>
              <span className="font-medium">{stats.userIPNFTs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total IPNFTs in Database</span>
              <span className="font-medium">{stats.totalTheses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Activities</span>
              <span className="font-medium">{stats.totalActivities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-medium">{stats.totalProfiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Database Size</span>
              <span className="font-medium">~{stats.estimatedSizeMB} MB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or manage your IPNFT data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExport} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All IPNFTs
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Download your IPNFT data as JSON for backup or migration
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Data is stored in MongoDB and synced across all users. Additional features:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Real-time activity tracking</li>
              <li>Earnings and royalty calculations</li>
              <li>Leaderboard rankings</li>
              <li>IPFS metadata storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
