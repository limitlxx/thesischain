import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb-setup'
import type { UserProfileDocType } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    const db = await getDatabase()
    const collection = db.collection<UserProfileDocType>('profiles')

    if (address) {
      const profile = await collection.findOne({ address: address.toLowerCase() })
      return NextResponse.json(profile)
    }

    const profiles = await collection.find().toArray()
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile: UserProfileDocType = await request.json()
    profile.address = profile.address.toLowerCase()

    const db = await getDatabase()
    const collection = db.collection<UserProfileDocType>('profiles')

    await collection.insertOne(profile)

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { address, updates } = await request.json()

    const db = await getDatabase()
    const collection = db.collection<UserProfileDocType>('profiles')

    await collection.updateOne(
      { address: address.toLowerCase() },
      { 
        $set: { ...updates, updatedAt: Date.now() },
        $setOnInsert: { address: address.toLowerCase() }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
