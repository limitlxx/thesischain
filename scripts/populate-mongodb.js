/**
 * Script to populate MongoDB with sample data for testing
 * Run with: node scripts/populate-mongodb.js
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

// Sample wallet addresses
const SAMPLE_WALLETS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
  '0x5678901234567890123456789012345678901234'
]

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
  'Behavioral Economics and Decision Making',
  'Deep Learning for Computer Vision',
  'Microbiome Analysis and Human Health',
  'Smart Grid Technology and Energy Distribution',
  'Autonomous Vehicle Navigation Systems',
  'Cancer Immunotherapy Research',
  'Quantum Entanglement and Communication',
  'Social Media Impact on Mental Health',
  'Carbon Capture and Storage Technologies',
  'Robotics in Manufacturing Automation',
  'Genomic Data Privacy and Security'
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

async function populateDatabase() {
  console.log('🚀 Starting MongoDB population...')
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file')
    process.exit(1)
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('thesischain')
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...')
    await db.collection('theses').deleteMany({})
    await db.collection('activities').deleteMany({})
    await db.collection('profiles').deleteMany({})
    
    // Generate sample theses
    console.log('📚 Creating sample IPNFTs...')
    const theses = []
    const now = Date.now()
    
    for (let i = 0; i < 20; i++) {
      const owner = randomElement(SAMPLE_WALLETS)
      const tokenId = generateTokenId()
      const mintedAt = now - randomInt(0, 90) * 24 * 60 * 60 * 1000 // Random date within last 90 days
      
      const thesis = {
        tokenId,
        owner: owner.toLowerCase(),
        author: `Dr. ${['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'][i % 8]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]}`,
        authorWallet: owner.toLowerCase(),
        name: THESIS_TITLES[i],
        description: `This groundbreaking research explores ${THESIS_TITLES[i].toLowerCase()} with novel approaches and methodologies. The findings have significant implications for the field and open new avenues for future research.`,
        university: randomElement(UNIVERSITIES),
        department: randomElement(DEPARTMENTS),
        year: randomInt(2020, 2024),
        royaltyBps: randomInt(100, 1000), // 1% to 10%
        imageUrl: `https://picsum.photos/seed/${i}/400/300`,
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 48)}`,
        fileName: `thesis_${i}.pdf`,
        fileType: 'application/pdf',
        fileSize: randomInt(1000000, 10000000), // 1-10 MB
        forks: randomInt(0, 15),
        parentTokenId: i > 5 && Math.random() > 0.7 ? theses[randomInt(0, i - 1)].tokenId : '',
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
    console.log('📊 Creating sample activities...')
    const activities = []
    
    // Minting activities
    for (const thesis of theses) {
      activities.push({
        id: `mint_${thesis.tokenId}`,
        type: 'minted',
        userAddress: thesis.owner,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: '0',
        timestamp: thesis.mintedAt,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    // Fork activities
    for (const thesis of theses.filter(t => t.parentTokenId)) {
      activities.push({
        id: `fork_${thesis.tokenId}`,
        type: 'forked',
        userAddress: thesis.owner,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: '0',
        timestamp: thesis.mintedAt + 1000,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    // Earning activities
    for (let i = 0; i < 50; i++) {
      const thesis = randomElement(theses)
      const earningAmount = (randomInt(1, 100) / 10).toFixed(2) // $0.1 to $10.0
      
      activities.push({
        id: `earn_${i}_${thesis.tokenId}`,
        type: 'earned',
        userAddress: thesis.owner,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: earningAmount,
        timestamp: now - randomInt(0, 60) * 24 * 60 * 60 * 1000,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    // Share activities
    for (let i = 0; i < 30; i++) {
      const thesis = randomElement(theses)
      
      activities.push({
        id: `share_${i}_${thesis.tokenId}`,
        type: 'shared',
        userAddress: thesis.owner,
        tokenId: thesis.tokenId,
        thesisName: thesis.name,
        amount: '0',
        timestamp: now - randomInt(0, 45) * 24 * 60 * 60 * 1000,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      })
    }
    
    await db.collection('activities').insertMany(activities)
    console.log(`✅ Created ${activities.length} activities`)
    
    // Generate sample user profiles
    console.log('👥 Creating sample user profiles...')
    const profiles = []
    
    for (const wallet of SAMPLE_WALLETS) {
      const userTheses = theses.filter(t => t.owner === wallet.toLowerCase())
      const userEarnings = activities
        .filter(a => a.userAddress === wallet.toLowerCase() && a.type === 'earned')
        .reduce((sum, a) => sum + parseFloat(a.amount), 0)
      
      profiles.push({
        address: wallet.toLowerCase(),
        displayName: `User ${wallet.slice(2, 8)}`,
        bio: 'Researcher and academic contributor',
        university: randomElement(UNIVERSITIES),
        socials: {
          twitter: Math.random() > 0.5 ? `user_${wallet.slice(2, 8)}` : undefined,
          spotify: Math.random() > 0.7 ? `user_${wallet.slice(2, 8)}` : undefined
        },
        totalEarnings: userEarnings,
        totalIPNFTs: userTheses.length,
        totalForks: userTheses.reduce((sum, t) => sum + t.forks, 0),
        updatedAt: now
      })
    }
    
    await db.collection('profiles').insertMany(profiles)
    console.log(`✅ Created ${profiles.length} user profiles`)
    
    // Print summary
    console.log('\n📈 Database Population Summary:')
    console.log(`   - IPNFTs: ${theses.length}`)
    console.log(`   - Activities: ${activities.length}`)
    console.log(`   - User Profiles: ${profiles.length}`)
    console.log(`   - Total Earnings: $${activities.filter(a => a.type === 'earned').reduce((sum, a) => sum + parseFloat(a.amount), 0).toFixed(2)}`)
    console.log('\n✨ MongoDB population complete!')
    
  } catch (error) {
    console.error('❌ Error populating database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('👋 Disconnected from MongoDB')
  }
}

populateDatabase()
