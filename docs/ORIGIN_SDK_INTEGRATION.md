# Origin SDK Integration Guide

This document outlines how the Origin SDK is integrated across the ThesisChain.Africa application for wallet provider connectivity and sharing.

## Overview

The Origin SDK (`@campnetwork/origin`) is used throughout the application to:
- Authenticate users with their wallets
- Mint thesis IPNFTs on Camp Network
- Handle royalties and earnings
- Fork existing theses (create derivatives)
- Link social accounts (Twitter, Spotify, TikTok)

## Core Setup

### 1. Root Provider Configuration

**File:** `components/root-layout-client.tsx`

The `CampProvider` wraps the entire application and provides Origin SDK context:

```typescript
import { CampProvider } from "@campnetwork/origin/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function RootLayoutClient({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_CAMP_CLIENT_ID || ""
  
  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider
        clientId={clientId}
        environment="DEVELOPMENT"
        redirectUri={typeof window !== "undefined" ? window.location.origin : ""}
      >
        {children}
      </CampProvider>
    </QueryClientProvider>
  )
}
```

**Key Configuration:**
- `clientId`: Your Camp Network client ID (from environment variables)
- `environment`: "DEVELOPMENT" for testnet, "PRODUCTION" for mainnet
- `redirectUri`: OAuth callback URL for social account linking

### 2. Authentication Hooks

**File:** `lib/wallet.ts`

#### useWalletAddress()

Custom hook to extract the connected wallet address from Origin SDK:

```typescript
export function useWalletAddress() {
  const auth = useAuth()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const getAddress = async () => {
      if (!auth?.origin) {
        setAddress(null)
        return
      }

      try {
        const jwt = auth.origin.getJwt()
        if (jwt) {
          const payload = JSON.parse(atob(jwt.split('.')[1]))
          if (payload.address) {
            setAddress(payload.address)
          }
        }
      } catch (error) {
        console.error("Error getting wallet address:", error)
        setAddress(null)
      }
    }

    getAddress()
  }, [auth])

  return address
}
```

## Navigation & UI Components

### Navbar Integration

**File:** `components/navbar.tsx`

The navbar uses Origin SDK hooks for authentication state and wallet display:

```typescript
import { useAuthState, CampModal } from "@campnetwork/origin/react"
import { useWalletAddress } from "@/lib/wallet"

export function Navbar() {
  const { authenticated, loading: authLoading } = useAuthState()
  const address = useWalletAddress()
  
  // Display wallet address when authenticated
  {authenticated && address && (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
      <span className="text-xs font-mono">{formatAddress(address)}</span>
    </div>
  )}
  
  // Camp Modal for wallet connection and profile management
  <CampModal />
}
```

**Features:**
- Shows connected wallet address
- Displays `CampModal` for authentication
- Redirects to signup page for new users

## Authentication Flow

### Signup Page

**File:** `app/auth/signup/page.tsx`

Handles user onboarding with wallet connection and optional social linking:

```typescript
import { useConnect, useLinkSocials, useAuthState } from "@campnetwork/origin/react"

export default function SignupPage() {
  const { authenticated } = useAuthState()
  const { connect, disconnect } = useConnect()
  const { linkTwitter, linkSpotify } = useLinkSocials()

  const handleWalletOnly = async () => {
    await connect()
    router.push("/dashboard")
  }

  const handleSocial = async (platform: "twitter" | "spotify") => {
    if (!authenticated) {
      await connect()
    }
    
    if (platform === "twitter") {
      await linkTwitter()
    } else {
      await linkSpotify()
    }
    
    router.push("/dashboard")
  }
}
```

### OAuth Callback

**File:** `app/auth/callback/page.tsx`

Handles OAuth redirects after social account linking. The Origin SDK automatically processes the OAuth flow.

## Thesis Minting & Management

### useMintThesis Hook

**File:** `lib/camp.ts`

Handles the complete thesis minting flow using Origin SDK's built-in IPFS upload:

```typescript
export function useMintThesis() {
  const auth = useAuth()

  const mintThesis = async (
    files: File[],
    metadata: Omit<ThesisMetadata, 'files'>,
    royaltyBps: number,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    // 1. Validate royalty bounds
    if (royaltyBps < 100 || royaltyBps > 10000) {
      throw new Error("Royalty must be between 1% (100 BPS) and 100% (10000 BPS)")
    }
    
    // 2. Create license terms
    const license = createLicenseTerms(
      BigInt("1000000000000000"), // 0.001 CAMP
      86400, // 1 day
      royaltyBps,
      zeroAddress
    )
    
    // 3. Mint via Origin SDK (handles IPFS upload internally)
    const originTokenId = await auth.origin.mintFile(
      files[0],
      metadata,
      license,
      undefined,
      { progressCallback }
    )
    
    return originTokenId
  }

  return { mintThesis }
}
```

**Key Points:**
- Origin SDK handles IPFS upload internally via `mintFile()`
- No need for separate NFT.Storage configuration
- Creates validated license terms using `createLicenseTerms`
- Progress callback is passed to Origin SDK
- Returns token ID as string

### useForkThesis Hook

**File:** `lib/camp.ts`

Handles forking (creating derivatives) of existing theses using Origin SDK:

