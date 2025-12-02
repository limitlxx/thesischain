import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb-setup'

export async function GET() {
  try {
    const db = await getDatabase()

    const [thesesCount, profilesCount, activitiesCount] = await Promise.all([
      db.collection('theses').countDocuments({ isDeleted: false }),
      db.collection('profiles').countDocuments(),
      db.collection('activities').countDocuments()
    ])

    return NextResponse.json({
      theses: thesesCount,
      profiles: profilesCount,
      activities: activitiesCount
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
