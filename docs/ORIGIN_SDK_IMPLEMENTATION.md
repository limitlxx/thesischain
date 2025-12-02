# Origin SDK Implementation Guide

## Overview

This document explains how the Origin SDK is integrated into ThesisChain.Africa and how the "Failed to get signature" issue was resolved.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Root Layout                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              CampProvider                              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         FixOriginProvider                        │  │  │
│  │  │  • Detects wallet provider                       │  │  │
│  │  │  • Sets provider in Origin SDK                   │  │  │
│  │  │  • Listens for account changes                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         App Components                           │  │  │
│  │  │  • Navbar (with CampModal)                       │  │  │
│  │  │  • Mint pages (use useMintThesis)                │  │  │
│  │  │  • Dashboard (use useGetEarnings)                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. CampProvider Setup
**Location**: `components/root-layout-client.tsx`

```tsx
<CampProvider
  clientId={process.env.NEXT_PUBLIC_CAMP_CLIENT_ID}
  environment="DEVELOPMENT"
  redirectUri={window.location.origin}
>
  <FixOriginProvider />
  {children}
</CampProvider>
```

**Purpose**: 
- Provides Origin SDK context to entire app
- Manages authentication state
- Handles JWT token management

### 2. FixOriginProvider Component
**Location**: `lib/camp.ts`

```tsx
export function FixOriginProvider() {
  const { setProvider } = useProvider();
  const auth = useAuth();

  // Set provider on mount
  useEffect(() => {
    // Detect and set correct wallet provider
  }, [setProvider]);

  // Handle account changes
  useEffect(() => {
    // Listen for accountsChanged events
    // Auto-reconnect when needed
  }, [auth]);

  return null;
}
```

**Purpose**:
- Ensures Origin SDK uses correct wallet provider
- Handles multiple wallet extensions gracefully
- Auto-reconnects when user switches accounts
- Prevents JWT/wallet mismatch errors

### 3. CampModal Component
**Location**: `components/navbar.tsx`

```tsx
<CampModal />
```

**Purpose**:
- Provides UI for wallet connection
- Shows user profile when authenticated
- Allows linking social accounts
- Displays Origin stats

### 4. useMintThesis Hook
**Location**: `lib/camp.ts`

```tsx
const { mintThesis } = useMintThesis();

await mintThesis(
  files,
  metadata,
  royaltyBps,
  licensePriceCamp,
  licenseDurationDays,
  progressCallback
);
```

**Purpose**:
- Handles file upload to IPFS via Origin SDK
- Mints IPNFT with license terms
- Tracks minted thesis in MongoDB
- Provides progress updates
- Comprehensive error handling

## Authentication Flow

```
1. User clicks "Connect"
   ↓
2. CampModal opens
   ↓
3. User selects wallet provider
   ↓
4. FixOriginProvider sets provider in Origin SDK
   ↓
5. User signs SIWE message
   ↓
6. Origin SDK returns JWT token
   ↓
7. App stores JWT in localStorage
   ↓
8. User is authenticated ✓
```

## Minting Flow

```
1. User uploads file
   ↓
2. useMintThesis validates file
   ↓
3. Creates license terms
   ↓
4. Calls auth.origin.mintFile()
   ↓
5. Origin SDK:
   - Uploads file to IPFS
   - Generates metadata
   - Requests signature from wallet
   - Registers IPNFT on-chain
   ↓
6. Returns token ID
   ↓
7. App saves to MongoDB
   ↓
8. Success! ✓
```

## Error Handling

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Not authenticated" | No JWT token | Connect wallet |
| "Token expired" | JWT > 24h old | Reconnect wallet |
| "Account mismatch" | Switched accounts | Auto-reconnect triggered |

### Minting Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to get signature" | Provider mismatch | Fixed by FixOriginProvider |
| "Unsupported file type" | Wrong file format | Use supported formats |
| "File too large" | Exceeds size limit | Compress file |
| "Insufficient balance" | Not enough CAMP | Add funds |