```typescript
export function useForkThesis(parentTokenId: bigint) {
  const auth = useAuth()

  const forkThesis = async (
    newFiles: File[],
    metadata: Omit<ThesisMetadata, 'files'>,
    royaltyBps: number,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    // Create license terms
    const license = createLicenseTerms(
      BigInt("1000000000000000"),
      86400,
      royaltyBps,
      zeroAddress
    )
    
    // Mint as derivative with parent relationship
    const parents: bigint[] = [parentTokenId]
    const originTokenId = await auth.origin.mintFile(
      newFiles[0],
      metadata,
      license,
      parents, // Sets parent for derivative relationship
      { progressCallback }
    )
    
    return originTokenId
  }

  return { forkThesis }
}
```

**Key Points:**
- Accepts `parentTokenId` as bigint
- Creates derivative relationship via `parents` parameter
- Parent receives royalties from derivative sales
- Origin SDK handles IPFS upload internally

## Royalties & Earnings

### useGetEarnings Hook

**File:** `lib/camp.ts`

Fetches royalty information for a specific token:

```typescript
export function useGetEarnings(tokenId: bigint, walletAddress?: string) {
  const auth = useAuth()

  const getEarnings = async () => {
    const royalties = await auth.origin.getRoyalties(
      tokenId, 
      walletAddress as `0x${string}` | undefined
    )

    return {
      pendingRoyalties: royalties?.balance || BigInt(0),
      vaultAddress: royalties?.royaltyVault || royalties?.vault
    }
  }

  return { getEarnings }
}
```

### useClaimRoyalties Hook

**File:** `lib/camp.ts`

Claims accumulated royalties for a token:

```typescript
export function useClaimRoyalties(tokenId: bigint, walletAddress?: string) {
  const auth = useAuth()

  const claimRoyalties = async () => {
    await auth.origin.claimRoyalties(
      tokenId, 
      walletAddress as `0x${string}` | undefined
    )
    toast.success("Royalties claimed successfully!")
  }

  return { claimRoyalties }
}
```

## Mint Wizard Integration

**File:** `components/mint-wizard.tsx`

The mint wizard uses the `useMintThesis` hook:

```typescript
import { useMintThesis } from "@/lib/camp"

export function MintWizard() {
  const { authenticated } = useAuthState()
  const { mintThesis } = useMintThesis()

  const handleMint = async () => {
    if (!authenticated) {
      router.push("/auth/signup")
      return
    }

    const files: File[] = [/* collected files */]
    const metadata = {
      name: formData.title,
      description: formData.abstract,
      attributes: [/* metadata */]
    }
    const royaltyBps = formData.royaltyPercentage * 100

    const tokenId = await mintThesis(
      files,
      metadata,
      royaltyBps,
      (progress) => setUploadProgress(progress)
    )

    router.push(`/thesis/${tokenId}`)
  }
}
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_CAMP_CLIENT_ID=your_client_id_here
```

## Type Definitions

### ThesisMetadata

```typescript
export interface ThesisMetadata {
  name: string
  description: string
  image?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  files: Array<{
    type: 'pdf' | 'code' | 'video'
    cid: string
    name: string
    size: number
  }>
}
```

### LicenseTerms

```typescript
type LicenseTerms = {
  price: bigint        // Price in wei
  duration: number     // Duration in seconds
  royaltyBps: number   // Royalty in basis points (1-10000)
  paymentToken: Address // Payment token address
}
```

## Best Practices

1. **Always check authentication** before calling Origin SDK methods
2. **Use progress callbacks** for better UX during minting
3. **Validate royalty bounds** (100-10000 BPS = 1%-100%)
4. **Handle errors gracefully** with toast notifications
5. **Use bigint for token IDs** when working with Origin SDK methods
6. **Store token IDs as strings** in your database/state

## Common Patterns

### Check if user is authenticated

```typescript
const { authenticated, loading } = useAuthState()

if (!authenticated) {
  // Redirect to signup or show connect button
}
```

### Get wallet address

```typescript
import { useWalletAddress } from "@/lib/wallet"

const address = useWalletAddress()

if (address) {
  // Display or use wallet address
}
```

### Mint with progress tracking

```typescript
const { mintThesis } = useMintThesis()

await mintThesis(files, metadata, royaltyBps, (progress) => {
  console.log(`Progress: ${progress}%`)
  setUploadProgress(progress)
})
```

### Create derivative work

```typescript
const { forkThesis } = useForkThesis(parentTokenId)

await forkThesis(newFiles, metadata, royaltyBps, progressCallback)
```

## Troubleshooting

### "Not authenticated with Origin SDK"
- Ensure user has connected wallet via `connect()` or `CampModal`
- Check that `CampProvider` is wrapping your app

### "Failed to mint thesis - no token ID returned"
- Check network connection
- Verify wallet has sufficient funds
- Ensure files are valid and not too large

### Type errors with token IDs
- Use `bigint` for Origin SDK method parameters
- Convert to string for display: `tokenId.toString()`
- Parse from string: `BigInt(tokenIdString)`

## Additional Resources

- [Origin SDK Documentation](./origin_sdk.md)
- [Camp Network Documentation](https://docs.camp.network)
- [IPFS Integration Guide](../lib/README_IPFS.md)
