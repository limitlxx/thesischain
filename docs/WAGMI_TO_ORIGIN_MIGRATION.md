# Wagmi to Origin SDK Migration

This document outlines the migration from Wagmi to Origin SDK for wallet connectivity across the ThesisChain.Africa application.

## Summary of Changes

### 1. Removed Wagmi Dependencies

**Components Updated:**
- `components/dashboard/earnings-summary.tsx` - Removed Wagmi hooks, using Origin SDK
- `components/thesis/thesis-viewer.tsx` - Temporarily disabled Wagmi hooks (validation features)

**Hooks Removed:**
- `useAccount` → Replaced with `useWalletAddress()` from `lib/wallet.ts`
- `useReadContract` → To be replaced with Origin SDK methods
- `useWriteContract` → To be replaced with Origin SDK methods
- `useWaitForTransactionReceipt` → To be replaced with Origin SDK transaction handling

### 2. New Wallet Address Hook

**File:** `lib/wallet.ts`

Created a dedicated hook to extract wallet address from Origin SDK:

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

### 3. Fixed Signup Flow

**File:** `app/auth/signup/page.tsx`

**Problem:** Direct `connect()` calls were failing with "Cannot read properties of null (reading 'requestAddresses')"

**Solution:** Use `useModal()` hook to open the Camp Modal, which handles provider selection internally:

```typescript
const { openModal } = useModal()

const handleWalletOnly = () => {
  if (!university) {
    toast.error("Select university first")
    return
  }
  
  // Open the Camp modal for wallet connection
  openModal()
}
```

**Key Changes:**
- Removed direct `connect()` calls
- Use `openModal()` to trigger wallet connection
- Store pending social link intent and execute after authentication
- Let `CampModal` handle provider selection and connection

### 4. Added Page Loading States

Created loading states for all major routes to improve UX during navigation:

**New Files:**
- `components/page-loader.tsx` - Reusable loading component
- `app/loading.tsx` - Root loading state
- `app/dashboard/loading.tsx` - Dashboard loading
- `app/search/loading.tsx` - Search loading
- `app/leaderboard/loading.tsx` - Leaderboard loading
- `app/thesis/loading.tsx` - Thesis viewer loading
- `app/mint/loading.tsx` - Mint wizard loading

**Component:**
```typescript
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent-deep" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
```

### 5. Earnings Summary Updates

**File:** `components/dashboard/earnings-summary.tsx`

**Changes:**
- Removed Wagmi hooks (`useAccount`, `useReadContract`, `useWriteContract`)
- Using `useAuthState()` and `useWalletAddress()` from Origin SDK
- Changed currency from USDC to CAMP
- Placeholder implementation for earnings fetching (to be implemented with Origin SDK)

**TODO:**
- Implement fetching earnings via Origin SDK's `getRoyalties()` method
- Implement claiming royalties via Origin SDK's `claimRoyalties()` method

### 6. Thesis Viewer Updates

**File:** `components/thesis/thesis-viewer.tsx`

**Changes:**
- Temporarily disabled Wagmi hooks for validation features
- Using `useWalletAddress()` instead of `useAccount()`
- Set placeholders for supervisor checks and validation info

**TODO:**
- Re-implement validation features using custom contract integration
- Consider if validation should be part of Origin SDK or separate contract calls

## Migration Checklist

- [x] Remove Wagmi from signup flow
- [x] Create `useWalletAddress()` hook
- [x] Update earnings summary component
- [x] Update thesis viewer component
- [x] Add loading states for all routes
- [ ] Implement earnings fetching with Origin SDK
- [ ] Implement royalty claiming with Origin SDK
- [ ] Re-implement thesis validation features
- [ ] Remove Wagmi from package.json (if no longer needed)

## Testing Checklist

- [x] Wallet connection works on signup page
- [x] No Wagmi provider errors on dashboard
- [ ] Earnings display correctly (pending Origin SDK implementation)
- [ ] Royalty claiming works (pending Origin SDK implementation)
- [ ] Loading states appear during navigation
- [ ] Thesis viewer displays without errors

## Known Issues

1. **Earnings Not Fetching:** The earnings summary currently shows placeholder data. Need to implement with Origin SDK's `getRoyalties()` method.

2. **Validation Features Disabled:** Thesis validation by supervisors is temporarily disabled. Need to decide on implementation approach (Origin SDK vs custom contracts).

3. **Fork Modal:** May still have Wagmi dependencies - needs review.

## Next Steps

1. **Implement Origin SDK Earnings:**
   ```typescript
   const { getEarnings } = useGetEarnings(tokenId, address)
   const earnings = await getEarnings()
   ```

2. **Implement Origin SDK Claiming:**
   ```typescript
   const { claimRoyalties } = useClaimRoyalties(tokenId, address)
   await claimRoyalties()
   ```

3. **Review Fork Modal:** Check if it has Wagmi dependencies and update if needed.

4. **Consider Validation Approach:** Decide if validation should be:
   - Part of Origin SDK (if supported)
   - Separate custom contract calls
   - Removed entirely

## Benefits of Migration

1. **Unified Wallet Management:** Single source of truth for wallet connectivity
2. **Simplified Authentication:** Origin SDK handles provider selection
3. **Better Error Handling:** No more "provider not found" errors
4. **Consistent UX:** All wallet interactions go through Camp Modal
5. **Future-Proof:** Built on Origin SDK's IPNFT infrastructure

## Resources

- [Origin SDK Documentation](./origin_sdk.md)
- [Origin SDK Integration Guide](./ORIGIN_SDK_INTEGRATION.md)
- [Camp Network Documentation](https://docs.camp.network)