### Network Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Network error" | RPC issues | Retry or switch RPC |
| "Transaction failed" | On-chain error | Check gas/balance |
| "Upload failed" | IPFS issues | Retry upload |

## Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_CAMP_CLIENT_ID=your_client_id_here

# Optional (defaults to Camp Testnet)
NEXT_PUBLIC_CAMP_ENVIRONMENT=DEVELOPMENT
```

### License Terms Constraints

```typescript
// Minimum values
price: 1000000000000000 wei (0.001 CAMP)
duration: 86400 seconds (1 day)
royaltyBps: 100 (1%)

// Maximum values
duration: 2628000 seconds (30 days)
royaltyBps: 10000 (100%)
```

### Supported File Types

```typescript
// Images (max 10MB)
image/jpeg, image/jpg, image/png, image/gif, image/webp

// Audio (max 15MB)
audio/mpeg, audio/wav, audio/ogg

// Video (max 20MB)
video/mp4, video/webm

// Text (max 10MB)
text/plain
```

## Best Practices

### 1. Always Validate JWT Before Operations

```typescript
const jwt = auth.origin.getJwt();
if (!jwt) {
  throw new Error("Not authenticated");
}

// Check expiration
const payload = JSON.parse(atob(jwt.split(".")[1]));
if (Date.now() > payload.exp * 1000) {
  throw new Error("Token expired");
}
```

### 2. Handle Account Changes Gracefully

```typescript
// FixOriginProvider handles this automatically
// But you can also listen manually:
window.ethereum.on("accountsChanged", (accounts) => {
  if (accounts[0] !== currentAccount) {
    auth.disconnect();
    auth.connect();
  }
});
```

### 3. Provide Progress Feedback

```typescript
await mintThesis(files, metadata, royaltyBps, price, duration, 
  (progress) => {
    console.log(`Progress: ${progress}%`);
    // Update UI
  }
);
```

### 4. Use Proper Error Messages

```typescript
try {
  await mintThesis(...);
} catch (error) {
  if (error.message.includes("signature")) {
    toast.error("Wallet signature failed", {
      description: "Please try reconnecting your wallet"
    });
  } else {
    toast.error("Minting failed", {
      description: error.message
    });
  }
}
```

## Monitoring

### Key Metrics to Track

1. **Authentication Success Rate**: Should be > 98%
2. **Minting Success Rate**: Should be > 95%
3. **Average Mint Time**: Should be < 30 seconds
4. **Error Rate by Type**: Track most common errors

### Console Logs to Monitor

```
✓ Setting Origin provider to: MetaMask
✓ JWT token verified and valid
✓ Wallet verification passed
Mint successful! Token ID: 123
```

### Error Logs to Alert On

```
❌ mintFile failed: ...
❌ Failed to track IPNFT in MongoDB
⚠️ Account mismatch detected
```

## Troubleshooting

### Issue: Signature Still Failing

1. Check if FixOriginProvider is rendered
2. Verify provider is set correctly (check console)
3. Try disabling other wallet extensions
4. Clear localStorage and reconnect
5. Try incognito mode

### Issue: Slow Minting

1. Check file size (compress if needed)
2. Check network connection
3. Try different RPC endpoint
4. Check IPFS gateway status

### Issue: MongoDB Not Saving

1. Check API route is working
2. Verify MongoDB connection
3. Check data format matches schema
4. Look for validation errors

## Future Improvements

1. **Add retry logic** for failed uploads
2. **Implement queue system** for batch minting
3. **Add file compression** before upload
4. **Cache IPFS uploads** to avoid duplicates
5. **Add analytics** for user behavior
6. **Implement rate limiting** for API calls

## Resources

- [Origin SDK Docs](./origin_sdk.md)
- [Testing Guide](./TESTING_THE_FIX.md)
- [Quick Fix Summary](./QUICK_FIX_SUMMARY.md)
- [Origin SDK Fix Details](./ORIGIN_SDK_FIX.md)
- [Camp Network Docs](https://docs.camp.network)
