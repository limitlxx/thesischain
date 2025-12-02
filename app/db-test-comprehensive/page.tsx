"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle, AlertCircle, Database, FileText, User, Activity } from "lucide-react"
import { getDatabase } from "@/lib/db/rxdb-setup"
import { trackMintedIPNFT, trackForkEvent, trackEarningsEvent, getDatabaseStats } from "@/lib/db/ipnft-operations"
import { ClearDatabaseButton } from "@/components/clear-db-button"

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message?: string
  duration?: number
}

export default function ComprehensiveDatabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'pending' },
    { name: 'Schema Validation', status: 'pending' },
    { name: 'Insert Thesis', status: 'pending' },
    { name: 'Query Thesis', status: 'pending' },
    { name: 'Update Thesis', status: 'pending' },
    { name: 'Track Fork Event', status: 'pending' },
    { name: 'Track Earnings', status: 'pending' },
    { name: 'User Profile Creation', status: 'pending' },
    { name: 'Activity Logging', status: 'pending' },
    { name: 'Database Stats', status: 'pending' },
  ])
  
  const [isRunning, setIsRunning] = useState(false)
  const [dbStats, setDbStats] = useState<any>(null)
  const [testData, setTestData] = useState<any>(null)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ))
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestData(null)
    
    const testTokenId = `test-${Date.now()}`
    const testOwner = '0x1234567890123456789012345678901234567890'
    const testData: any = { tokenId: testTokenId, owner: testOwner }

    try {
      // Test 1: Database Connection
      updateTest(0, { status: 'running' })
      const start1 = Date.now()
      try {
        const db = await getDatabase()
        if (!db) throw new Error('Database is null')
        updateTest(0, { 
          status: 'passed', 
          message: 'Connected successfully',
          duration: Date.now() - start1
        })
      } catch (error) {
        updateTest(0, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start1
        })
        throw error
      }

      // Test 2: Schema Validation
      updateTest(1, { status: 'running' })
      const start2 = Date.now()
      try {
        const db = await getDatabase()
        const collections = ['theses', 'profiles', 'activities']
        const missing = collections.filter(c => !db[c])
        
        if (missing.length > 0) {
          throw new Error(`Missing collections: ${missing.join(', ')}`)
        }
        
        updateTest(1, { 
          status: 'passed', 
          message: 'All collections present',
          duration: Date.now() - start2
        })
      } catch (error) {
        updateTest(1, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start2
        })
        throw error
      }

      // Test 3: Insert Thesis
      updateTest(2, { status: 'running' })
      const start3 = Date.now()
      try {
        await trackMintedIPNFT(
          testTokenId,
          testOwner,
          {
            name: 'Test Thesis',
            description: 'This is a test thesis for database validation',
            image: 'ipfs://test-image-hash',
            attributes: [
              { trait_type: 'University', value: 'Test University' },
              { trait_type: 'Department', value: 'Computer Science' },
              { trait_type: 'Year', value: 2024 }
            ]
          },
          1000, // 10% royalty
          {
            name: 'test-thesis.pdf',
            type: 'application/pdf',
            size: 1024000
          }
        )
        
        updateTest(2, { 
          status: 'passed', 
          message: `Inserted thesis ${testTokenId}`,
          duration: Date.now() - start3
        })
      } catch (error) {
        updateTest(2, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start3
        })
        throw error
      }

      // Test 4: Query Thesis
      updateTest(3, { status: 'running' })
      const start4 = Date.now()
      try {
        const db = await getDatabase()
        const thesis = await db.theses.findOne(testTokenId).exec()
        
        if (!thesis) {
          throw new Error('Thesis not found after insert')
        }
        
        const thesisData = thesis.toJSON()
        if (thesisData.name !== 'Test Thesis') {
          throw new Error('Thesis data mismatch')
        }
        
        testData.thesis = thesisData
        
        updateTest(3, { 
          status: 'passed', 
          message: 'Thesis retrieved successfully',
          duration: Date.now() - start4
        })
      } catch (error) {
        updateTest(3, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start4
        })
        throw error
      }

      // Test 5: Update Thesis
      updateTest(4, { status: 'running' })
      const start5 = Date.now()
      try {
        const db = await getDatabase()
        const thesis = await db.theses.findOne(testTokenId).exec()
        
        if (!thesis) throw new Error('Thesis not found')
        
        await thesis.patch({
          forks: 5,
          updatedAt: Date.now()
        })
        
        const updated = await db.theses.findOne(testTokenId).exec()
        if (updated?.get('forks') !== 5) {
          throw new Error('Update failed')
        }
        
        updateTest(4, { 
          status: 'passed', 
          message: 'Thesis updated successfully',
          duration: Date.now() - start5
        })
      } catch (error) {
        updateTest(4, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start5
        })
        throw error
      }

      // Test 6: Track Fork Event
      updateTest(5, { status: 'running' })
      const start6 = Date.now()
      try {
        const childTokenId = `test-fork-${Date.now()}`
        const forkerAddress = '0x9876543210987654321098765432109876543210'
        
        // First create the child thesis
        await trackMintedIPNFT(
          childTokenId,
          forkerAddress,
          {
            name: 'Forked Test Thesis',
            description: 'Fork of test thesis',
            image: 'ipfs://test-fork-image',
            attributes: [
              { trait_type: 'University', value: 'Test University' },
              { trait_type: 'Department', value: 'Computer Science' },
              { trait_type: 'Year', value: 2024 }
            ]
          },
          1000,
          { name: 'fork.pdf', type: 'application/pdf', size: 1024000 }
        )
        
        // Then track the fork
        await trackForkEvent(testTokenId, childTokenId, forkerAddress)
        
        // Verify fork count increased
        const db = await getDatabase()
        const parent = await db.theses.findOne(testTokenId).exec()
        const forkCount = parent?.get('forks') || 0
        
        if (forkCount < 6) { // Should be at least 6 (5 from update + 1 from fork)
          throw new Error(`Fork count not updated: ${forkCount}`)
        }
        
        testData.childTokenId = childTokenId
        
        updateTest(5, { 
          status: 'passed', 
          message: `Fork tracked, count: ${forkCount}`,
          duration: Date.now() - start6
        })
      } catch (error) {
        updateTest(5, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start6
        })
        throw error
      }

      // Test 7: Track Earnings
      updateTest(6, { status: 'running' })
      const start7 = Date.now()
      try {
        await trackEarningsEvent(
          testOwner,
          testTokenId,
          '10.50',
          '0xtest-transaction-hash'
        )
        
        // Verify earnings activity was created
        const db = await getDatabase()
        const activities = await db.activities
          .find({
            selector: {
              type: 'earned',
              userAddress: testOwner.toLowerCase()
            }
          })
          .exec()
        
        if (activities.length === 0) {
          throw new Error('Earnings activity not created')
        }
        
        updateTest(6, { 
          status: 'passed', 
          message: 'Earnings tracked successfully',
          duration: Date.now() - start7
        })
      } catch (error) {
        updateTest(6, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start7
        })
        throw error
      }

      // Test 8: User Profile Creation
      updateTest(7, { status: 'running' })
      const start8 = Date.now()
      try {
        const db = await getDatabase()
        const profile = await db.profiles.findOne(testOwner.toLowerCase()).exec()
        
        if (!profile) {
          throw new Error('User profile not created')
        }
        
        const profileData = profile.toJSON()
        if (profileData.totalIPNFTs < 1) {
          throw new Error('Profile stats not updated')
        }
        
        testData.profile = profileData
        
        updateTest(7, { 
          status: 'passed', 
          message: `Profile created with ${profileData.totalIPNFTs} IPNFTs`,
          duration: Date.now() - start8
        })
      } catch (error) {
        updateTest(7, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start8
        })
        throw error
      }

      // Test 9: Activity Logging
      updateTest(8, { status: 'running' })
      const start9 = Date.now()
      try {
        const db = await getDatabase()
        const activities = await db.activities
          .find({
            selector: {
              userAddress: testOwner.toLowerCase()
            }
          })
          .exec()
        
        if (activities.length === 0) {
          throw new Error('No activities found')
        }
        
        const activityTypes = activities.map(a => a.get('type'))
        const hasMinimum = activityTypes.includes('minted')
        
        if (!hasMinimum) {
          throw new Error('Missing expected activity types')
        }
        
        testData.activities = activities.map(a => a.toJSON())
        
        updateTest(8, { 
          status: 'passed', 
          message: `Found ${activities.length} activities`,
          duration: Date.now() - start9
        })
      } catch (error) {
        updateTest(8, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start9
        })
        throw error
      }

      // Test 10: Database Stats
      updateTest(9, { status: 'running' })
      const start10 = Date.now()
      try {
        const stats = await getDatabaseStats()
        
        if (stats.theses === 0) {
          throw new Error('No theses in database')
        }
        
        setDbStats(stats)
        
        updateTest(9, { 
          status: 'passed', 
          message: `${stats.theses} theses, ${stats.profiles} profiles, ${stats.activities} activities`,
          duration: Date.now() - start10
        })
      } catch (error) {
        updateTest(9, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start10
        })
        throw error
      }

      setTestData(testData)
      toast.success('All tests passed! ✅')
      
    } catch (error) {
      console.error('Test suite failed:', error)
      toast.error('Test suite failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<string, any> = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const passedCount = tests.filter(t => t.status === 'passed').length
  const failedCount = tests.filter(t => t.status === 'failed').length
  const totalCount = tests.length

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comprehensive Database Test Suite</h1>
        <p className="text-muted-foreground">
          Verify that RxDB is properly configured and all operations work correctly
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>Run tests or clear the database</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
          <ClearDatabaseButton />
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Individual test status and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="font-medium">{test.name}</div>
                    {test.message && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {test.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {test.duration && (
                    <span className="text-xs text-muted-foreground">
                      {test.duration}ms
                    </span>
                  )}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Stats */}
      {dbStats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Database Statistics</CardTitle>
            <CardDescription>Current database contents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{dbStats.theses}</div>
                  <div className="text-sm text-muted-foreground">Theses</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{dbStats.profiles}</div>
                  <div className="text-sm text-muted-foreground">Profiles</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{dbStats.activities}</div>
                  <div className="text-sm text-muted-foreground">Activities</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Data Preview */}
      {testData && (
        <Card>
          <CardHeader>
            <CardTitle>Test Data Preview</CardTitle>
            <CardDescription>Sample data created during tests</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
