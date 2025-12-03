const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri?.replace(/:[^:@]+@/, ':****@')); // Hide password
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log('Connecting...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    const db = client.db('thesischain');
    const collections = await db.listCollections().toArray();
    
    console.log('📚 Collections:', collections.map(c => c.name));
    
    const thesesCount = await db.collection('theses').countDocuments();
    console.log('📄 Theses count:', thesesCount);
    
    await client.close();
    console.log('✅ Connection test complete');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
