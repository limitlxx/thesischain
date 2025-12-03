# Database Population Scripts

These scripts help you populate MongoDB with sample data for testing the dashboard.

## Prerequisites

Make sure you have:
1. MongoDB connection string in your `.env` file (`MONGODB_URI`)
2. Node.js installed

## Scripts

### 1. Populate Database with Sample Data

Populates the database with 20 sample IPNFTs, activities, and user profiles across 5 different wallet addresses.

```bash
npm run populate-db
```

This will create:
- 20 IPNFTs (research papers)
- ~100+ activities (mints, forks, shares, earnings)
- 5 user profiles
- Sample earnings data

### 2. Add Data for Specific Wallet

Add sample data for your own wallet address:

```bash
node scripts/add-user-data.js <YOUR_WALLET_ADDRESS>
```

Example:
```bash
node scripts/add-user-data.js 0x1234567890123456789012345678901234567890
```

This will create:
- 5 IPNFTs for your wallet
- ~23 activities (mints, shares, earnings)
- User profile with earnings data

## What Gets Created

### IPNFTs (Theses)
- Token ID
- Owner address
- Author name
- Title and description
- University and department
- Year, royalty percentage
- Image URL (from picsum.photos)
- IPFS hash
- File metadata
- Fork count

### Activities
- Minting events
- Fork events
- Share events
- Earning events (with USDC amounts)

### User Profiles
- Display name
- Bio
- University affiliation
- Social links (Twitter, Spotify)
- Total earnings
- Total IPNFTs
- Total forks

## Viewing the Data

After populating the database:

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard:
   ```
   http://localhost:3000/dashboard
   ```

3. Connect your wallet to see your data

## Clearing Data

To clear all data and start fresh, the `populate-mongodb.js` script automatically clears existing data before populating. If you want to keep existing data, comment out these lines in the script:

```javascript
// await db.collection('theses').deleteMany({})
// await db.collection('activities').deleteMany({})
// await db.collection('profiles').deleteMany({})
```

## Troubleshooting

### "MONGODB_URI not found"
Make sure your `.env` file contains:
```
MONGODB_URI=your_mongodb_connection_string_here
```

### "Failed to connect to MongoDB"
- Check your MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas (if using Atlas)
- Verify your network connection

### No data showing in dashboard
- Make sure you're connected with a wallet that has data
- Check browser console for API errors
- Verify MongoDB collections have data using MongoDB Compass or Atlas UI
