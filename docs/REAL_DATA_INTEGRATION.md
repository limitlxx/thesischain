# Real Data Integration Guide

## Current Limitation

Origin SDK doesn't provide methods to:
- Enumerate all minted IPNFTs
- Get all tokens owned by an address
- Query IPNFTs by attributes

This is a common limitation with NFT contracts that don't implement enumerable extensions.

## Solutions Implemented

### 1. Client-Side Tracking (`lib/ipnft-tracker.ts`)

We track minted IPNFTs in localStorage:
- When user mints an IPNFT, we store: `{ tokenId, owner, name, mintedAt }`
- Dashboard fetches from localStorage
- Search page shows all tracked IPNFTs

**Limitations:**
- Only works on same browser/device
- Clears if user clears browser data
- Doesn't show IPNFTs minted elsewhere

### 2. Origin SDK Data Fetching (`lib/origin-data.ts`)

Hooks to fetch IPNFT data:
- `useIPNFT(tokenId)` - Fetch specific IPNFT
- `useUserIPNFTs(address)` - Get user's balance (but not token IDs)
- Helper functions to format data

## Production Solutions

For production, implement ONE of these:

### Option 1: Backend Database (Recommended)

```typescript
// When user mints:
await fetch('/api/ipnfts', {
  method: 'POST',
  body: JSON.stringify({
    tokenId,
    owner,
    metadata,
    txHash
  })
})

// Dashboard/Search:
const ipnfts = await fetch('/api/ipnfts?owner=0x...')
```

**Pros:**
- Reliable, persistent
- Can add search, filters
- Works across devices

**Cons:**
- Requires backend
- Need to sync with blockchain

### Option 2: The Graph Protocol

Create a subgraph to index Origin SDK events:

```graphql
type IPNFT @entity {
  id: ID!
  tokenId: BigInt!
  owner: Bytes!
  name: String!
  metadata: String!
  mintedAt: BigInt!
}
```

**Pros:**
- Decentralized
- Real-time updates
- Powerful queries

**Cons:**
- Setup complexity
- Hosting costs

### Option 3: Camp Network API

If Camp Network provides an API:

```typescript
const ipnfts = await fetch('https://api.camp.network/ipnfts?owner=0x...')
```

**Pros:**
- No setup needed
- Maintained by Camp

**Cons:**
- Depends on Camp's infrastructure

### Option 4: Event Listening

Listen to blockchain events:

```typescript
// Listen for Transfer events
const filter = contract.filters.Transfer(null, userAddress)
const events = await contract.queryFilter(filter)
```

**Pros:**
- Direct from blockchain
- No intermediary

**Cons:**
- Slow for many events
- RPC rate limits

## Current Implementation

### Dashboard (`components/dashboard/dashboard-client.tsx`)

Currently shows dummy data. To show real data:

```typescript
import { getIPNFTsByOwner } from "@/lib/ipnft-tracker"
import { useWalletAddress } from "@/lib/wallet"
import { useIPNFT } from "@/lib/origin-data"

function DashboardClient() {
  const address = useWalletAddress()
  const [userTheses, setUserTheses] = useState([])

  useEffect(() => {
    if (!address) return
    
    // Get tracked token IDs
    const tracked = getIPNFTsByOwner(address)
    
    // Fetch full data for each
    Promise.all(
      tracked.map(t => fetchIPNFTData(t.tokenId))
    ).then(setUserTheses)
  }, [address])
}
```

### Search Page (`app/search/page.tsx`)

Currently uses Wagmi to fetch from custom contracts. Update to:

```typescript
import { getAllTrackedIPNFTs } from "@/lib/ipnft-tracker"
import { useAuth } from "@campnetwork/origin/react"

function SearchPage() {
  const auth = useAuth()
  const [allTheses, setAllTheses] = useState([])

  useEffect(() => {
    // Get all tracked IPNFTs
    const tracked = getAllTrackedIPNFTs()
    
    // Fetch full data for each
    Promise.all(
      tracked.map(t => fetchIPNFTData(t.tokenId))
    ).then(setAllTheses)
  }, [])
}
```

## Migration Steps

1. **Update `lib/camp.ts`** ✅
   - Track minted IPNFTs in localStorage

2. **Create data fetching utilities** ✅
   - `lib/ipnft-tracker.ts` - localStorage tracking
   - `lib/origin-data.ts` - Origin SDK data fetching

3. **Update Dashboard** (TODO)
   - Fetch user's tracked IPNFTs
   - Display real data
   - Show empty state if no IPNFTs

4. **Update Search Page** (TODO)
   - Fetch all tracked IPNFTs
   - Remove Wagmi contract calls
   - Use Origin SDK data

5. **Add Sync Button** (TODO)
   - Manual refresh to fetch latest data
   - Show last sync time

## Testing

```typescript
// Test tracking
import { trackMintedIPNFT, getIPNFTsByOwner } from '@/lib/ipnft-tracker'

trackMintedIPNFT('1', '0x123...', 'Test Thesis')
const ipnfts = getIPNFTsByOwner('0x123...')
console.log(ipnfts) // [{ tokenId: '1', ... }]
```

## Future Improvements

1. **Add Backend API**
   - Store all minted IPNFTs
   - Provide search/filter endpoints
   - Sync with blockchain events

2. **Implement Caching**
   - Cache IPNFT metadata
   - Reduce IPFS calls
   - Faster load times

3. **Add Real-time Updates**
   - WebSocket for new mints
   - Auto-refresh dashboard
   - Notifications

4. **Better Error Handling**
   - Retry failed fetches
   - Show partial data
   - Offline support

## Known Issues

1. **Cross-Device Sync**
   - IPNFTs minted on device A won't show on device B
   - Solution: Backend database or The Graph

2. **Historical Data**
   - Can't see IPNFTs minted before implementing tracking
   - Solution: Backfill from blockchain events

3. **Performance**
   - Fetching many IPNFTs is slow
   - Solution: Pagination, caching, indexer

## Resources

- [Origin SDK Docs](./origin_sdk.md)
- [The Graph Protocol](https://thegraph.com)
- [IPFS Best Practices](./README_IPFS.md)
