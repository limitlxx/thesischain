/**
 * Script to add sample data for a specific wallet address
 * Run with: node scripts/add-user-data.js <wallet_address>
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const walletAddress = process.argv[2]

if (!walletAddress) {
  console.error('❌ Please provide a wallet address')
  console.log('Usage: node scripts/add-user-data.js <wallet_address>')
  process.exit(1)
}

// Sample universities
const UNIVERSITIES = [
  'MIT',
  'Stanford University',
  'Harvard University',
  'UC Berkeley',
  'Oxford University',
  'Cambridge University',
  'ETH Zurich',
  'Imperial College London'
]

// Sample departments
const DEPARTMENTS = [
  'Computer Science',
  'Physics',
  'Biology',
  'Chemistry',
  'Mathematics',
  'Engineering',
  'Economics',
  'Psychology'
]

// Sample thesis titles
const THESIS_TITLES = [
  'Machine Learning Applications in Climate Science',
  'Quantum Computing and Cryptography',
  'CRISPR Gene Editing: Ethical Implications',
  'Blockchain Technology in Supply Chain Management',
  'Neural Networks for Natural Language Processing',
  'Renewable Energy Storage Solutions',
  'Artificial Intelligence in Healthcare Diagnostics',
  'Sustainable Urban Development Strategies',
  'Nanotechnology in Drug Delivery Systems',
  'Behavioral Economics and Decision Making'
]

function generateTokenId() {
  return '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0')
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function addUserData() {
  console.log(`🚀 Adding sample data for wallet: ${walletAddress}`)
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file')
    process.exit(1)
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('thesischain')
    const normalizedAddress = walletAddress.toLowerCase()
    
    // Generate sample theses for this user
    console.log('📚 Creating IPNFTs for user...')
    const theses = []
    const now = Date.now()
    
    for (let i = 0; i < 5; i++) {
      const tokenId = generateTokenId()
      const mintedAt = now - randomInt(0, 60) * 24 * 60 * 60 * 1000 // Random date within last 60 days
      
      const thesis = {
        tokenId,
        owner: normalizedAddress,
        author: `Dr. ${['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'][i]} Researcher`,
        authorWallet: normalizedAddress,
        name: THESIS_TITLES[i],
        description: `This groundbreaking research explores ${THESIS_TITLES[i].toLowerCase()} with novel approaches and methodologies. The findings have significant implications for the field and open new avenues for future research.`,
        university: randomElement(UNIVERSITIES),
        department: randomElement(DEPARTMENTS),
        year: randomInt(2021, 2024),
        royaltyBps: randomInt(200, 800), // 2% to 8%
        imageUrl: `https://picsum.photos/seed/${tokenId.slice(2, 10)}/400/300`,
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 48)}`,
        fileName: `thesis_${i}.pdf`,
        fileType: 'application/pdf',
        fileSize: randomInt(2000000, 8000000), // 2-8 MB
        forks: randomInt(0, 10),
        parentTokenId: '',
        mintedAt,
        mintedTimestamp: new Date(mintedAt).toISOString(),
        updatedAt: mintedAt,
        isDeleted: false
      }
      
      theses.push(thesis)
    }
    
    await db.collection('theses').insertMany(theses)
    console.log(`✅ Created ${theses.length} IPNFTs`)
    
    // Generate sample activities
    console.log('📊 Creating activities...')
    const activities = []
    
    // Minting activities
    for (const thesis of theses) {
      activities.push({
        id: `mint_${thesis.tokenId}`,
        type: 'minted',
        userAddress: normalizedAddress,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: '0',
        timestamp: thesis.mintedAt,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    // Earning activities
    for (let i = 0; i < 15; i++) {
      const thesis = randomElement(theses)
      const earningAmount = (randomInt(5, 50) / 10).toFixed(2) // $0.5 to $5.0
      
      activities.push({
        id: `earn_${i}_${thesis.tokenId}`,
        type: 'earned',
        userAddress: normalizedAddress,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: earningAmount,
        timestamp: now - randomInt(0, 45) * 24 * 60 * 60 * 1000,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    // Share activities
    for (let i = 0; i < 8; i++) {
      const thesis = randomElement(theses)
      
      activities.push({
        id: `share_${i}_${thesis.tokenId}`,
        type: 'shared',
        userAddress: normalizedAddress,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: '0',
        timestamp: now - randomInt(0, 30) * 24 * 60 * 60 * 1000,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    await db.collection('activities').insertMany(activities)
    console.log(`✅ Created ${activities.length} activities`)
    
    // Create user profile
    console.log('👥 Creating user profile...')
    const userEarnings = activities
      .filter(a => a.type === 'earned')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0)
    
    const profile = {
      address: normalizedAddress,
      displayName: `User ${walletAddress.slice(2, 8)}`,
      bio: 'Researcher and academic contributor',
      university: randomElement(UNIVERSITIES),
      socials: {
        twitter: `user_${walletAddress.slice(2, 8)}`,
        spotify: undefined
      },
      totalEarnings: userEarnings,
      totalIPNFTs: theses.length,
      totalForks: theses.reduce((sum, t) => sum + t.forks, 0),
      updatedAt: now
    }
    
    // Upsert profile (update if exists, insert if not)
    await db.collection('profiles').updateOne(
      { address: normalizedAddress },
      { $set: profile },
      { upsert: true }
    )
    console.log('✅ Created user profile')
    
    // Print summary
    console.log('\n📈 Summary:')
    console.log(`   - Wallet: ${walletAddress}`)
    console.log(`   - IPNFTs: ${theses.length}`)
    console.log(`   - Activities: ${activities.length}`)
    console.log(`   - Total Earnings: $${userEarnings.toFixed(2)}`)
    console.log('\n✨ User data added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding user data:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('👋 Disconnected from MongoDB')
  }
}

addUserData()
