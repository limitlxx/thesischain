# MongoDB Quick Reference - ThesisChain

## Connection Details

**MongoDB URI:** `mongodb+srv://limitlxx:Damilola007@alpha.hcmtmfl.mongodb.net/?appName=Alpha`  
**Database:** `thesischain`

## Collections

### 1. Theses
Stores all minted IPNFTs/theses.

**Schema:**
```typescript
{
  tokenId: string          // Unique token ID from blockchain
  owner: string            // Wallet address (lowercase)
  author: string           // Author name
  authorWallet: string     // Author wallet address
  name: string             // Thesis title
  description: string      // Thesis description
  university: string       // University name
  department: string       // Department name
  year: number            // Year of publication
  royaltyBps: number      // Royalty in basis points (100 = 1%)
  imageUrl: string        // Cover image URL
  ipfsHash: string        // IPFS hash
  fileName: string        // Original file name
  fileType: string        // MIME type
  fileSize: number        // File size in bytes
  forks: number           // Number of forks
  parentTokenId: string   // Parent token ID (for forks)
  mintedAt: number        // Timestamp (ms)
  mintedTimestamp: string // ISO timestamp
  updatedAt: number       // Last update timestamp
  isDeleted: boolean      // Soft delete flag
}
```

**Indexes:**
- `tokenId` (unique)
- `owner + mintedAt`
- `isDeleted + mintedAt`
- Text search on: `name`, `description`, `author`, `university`

### 2. Profiles
User profile information.

**Schema:**
```typescript
{
  address: string         // Wallet address (lowercase, unique)
  displayName: string     // Display name
  bio: string            // User bio
  university: string     // University affiliation
  socials: {
    twitter?: string
    spotify?: string
    tiktok?: string
  }
  totalEarnings: number  // Total earnings in USDC
  totalIPNFTs: number    // Number of IPNFTs owned
  totalForks: number     // Number of forks created
  updatedAt: number      // Last update timestamp
}
```

**Indexes:**
- `address` (unique)
- `totalIPNFTs`
- `totalEarnings`

### 3. Activities
User activity log (mints, forks, earnings).

**Schema:**
```typescript
{
  id: string              // Unique activity ID
  type: string            // 'minted' | 'forked' | 'shared' | 'validated' | 'earned'
  userAddress: string     // User wallet address
  tokenId: string         // Related token ID
  thesisName: string      // Thesis name
  amount: string          // Amount (for earnings)
  timestamp: number       // Activity timestamp
  transactionHash: string // Blockchain transaction hash
}
```

**Indexes:**
- `id` (unique)
- `userAddress + timestamp`
- `type + timestamp`
- `tokenId + timestamp`

## API Routes

### GET /api/theses
Fetch theses with optional filters.

**Query Parameters:**
- `owner` - Filter by owner address
- `tokenId` - Get specific thesis
- `search` - Text search across name, description, author, university

**Example:**
```bash
# Get all theses
curl http://localhost:3000/api/theses

# Get user's theses
curl http://localhost:3000/api/theses?owner=0x123...

# Search theses
curl http://localhost:3000/api/theses?search=blockchain
```

### POST /api/theses
Create a new thesis.

**Body:**
```json
{
  "tokenId": "123",
  "owner": "0x123...",
  "name": "My Thesis",
  "description": "...",
  // ... other fields
}
```

### PATCH /api/theses
Update a thesis.

**Body:**
```json
{
  "tokenId": "123",
  "updates": {
    "forks": 5,
    // or use $inc for increment
    "$inc": { "forks": 1 }
  }
}
```

### GET /api/profiles
Fetch user profiles.

**Query Parameters:**
- `address` - Get specific profile

### POST /api/profiles
Create a new profile.

### PATCH /api/profiles
Update a profile (upsert enabled).

### GET /api/activities
Fetch activities.

**Query Parameters:**
- `userAddress` - Filter by user
- `type` - Filter by activity type

### POST /api/activities
Create a new activity.

### GET /api/stats
Get database statistics.

**Response:**
```json
{
  "theses": 0,
  "profiles": 0,
  "activities": 0
}
```

## Common Operations

### Mint a Thesis
```typescript
// In lib/camp.ts - mintThesis function
const response = await fetch('/api/theses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: originTokenId,
    owner: walletAddress.toLowerCase(),
    name: metadata.name,
    // ... other fields
  })
})
```

### Fork a Thesis
```typescript
// Save forked thesis
await fetch('/api/theses', {
  method: 'POST',
  body: JSON.stringify({
    tokenId: newTokenId,
    parentTokenId: parentTokenId.toString(),
    // ... other fields
  })
})

// Increment parent fork count
await fetch('/api/theses', {
  method: 'PATCH',
  body: JSON.stringify({
    tokenId: parentTokenId.toString(),
    updates: { $inc: { forks: 1 } }
  })
})
```

### Fetch User's Theses
```typescript
// In components - useUserIPNFTs hook
const response = await fetch(`/api/theses?owner=${address.toLowerCase()}`)
const theses = await response.json()
```

### Search Theses
```typescript
const response = await fetch(`/api/theses?search=${encodeURIComponent(query)}`)
const results = await response.json()
```

## Utility Scripts

### Test Connection
```bash
node scripts/test-mongodb.js
```

### Create Indexes
```bash
node scripts/create-indexes.js
```

## MongoDB Atlas Dashboard

Access your database at: https://cloud.mongodb.com/

**Useful Features:**
- **Data Explorer** - Browse collections and documents
- **Performance** - Monitor query performance
- **Metrics** - View database metrics
- **Alerts** - Set up monitoring alerts
- **Backup** - Configure automated backups

## Troubleshooting

### Connection Issues
1. Check `.env` file has `MONGODB_URI`
2. Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for all IPs)
3. Check network connectivity

### Query Performance
1. Use MongoDB Atlas Performance Advisor
2. Check index usage with `.explain()`
3. Monitor slow queries in Atlas

### Data Issues
1. Use Data Explorer to inspect documents
2. Check indexes are created: `node scripts/create-indexes.js`
3. Verify API routes are working with curl/Postman

## Migration from RxDB

If you need to migrate existing RxDB data:

1. Export RxDB data (if any exists in browser)
2. Transform to MongoDB schema
3. Import via API routes or MongoDB Compass

## Best Practices

1. **Always lowercase addresses** - Ensures consistent queries
2. **Use indexes** - Critical for performance
3. **Validate input** - Check data before inserting
4. **Handle errors** - Wrap API calls in try-catch
5. **Monitor usage** - Check MongoDB Atlas metrics regularly
6. **Backup data** - Enable automated backups in Atlas
7. **Use transactions** - For multi-document operations
8. **Paginate results** - Add limit/skip for large datasets

## Next Steps

1. Add pagination to API routes
2. Implement caching (Redis/Vercel KV)
3. Add rate limiting
4. Set up monitoring/alerts
5. Configure automated backups
6. Add data validation schemas
7. Implement soft deletes properly
8. Add audit logging
