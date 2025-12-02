# IPNFT Fetching Guide

Complete guide for fetching IPNFT data by token ID in ThesisChain.

## Overview

ThesisChain provides multiple ways to fetch IPNFT data:

1. **React Hook** - `useFetchIPNFT()` for components
2. **Utility Functions** - Direct methods in `lib/ipnft-methods.ts`
3. **Origin SDK Direct** - Raw SDK methods via `auth.origin`

## Quick Start

### 1. Using the React Hook (Recommended for Components)

```typescript
import { useFetchIPNFT } from '@/lib/fetch-ipnft'

function MyComponent() {
  const { fetchIPNFT, checkAccess, buyAccess } = useFetchIPNFT()
  
  const loadIPNFT = async (tokenId: string) => {
    try {
      const ipnft = await fetchIPNFT(tokenId)
      console.log('IPNFT Data:', ipnft)
      // Returns: { tokenId, owner, tokenURI, terms, dataStatus, metadata }
    } catch (error) {
      console.error('Failed to fetch:', error)
    }
  }
  
  return <button onClick={() => loadIPNFT('123...')}>Load IPNFT</button>
}
```

### 2. Using Utility Functions

```typescript
import { useAuth } from "@campnetwork/origin/react"
import { getIPNFTById, checkIPNFTAccess, buyIPNFTAccess } from '@/lib/ipnft-methods'

function MyComponent() {
  const auth = useAuth()
  
  const loadIPNFT = async (tokenId: string) => {
    // Get complete IPNFT data
    const ipnft = await getIPNFTById(auth, tokenId)
    
    // Check if user has access
    const accessInfo = await checkIPNFTAccess(auth, tokenId, userAddress)
    
    // Buy access if needed
    if (!accessInfo.hasAccess) {
      await buyIPNFTAccess(auth, tokenId)
    }
  }
}
```

### 3. Using Origin SDK Directly

```typescript
import { useAuth } from "@campnetwork/origin/react"

function MyComponent() {
  const auth = useAuth()
  
  const loadIPNFT = async (tokenId: string) => {
    if (!auth?.origin) return
    
    const owner = await auth.origin.ownerOf(BigInt(tokenId))
    const tokenURI = await auth.origin.tokenURI(BigInt(tokenId))
    const terms = await auth.origin.getTerms(BigInt(tokenId))
    const dataStatus = await auth.origin.dataStatus(BigInt(tokenId))
    
    return { owner, tokenURI, terms, dataStatus }
  }
}
```

## Available Methods

### Core IPNFT Data

#### `getIPNFTById(auth, tokenId)`
Fetches complete IPNFT information including metadata from IPFS.

**Returns:**
```typescript
{
  tokenId: string
  owner: string
  tokenURI: string
  terms: {
    price: bigint
    duration: number
    royaltyBps: number
    paymentToken: string
  }
  dataStatus: any
  metadata?: {
    name: string
    description: string
    image: string
    attributes: any[]
    // ... custom fields
  }
}
```

#### `getIPNFTOwner(auth, tokenId)`
Get the owner address of an IPNFT.

#### `getIPNFTTerms(auth, tokenId)`
Get license terms (price, duration, royalty).

#### `getIPNFTTokenURI(auth, tokenId)`
Get the metadata URI (usually IPFS).

#### `getIPNFTDataStatus(auth, tokenId)`
Get data availability status.

### Access Management

#### `checkIPNFTAccess(auth, tokenId, userAddress)`
Check if a user has access to an IPNFT.

**Returns:**
```typescript
{
  hasAccess: boolean
  expiryTimestamp?: number
  daysRemaining?: number
}
```

#### `buyIPNFTAccess(auth, tokenId)`
Purchase access to an IPNFT (handles payment automatically).

#### `getIPNFTData(auth, tokenId)`
Get the actual IP data (requires access).

### Royalties

#### `getIPNFTRoyalties(auth, tokenId, ownerAddress?)`
Get royalty vault and balance information.

#### `claimIPNFTRoyalties(auth, tokenId, ownerAddress?)`
Claim accumulated royalties.

### Transfers & Approvals

#### `transferIPNFT(auth, from, to, tokenId)`
Transfer IPNFT to another address.

#### `approveIPNFTOperator(auth, operator, approved)`
Approve/revoke operator for all IPNFTs.

#### `isIPNFTOperatorApproved(auth, owner, operator)`
Check if operator is approved.

### User Data

#### `getUserIPNFTBalance(auth, userAddress)`
Get number of IPNFTs owned by an address.

## Formatting Helpers

