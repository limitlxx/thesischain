/**
 * Test MongoDB Connection
 * Run with: node scripts/test-mongodb.js
 */

require('dotenv').config()
const { MongoClient } = require('mongodb')

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...')
  console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Missing')
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    // Connect to MongoDB
    await client.connect()
    console.log('✅ Connected to MongoDB successfully')

    // Get database
    const db = client.db('thesischain')
    console.log('✅ Connected to database: thesischain')

    // List collections
    const collections = await db.listCollections().toArray()
    console.log('\n📚 Collections:')
    collections.forEach(col => {
      console.log(`  - ${col.name}`)
    })

    // Get counts
    console.log('\n📊 Document counts:')
    const thesesCount = await db.collection('theses').countDocuments()
    const profilesCount = await db.collection('profiles').countDocuments()
    const activitiesCount = await db.collection('activities').countDocuments()
    
    console.log(`  - Theses: ${thesesCount}`)
    console.log(`  - Profiles: ${profilesCount}`)
    console.log(`  - Activities: ${activitiesCount}`)

    console.log('\n✅ MongoDB connection test passed!')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n🔌 Connection closed')
  }
}

testConnection()
