import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb-setup'
import type { ThesisDocType } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner')
    const tokenId = searchParams.get('tokenId')
    const search = searchParams.get('search')

    const db = await getDatabase()
    const collection = db.collection<ThesisDocType>('theses')

    // Get single thesis by tokenId
    if (tokenId) {
      const thesis = await collection.findOne({ tokenId })
      return NextResponse.json(thesis)
    }

    // Build query
    let query: any = { isDeleted: false }

    if (owner) {
      query.owner = owner.toLowerCase()
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { author: searchRegex },
        { university: searchRegex }
      ]
    }

    // Get all matching theses
    const theses = await collection
      .find(query)
      .sort({ mintedAt: -1 })
      .toArray()

    return NextResponse.json(theses)
  } catch (error) {
    console.error('Error fetching theses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const thesis: ThesisDocType = await request.json()

    console.log('📝 Received thesis data:', {
      tokenId: thesis.tokenId,
      owner: thesis.owner,
      name: thesis.name,
      university: thesis.university
    })

    const db = await getDatabase()
    const collection = db.collection<ThesisDocType>('theses')

    // Check if already exists
    const existing = await collection.findOne({ tokenId: thesis.tokenId })
    if (existing) {
      console.log('⚠️ Thesis already exists:', thesis.tokenId)
      return NextResponse.json(
        { error: 'Thesis already exists' },
        { status: 409 }
      )
    }

    // Insert thesis
    const result = await collection.insertOne(thesis)
    console.log('✅ Thesis inserted successfully:', {
      tokenId: thesis.tokenId,
      insertedId: result.insertedId
    })

    return NextResponse.json({ success: true, thesis })
  } catch (error) {
    console.error('❌ Error creating thesis:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create thesis' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { tokenId, updates } = await request.json()

    const db = await getDatabase()
    const collection = db.collection<ThesisDocType>('theses')

    // Handle $inc operator separately
    const updateOps: any = { $set: { updatedAt: Date.now() } }
    
    if (updates.$inc) {
      updateOps.$inc = updates.$inc
      delete updates.$inc
    }
    
    if (Object.keys(updates).length > 0) {
      updateOps.$set = { ...updateOps.$set, ...updates }
    }

    await collection.updateOne({ tokenId }, updateOps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating thesis:', error)
    return NextResponse.json(
      { error: 'Failed to update thesis' },
      { status: 500 }
    )
  }
}
