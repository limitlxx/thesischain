# Wallet Connection Diagnostics

## Problem
Users experiencing "Failed to register IpNFT: Failed to get signature" error when trying to mint.

## Root Causes

### 1. Expired JWT Token
Origin SDK authentication tokens expire after a certain period. If the user waits too long after logging in, the token becomes invalid.

### 2. Wallet Not Connected
The wallet extension may not be properly connected or the user may have disconnected it.

### 3. Multiple Wallet Providers
When multiple wallet extensions are installed (e.g., MetaMask + Trust Wallet), they can interfere with each other.

## Solution Implemented

### 1. Enhanced Authentication Checks in `lib/camp.ts`
Before minting, we now verify:
- Origin SDK is initialized (`auth?.origin`)
- JWT token exists and hasn't expired
- Wallet has connected accounts
- File types and sizes are valid

```typescript
// Verify JWT token
const jwt = auth.origin.getJwt();
if (!jwt) {
  throw new Error("No authentication token found. Please reconnect your wallet.");
}

// Check expiration
const payload = JSON.parse(atob(jwt.split(".")[1]));
if (Date.now() > payload.exp * 1000) {
  throw new Error("Authentication token has expired. Please reconnect your wallet.");
}

// Verify wallet connection
const accounts = await ethereum.request({ method: 'eth_accounts' });
if (!accounts || accounts.length === 0) {
  throw new Error("No wallet accounts found. Please connect your wallet.");
}
```

### 2. Pre-Mint Authentication Check in `mint-wizard.tsx`
Added authentication state check before starting the mint process:

```typescript
if (!authenticated) {
  toast.error("Not authenticated", {
    description: "Please connect your wallet to mint a thesis"
  });
  return;
}
```

### 3. Multiple Wallet Detection
Warns users when multiple wallet providers are detected:

```typescript
if (ethereum.providers?.length > 1) {
  console.warn("⚠️ Multiple wallet providers detected:", providers.length);
  console.warn("This can cause wallet mismatch issues.");
}
```

## Diagnostic Steps

### Using the Wallet Diagnostic Component
We've created a `WalletDiagnostic` component that shows real-time wallet connection status:

```tsx
import { WalletDiagnostic } from "@/components/wallet-diagnostic";

// Add to any page to debug wallet issues
<WalletDiagnostic />
```

This component shows:
- ✅ Origin SDK initialization status
- ✅ Authentication state
- ✅ JWT token presence and expiration
- ✅ Wallet address
- ✅ Connected accounts
- ✅ Number of wallet providers
- ⚠️ Warnings for multiple providers

### Manual Console Checks

#### 1. Check Authentication Status
```typescript
// In browser console
const auth = useAuth();
console.log("Authenticated:", auth?.origin ? "Yes" : "No");
console.log("JWT:", auth?.origin?.getJwt());
```

#### 2. Check Wallet Connection
```typescript
// In browser console
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
console.log("Connected accounts:", accounts);
```

#### 3. Check for Multiple Wallets
```typescript
// In browser console
console.log("Providers:", window.ethereum.providers?.length || 1);
console.log("Provider types:", window.ethereum.providers?.map(p => 
  p.isMetaMask ? "MetaMask" : p.isTrust ? "Trust" : "Other"
));
```

## Console Logs to Watch For

### Success Path
```
✓ JWT token verified and valid
✓ Wallet connected: 0x1234...
Starting mint process...
Upload progress: 50%
Mint successful! Token ID: 123
```

### Authentication Errors
```
❌ No authentication token found
❌ Authentication token has expired
❌ No wallet accounts found
```

### Multiple Wallet Warning
```
⚠️ Multiple wallet providers detected: 2
⚠️ This can cause wallet mismatch issues
```

## Files Modified
- `lib/camp.ts` - Enhanced authentication and wallet connection checks
- `components/mint-wizard.tsx` - Added pre-mint authentication check
- `hooks/useWalletLock.ts` - Wallet monitoring hook (currently disabled)
- `components/root-layout-client.tsx` - Wallet lock wrapper (currently disabled)

## Common Solutions

### Error: "Failed to get signature"
**Cause**: Wallet not connected or JWT expired  
**Solution**: 
1. Disconnect wallet from the app
2. Refresh the page
3. Reconnect wallet
4. Try minting again

### Error: "No authentication token found"
**Cause**: Origin SDK not properly initialized  
**Solution**:
1. Check that `NEXT_PUBLIC_CAMP_CLIENT_ID` is set in `.env`
2. Verify CampProvider is wrapping your app
3. Reconnect wallet

### Error: "Authentication token has expired"
**Cause**: JWT token expired (usually after 24 hours)  
**Solution**:
1. Disconnect wallet
2. Reconnect wallet to get fresh token
3. Try minting again

### Multiple Wallets Detected
**Cause**: Multiple wallet extensions installed  
**Solution**:
1. Disable all wallet extensions except one
2. Or use the wallet's built-in browser (e.g., MetaMask Mobile)
3. Or use WalletConnect instead

## Recommendations for Users
If issues persist:
1. **Use only one wallet extension** - Disable Trust Wallet if using MetaMask
2. **Use mobile wallet browsers** - MetaMask Mobile, Trust Wallet browser
3. **Clear browser data** - Cache and cookies
4. **Try incognito mode** - Rules out extension conflicts
5. **Use WalletConnect** - More reliable for multi-wallet scenarios

## Future Improvements
- [ ] Add automatic JWT refresh before expiration
- [ ] Show wallet connection status in UI
- [ ] Add "Reconnect Wallet" button in mint wizard
- [ ] Implement WalletConnect as primary option
- [ ] Add wallet selector UI for multiple providers
