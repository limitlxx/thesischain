import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb-setup'
import type { ActivityDocType } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userAddress = searchParams.get('userAddress')
    const tokenId = searchParams.get('tokenId')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<ActivityDocType>('activities')

    // Build query for earnings activities
    const query: any = {
      userAddress: userAddress.toLowerCase(),
      type: 'earned'
    }

    if (tokenId) {
      query.tokenId = tokenId
    }

    // Get all earning activities
    const activities = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray()

    // Calculate total earnings
    const totalEarnings = activities.reduce(
      (sum, activity) => sum + parseFloat(activity.amount || '0'),
      0
    )

    // Group earnings by IPNFT
    const earningsByIPNFT = activities.reduce((acc, activity) => {
      if (!acc[activity.tokenId]) {
        acc[activity.tokenId] = {
          tokenId: activity.tokenId,
          thesisName: activity.thesisName,
          totalEarnings: 0,
          count: 0
        }
      }
      acc[activity.tokenId].totalEarnings += parseFloat(activity.amount || '0')
      acc[activity.tokenId].count += 1
      return acc
    }, {} as Record<string, any>)

    // Group earnings by month
    const earningsByMonth = activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp)
      const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += parseFloat(activity.amount || '0')
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalEarnings,
      earningsByIPNFT: Object.values(earningsByIPNFT),
      earningsByMonth,
      recentActivities: activities.slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
