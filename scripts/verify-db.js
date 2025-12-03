/**
 * Script to verify MongoDB data
 * Run with: node scripts/verify-db.js
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

async function verifyDatabase() {
  console.log('🔍 Verifying MongoDB data...\n')
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file')
    process.exit(1)
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB\n')
    
    const db = client.db('thesischain')
    
    // Count documents
    const thesesCount = await db.collection('theses').countDocuments()
    const activitiesCount = await db.collection('activities').countDocuments()
    const profilesCount = await db.collection('profiles').countDocuments()
    
    console.log('📊 Collection Counts:')
    console.log(`   - IPNFTs (theses): ${thesesCount}`)
    console.log(`   - Activities: ${activitiesCount}`)
    console.log(`   - User Profiles: ${profilesCount}\n`)
    
    // Get sample thesis
    const sampleThesis = await db.collection('theses').findOne()
    if (sampleThesis) {
      console.log('📚 Sample IPNFT:')
      console.log(`   - Token ID: ${sampleThesis.tokenId}`)
      console.log(`   - Name: ${sampleThesis.name}`)
      console.log(`   - Owner: ${sampleThesis.owner}`)
      console.log(`   - University: ${sampleThesis.university}`)
      console.log(`   - Royalty: ${sampleThesis.royaltyBps / 100}%\n`)
    }
    
    // Get activity breakdown
    const activityTypes = await db.collection('activities').aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray()
    
    console.log('📈 Activity Breakdown:')
    activityTypes.forEach(type => {
      console.log(`   - ${type._id}: ${type.count}`)
    })
    
    // Calculate total earnings
    const earnings = await db.collection('activities').aggregate([
      { $match: { type: 'earned' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]).toArray()
    
    if (earnings.length > 0) {
      console.log(`\n💰 Total Earnings: $${earnings[0].total.toFixed(2)}`)
    }
    
    // List all wallet addresses with data
    const wallets = await db.collection('theses').distinct('owner')
    console.log(`\n👛 Wallets with IPNFTs (${wallets.length}):`)
    wallets.forEach(wallet => {
      console.log(`   - ${wallet}`)
    })
    
    console.log('\n✨ Verification complete!')
    
  } catch (error) {
    console.error('❌ Error verifying database:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

verifyDatabase()
