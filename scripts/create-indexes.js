/**
 * Create MongoDB Indexes for ThesisChain
 * Run with: node scripts/create-indexes.js
 */

require('dotenv').config()
const { MongoClient } = require('mongodb')

async function createIndexes() {
  console.log('🔍 Creating MongoDB indexes...')
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('thesischain')

    // Theses collection indexes
    console.log('\n📚 Creating indexes for theses collection...')
    await db.collection('theses').createIndex({ tokenId: 1 }, { unique: true })
    console.log('  ✅ tokenId (unique)')
    
    await db.collection('theses').createIndex({ owner: 1, mintedAt: -1 })
    console.log('  ✅ owner + mintedAt')
    
    await db.collection('theses').createIndex({ isDeleted: 1, mintedAt: -1 })
    console.log('  ✅ isDeleted + mintedAt')
    
    await db.collection('theses').createIndex({ 
      name: 'text', 
      description: 'text', 
      author: 'text', 
      university: 'text' 
    })
    console.log('  ✅ text search (name, description, author, university)')

    // Profiles collection indexes
    console.log('\n👤 Creating indexes for profiles collection...')
    await db.collection('profiles').createIndex({ address: 1 }, { unique: true })
    console.log('  ✅ address (unique)')
    
    await db.collection('profiles').createIndex({ totalIPNFTs: -1 })
    console.log('  ✅ totalIPNFTs')
    
    await db.collection('profiles').createIndex({ totalEarnings: -1 })
    console.log('  ✅ totalEarnings')

    // Activities collection indexes
    console.log('\n📊 Creating indexes for activities collection...')
    await db.collection('activities').createIndex({ id: 1 }, { unique: true })
    console.log('  ✅ id (unique)')
    
    await db.collection('activities').createIndex({ userAddress: 1, timestamp: -1 })
    console.log('  ✅ userAddress + timestamp')
    
    await db.collection('activities').createIndex({ type: 1, timestamp: -1 })
    console.log('  ✅ type + timestamp')
    
    await db.collection('activities').createIndex({ tokenId: 1, timestamp: -1 })
    console.log('  ✅ tokenId + timestamp')

    console.log('\n✅ All indexes created successfully!')
  } catch (error) {
    console.error('❌ Failed to create indexes:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n🔌 Connection closed')
  }
}

createIndexes()
