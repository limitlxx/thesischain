# Dashboard "No IPNFTs" Issue - Fix Guide

## Problem

Dashboard shows "No IPNFTs Yet" even when theses have been minted.

## Root Cause

The dashboard reads from **localStorage** (`thesischain_ipnfts` key), but:
1. Data might not be saved there
2. Wallet address might not match
3. localStorage might have been cleared

## Quick Diagnosis

### Step 1: Check localStorage
Visit: http://localhost:3000/storage-diagnostic

This will show:
- Total IPNFTs in localStorage
- Your IPNFTs (filtered by wallet)
- Raw localStorage data

### Step 2: Check Console Logs
Open browser console and look for:
```
Found X IPNFTs for address: 0x...
```

If it says "Found 0 IPNFTs", the data isn't in localStorage.

### Step 3: Check Wallet Address
Make sure:
- Wallet is connected (check navbar)
- Same wallet that minted the thesis
- Address matches (case-insensitive)

## Solutions

### Solution 1: Mint a New Thesis (Recommended)

1. Visit http://localhost:3000/mint
2. Fill form and mint
3. Wait for success message
4. Check console for: "✓ IPNFT tracked in localStorage (fallback)"
5. Visit dashboard - should now show the thesis

### Solution 2: Check Storage Diagnostic

1. Visit http://localhost:3000/storage-diagnostic
2. Check "Total IPNFTs" count
3. Check "Your IPNFTs" count
4. If Total > 0 but Your = 0, wallet address doesn't match
5. If Total = 0, localStorage is empty

### Solution 3: Manually Populate localStorage

If you have a token ID but it's not in localStorage:

1. Open browser console
2. Run this (replace with your data):
```javascript
const ipnft = {
  tokenId: "YOUR_TOKEN_ID",
  owner: "YOUR_WALLET_ADDRESS",
  name: "Your Thesis Name",
  description: "Your thesis description",
  royaltyBps: 1000,
  mintedAt: Date.now(),
  metadata: {
    name: "Your Thesis Name",
    description: "Your thesis description",
    image: "ipfs://...",
    attributes: [
      { trait_type: "University", value: "Your University" },
      { trait_type: "Department", value: "Your Department" },
      { trait_type: "Year", value: 2024 }
    ]
  },
  fileInfo: {
    name: "thesis.pdf",
    type: "application/pdf",
    size: 1024000
  }
}

// Get existing data
const existing = JSON.parse(localStorage.getItem('thesischain_ipnfts') || '[]')

// Add new IPNFT
existing.push(ipnft)

// Save back
localStorage.setItem('thesischain_ipnfts', JSON.stringify(existing))

// Reload page
location.reload()
```

## Why This Happens

### During Minting

The mint flow tries to save data in this order:
1. **RxDB** (offline database) - Primary
2. **localStorage** - Fallback if RxDB fails

If RxDB had schema errors (which we fixed), it would fail and fall back to localStorage.

### During Dashboard Load

The dashboard only reads from **localStorage**, not RxDB or blockchain.

This means:
- If RxDB saved but localStorage didn't → Dashboard shows nothing
- If both failed → Dashboard shows nothing
- If localStorage was cleared → Dashboard shows nothing

## Long-term Fix

The dashboard should fetch from Origin SDK (blockchain) instead of localStorage:

```typescript
// Instead of:
const ipnfts = getIPNFTsByOwner(walletAddress) // localStorage

// Should be:
const ipnfts = await fetchUserIPNFTsFromBlockchain(walletAddress) // blockchain
```

This requires:
1. Querying blockchain events
2. Or using an indexer/subgraph
3. Or iterating through token IDs

## Temporary Workaround

For now, the dashboard relies on localStorage being populated during minting.

**To ensure data is saved:**
1. Clear old database: http://localhost:3000/db-test
2. Mint a new thesis
3. Check console for success messages
4. Visit storage diagnostic to verify
5. Visit dashboard to see thesis

## Diagnostic Pages

- `/storage-diagnostic` - Check localStorage contents
- `/db-diagnostic` - Check RxDB contents
- `/db-test-comprehensive` - Run database tests

## Console Commands

### Check localStorage
```javascript
const data = localStorage.getItem('thesischain_ipnfts')
console.log(JSON.parse(data || '[]'))
```

### Clear localStorage
```javascript
localStorage.removeItem('thesischain_ipnfts')
location.reload()
```

### Check wallet address
```javascript
// Should match the owner address in localStorage
console.log('Wallet:', /* your wallet address */)
```

## Expected Behavior

After minting, you should see in console:
```
✅ IPNFT successfully tracked in RxDB database
✓ IPNFT tracked in localStorage (fallback)
```

Then dashboard should show:
- Total IPNFTs count
- Your thesis in "My IPNFTs" tab
- Activity in "Activity" tab

## If Still Not Working

1. Check browser console for errors
2. Visit `/storage-diagnostic` to see what's stored
3. Verify wallet address matches
4. Try minting a new thesis
5. Check that localStorage isn't disabled in browser
6. Try different browser

## Future Improvement

Replace localStorage with blockchain queries:
- Use Origin SDK to query user's IPNFTs
- Or use The Graph subgraph
- Or use blockchain event logs
- This would make dashboard always show latest data
