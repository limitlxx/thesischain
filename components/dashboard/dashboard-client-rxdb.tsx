"use client"

/**
 * Enhanced Dashboard Client using RxDB + Yjs
 * Replaces localStorage with offline-first database
 */

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
import { XIcon } from "lucide-react"

// RxDB Hooks
import { useUserTheses, useUserActivities, useUserProfile, useDatabaseStats } from "@/lib/db/hooks"
import { exportAllData } from "@/lib/db/ipnft-operations"

export function DashboardClientRxDB() {
  const [activeTab, setActiveTab] = useState("overview")
  const auth = useAuth()
  const walletAddress = useWalletAddress()
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)

  // RxDB Queries (reactive - auto-update!)
  const { theses: userIPNFTs, isLoading: isLoadingData } = useUserTheses(walletAddress || undefined)
  const { activities } = useUserActivities(walletAddress || undefined)
  const { profile } = useUserProfile(walletAddress || undefined)
  const dbStats = useDatabaseStats()

  // Wait for auth to be ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingWallet(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Convert RxDB theses to thesis format for ThesisGrid
  const userTheses = userIPNFTs.map(ipnft => ({
    id: ipnft.tokenId,
    title: ipnft.name,
    university: ipnft.university,
    totalEarnings: 0, // TODO: Calculate from activities
    forks: ipnft.forks || 0,
    thumbnail: ipnft.imageUrl || "/placeholder.svg",
    earnings: 0,
    description: ipnft.description,
    royaltyBps: ipnft.royaltyBps,
    mintedAt: ipnft.mintedAt
  }))

  const hasTheses = userTheses.length > 0

  const [pendingValidations] = useState([])

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <CampModal injectButton={false} />
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
              {dbStats.totalTheses > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Database: {dbStats.totalTheses} theses, {dbStats.totalProfiles} profiles, {dbStats.totalActivities} activities
                </p>
              )}
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
                <p className="text-sm text-muted-foreground">Loading your IPNFTs from database...</p>
              </div>
            ) : !hasTheses ? (
              <EmptyState />
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
                        <div className="text-2xl font-bold">
                          ${(profile?.totalEarnings || 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">USDC earned</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Profile & Socials */}
                  <ProfileAndSocials />

                  {/* Recent IPNFTs */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-foreground">Recent IPNFTs</h2>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("ipnfts")}>
                        View All
                      </Button>
                    </div>
                    <ThesisGrid theses={userTheses.slice(0, 3)} />
                  </div>
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

                  <ThesisGrid theses={userTheses} />
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                  <ActivityFeedRxDB activities={activities} />
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <AnalyticsViewRxDB userIPNFTs={userIPNFTs} userTheses={userTheses} />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <SettingsViewRxDB dbStats={dbStats} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// Component implementations continue in next file...


/**
 * Activity Feed using RxDB data
 */
function ActivityFeedRxDB({ activities }: { activities: any[] }) {
  const [displayCount, setDisplayCount] = useState(10)

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
      case 'earned':
        return <BarChart3 className="h-5 w-5" />
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
      case 'earned':
        return 'text-emerald-500 bg-emerald-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getActivityLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const displayedActivities = activities.slice(0, displayCount)
  const hasMore = activities.length > displayCount

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>
          Your recent thesis activities and earnings (from RxDB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
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

                  {activity.amount && activity.amount !== '0' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      +${activity.amount} USDC
                    </p>
                  )}
                </div>
              </div>
            ))}

            {hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDisplayCount(prev => prev + 10)}
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
 * Analytics View using RxDB data
 */
function AnalyticsViewRxDB({ userIPNFTs, userTheses }: { userIPNFTs: any[], userTheses: any[] }) {
  const totalIPNFTs = userIPNFTs.length
  const totalForks = userTheses.reduce((sum, t) => sum + t.forks, 0)
  const avgRoyalty = totalIPNFTs > 0
    ? userIPNFTs.reduce((sum, i) => sum + i.royaltyBps, 0) / totalIPNFTs / 100
    : 0

  // Group by university
  const byUniversity = userIPNFTs.reduce((acc, ipnft) => {
    const uni = ipnft.university || "Unknown"
    acc[uni] = (acc[uni] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by month
  const byMonth = userIPNFTs.reduce((acc, ipnft) => {
    const date = new Date(ipnft.mintedAt)
    const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>IPNFT Statistics</CardTitle>
          <CardDescription>Overview of your research portfolio (RxDB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
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
            {Object.entries(byMonth).map(([month, count]) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Settings View using RxDB
 */
function SettingsViewRxDB({ dbStats }: { dbStats: any }) {
  const handleExport = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thesischain-rxdb-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    } catch (error) {
      toast.error("Failed to export data")
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Database Information (RxDB)</CardTitle>
          <CardDescription>Your offline-first database storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Theses</span>
              <span className="font-medium">{dbStats.totalTheses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Profiles</span>
              <span className="font-medium">{dbStats.totalProfiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Activities</span>
              <span className="font-medium">{dbStats.totalActivities}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or manage your database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExport} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All Data (RxDB)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Download your complete database as JSON for backup or migration
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-semibold mb-2">Database Features:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Offline-first with IndexedDB storage</li>
              <li>Reactive queries (auto-update UI)</li>
              <li>Multi-tab synchronization</li>
              <li>Unlimited storage capacity</li>
              <li>Fast indexed queries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Profile & Socials Component (reused from original)
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
