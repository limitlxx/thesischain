"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, RefreshCw } from "lucide-react"
import { getDatabase } from "@/lib/db/rxdb-setup"
import { getDatabaseStats } from "@/lib/db/ipnft-operations"
import { ClearDatabaseButton } from "@/components/clear-db-button"
import { useWalletAddress } from "@/lib/wallet"

export default function DatabaseDiagnostic() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [allTheses, setAllTheses] = useState<any[]>([])
  const [userTheses, setUserTheses] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const walletAddress = useWalletAddress()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("🔍 Loading database data...")
      
      // Get database instance
      const db = await getDatabase()
      console.log("✓ Database connected")
      
      // Get stats
      const dbStats = await getDatabaseStats()
      setStats(dbStats)
      console.log("✓ Stats loaded:", dbStats)
      
      // Get all theses
      const thesesDocs = await db.theses.find().exec()
      const thesesData = thesesDocs.map(doc => doc.toJSON())
      setAllTheses(thesesData)
      console.log(`✓ Found ${thesesData.length} total theses`)
      
      // Get user's theses if wallet connected
      if (walletAddress) {
        const userThesesDocs = await db.theses
          .find({
            selector: {
              owner: walletAddress.toLowerCase()
            }
          })
          .exec()
        const userThesesData = userThesesDocs.map(doc => doc.toJSON())
        setUserTheses(userThesesData)
        console.log(`✓ Found ${userThesesData.length} theses for ${walletAddress}`)
      }
      
      // Get all profiles
      const profilesDocs = await db.profiles.find().exec()
      const profilesData = profilesDocs.map(doc => doc.toJSON())
      setProfiles(profilesData)
      console.log(`✓ Found ${profilesData.length} profiles`)
      
      // Get recent activities
      const activitiesDocs = await db.activities
        .find()
        .sort({ timestamp: 'desc' })
        .limit(20)
        .exec()
      const activitiesData = activitiesDocs.map(doc => doc.toJSON())
      setActivities(activitiesData)
      console.log(`✓ Found ${activitiesData.length} recent activities`)
      
    } catch (err) {
      console.error("❌ Error loading database:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [walletAddress])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading database...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2 text-destructive">Database Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={loadData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <ClearDatabaseButton />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Diagnostic</h1>
        <p className="text-muted-foreground">
          View all data stored in your local RxDB database
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-8">
        <Button onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <ClearDatabaseButton />
        <Button variant="outline" asChild>
          <a href="/db-test-comprehensive">Run Tests</a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Theses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.theses || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Theses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTheses.length}</div>
            {!walletAddress && (
              <p className="text-xs text-muted-foreground mt-1">Connect wallet to see</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profiles || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activities || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Database Connection</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Schema Version</span>
              <Badge variant="outline">v0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage Type</span>
              <Badge variant="outline">Dexie (IndexedDB)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Wallet Address</span>
              <Badge variant="outline" className="font-mono text-xs">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Theses */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Theses ({allTheses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allTheses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No theses in database</p>
              <p className="text-sm mt-2">Mint a thesis to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allTheses.map((thesis) => (
                <div key={thesis.tokenId} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{thesis.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {thesis.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Token: {thesis.tokenId.slice(0, 10)}...</span>
                        <span>Owner: {thesis.owner.slice(0, 6)}...{thesis.owner.slice(-4)}</span>
                        <span>University: {thesis.university}</span>
                        <span>Royalty: {thesis.royaltyBps / 100}%</span>
                        <span>Forks: {thesis.forks}</span>
                      </div>
                    </div>
                    {walletAddress && thesis.owner.toLowerCase() === walletAddress.toLowerCase() && (
                      <Badge>Yours</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Theses */}
      {walletAddress && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Theses ({userTheses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {userTheses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't minted any theses yet</p>
                <Button asChild className="mt-4">
                  <a href="/mint">Mint Your First Thesis</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userTheses.map((thesis) => (
                  <div key={thesis.tokenId} className="p-4 border rounded-lg bg-primary/5">
                    <h3 className="font-semibold">{thesis.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{thesis.description}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span>Token: {thesis.tokenId.slice(0, 10)}...</span>
                      <span>Royalty: {thesis.royaltyBps / 100}%</span>
                      <span>Forks: {thesis.forks}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profiles */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profiles ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No profiles yet
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div key={profile.address} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm">{profile.address}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {profile.totalIPNFTs} IPNFTs • {profile.totalForks} Forks • ${profile.totalEarnings} Earned
                      </div>
                    </div>
                    {walletAddress && profile.address === walletAddress.toLowerCase() && (
                      <Badge>You</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities yet
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="p-3 border rounded text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mr-2">{activity.type}</Badge>
                      <span className="font-medium">{activity.thesisName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {activity.amount !== '0' && (
                    <div className="text-xs text-green-600 mt-1">+${activity.amount}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
