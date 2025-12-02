import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb-setup'
import type { ActivityDocType } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userAddress = searchParams.get('userAddress')
    const type = searchParams.get('type')

    const db = await getDatabase()
    const collection = db.collection<ActivityDocType>('activities')

    let query: any = {}

    if (userAddress) {
      query.userAddress = userAddress.toLowerCase()
    }

    if (type) {
      query.type = type
    }

    const activities = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray()

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const activity: ActivityDocType = await request.json()

    const db = await getDatabase()
    const collection = db.collection<ActivityDocType>('activities')

    await collection.insertOne(activity)

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