```typescript
import { 
  formatIPNFTPrice, 
  formatIPNFTDuration, 
  formatIPNFTRoyalty,
  shortenAddress,
  isValidTokenId 
} from '@/lib/fetch-ipnft'

// Format price from bigint to readable string
formatIPNFTPrice(BigInt("1000000000000000")) // "0.001000 CAMP"

// Format duration from seconds to human readable
formatIPNFTDuration(86400) // "1d 0h"
formatIPNFTDuration(3600) // "1h 0m"

// Format royalty from basis points to percentage
formatIPNFTRoyalty(1000) // "10.00%"

// Shorten Ethereum address
shortenAddress("0x1234567890abcdef...") // "0x1234...cdef"

// Validate token ID
isValidTokenId("123456") // true
isValidTokenId("invalid") // false
```

## Implementation in Thesis Page

The thesis page (`app/thesis/[id]/page.tsx`) implements:

1. **Token ID Validation** - Validates the token ID before rendering
2. **Suspense Boundary** - Shows loading state while fetching
3. **Error Handling** - Displays user-friendly error messages

The actual data fetching is handled by `ThesisViewerRxDB` component which:

1. **Tries RxDB first** - Checks local database for cached data
2. **Falls back to Origin SDK** - Fetches from blockchain if not in cache
3. **Reactive updates** - Subscribes to database changes
4. **Automatic caching** - Stores fetched data in RxDB

## Example: Complete IPNFT Viewer

```typescript
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@campnetwork/origin/react"
import { getIPNFTById, checkIPNFTAccess, buyIPNFTAccess } from "@/lib/ipnft-methods"
import { formatIPNFTPrice, formatIPNFTDuration } from "@/lib/fetch-ipnft"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function IPNFTViewer({ tokenId }: { tokenId: string }) {
  const auth = useAuth()
  const [ipnft, setIpnft] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function load() {
      if (!auth?.origin) return
      
      setLoading(true)
      try {
        // Fetch IPNFT data
        const data = await getIPNFTById(auth, tokenId)
        setIpnft(data)
        
        // Check access
        const userAddress = await auth.origin.ownerOf(BigInt(tokenId))
        const access = await checkIPNFTAccess(auth, tokenId, userAddress)
        setHasAccess(access.hasAccess)
      } catch (error) {
        console.error('Error loading IPNFT:', error)
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [auth, tokenId])
  
  const handleBuyAccess = async () => {
    try {
      await buyIPNFTAccess(auth, tokenId)
      setHasAccess(true)
    } catch (error) {
      console.error('Failed to buy access:', error)
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (!ipnft) return <div>IPNFT not found</div>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ipnft.metadata?.name || 'Untitled'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="font-mono text-xs">{ipnft.owner}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-bold">{formatIPNFTPrice(ipnft.terms.price)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p>{formatIPNFTDuration(ipnft.terms.duration)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Royalty</p>
            <p>{ipnft.terms.royaltyBps / 100}%</p>
          </div>
          
          {!hasAccess && (
            <Button onClick={handleBuyAccess} className="w-full">
              Buy Access for {formatIPNFTPrice(ipnft.terms.price)}
            </Button>
          )}
          
          {hasAccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ You have access to this IPNFT
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Best Practices

1. **Always validate token IDs** before fetching
2. **Use caching** to reduce blockchain calls
3. **Handle errors gracefully** with user-friendly messages
4. **Check authentication** before calling Origin SDK methods
5. **Use BigInt** for token IDs and prices
6. **Implement loading states** for better UX
7. **Cache IPFS metadata** to avoid repeated fetches

## Troubleshooting

### "Not authenticated with Origin SDK"
- Ensure user is connected via CampModal or auth.connect()
- Check that auth.origin is available

### "Invalid token ID"
- Use `isValidTokenId()` to validate before fetching
- Ensure token ID is a valid positive number

### "IPNFT not found"
- Token may not exist on the blockchain
- Check network (testnet vs mainnet)
- Verify token ID is correct

### IPFS metadata not loading
- IPFS can be slow, implement timeouts
- Use fallback to tokenURI if metadata fails
- Consider using IPFS gateway alternatives

## Related Files

- `lib/fetch-ipnft.ts` - React hook and formatting utilities
- `lib/ipnft-methods.ts` - Direct utility functions
- `lib/db/rxdb-setup.ts` - Local database schema
- `components/thesis/thesis-viewer-rxdb.tsx` - Example implementation
- `app/thesis/[id]/page.tsx` - Thesis detail page

## Resources

- [Origin SDK Documentation](./docs/origin_sdk.md)
- [RxDB Documentation](https://rxdb.info/)
- [IPFS Documentation](https://docs.ipfs.tech/)
