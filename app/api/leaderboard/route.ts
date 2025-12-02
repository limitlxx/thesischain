import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb-setup'
import type { LeaderboardEntry } from '@/lib/db/leaderboard'

interface LeaderboardDoc extends LeaderboardEntry {
  _id?: any
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    const db = await getDatabase()
    const collection = db.collection<LeaderboardDoc>('leaderboard')

    if (address) {
      const entry = await collection.findOne({ address: address.toLowerCase() })
      return NextResponse.json(entry)
    }

    // Get all entries sorted by earnings
    const entries = await collection
      .find()
      .sort({ totalEarnings: -1, totalIPNFTs: -1, totalForks: -1 })
      .toArray()

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { address, updates } = await request.json()

    const db = await getDatabase()
    const collection = db.collection<LeaderboardDoc>('leaderboard')

    await collection.updateOne(
      { address: address.toLowerCase() },
      { 
        $set: { ...updates, lastUpdated: Date.now() },
        $setOnInsert: { address: address.toLowerCase() }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to update leaderboard' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const db = await getDatabase()
    const collection = db.collection<LeaderboardDoc>('leaderboard')

    await collection.deleteMany({})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to clear leaderboard' },
      { status: 500 }
    )
  }
}
