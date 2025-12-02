# Dashboard Quick Troubleshooting Guide

## Issue: "Please connect your wallet" message when Origin SDK is active

### What was fixed:

1. **Enhanced wallet address detection** (`lib/wallet.ts`)
   - Added detailed console logging to debug JWT parsing
   - Checks multiple possible field names in JWT payload
   - Better error handling and state management

2. **Improved dashboard loading states** (`components/dashboard/dashboard-client.tsx`)
   - Separated wallet checking from data loading
   - Added 1-second grace period for auth initialization
   - Better error messages for different scenarios

### How to debug:

1. **Open browser console** (F12 or Cmd+Option+I)

2. **Look for these log messages:**
   ```
   ✓ JWT exists
   JWT payload keys: [...]
   ✓ Found wallet address: 0x...
   useWalletAddress state: { address: "0x...", ... }
   Found X IPNFTs for address: 0x...
   ```

3. **Common issues and solutions:**

   **Issue: "❌ No auth.origin available"**
   - Solution: Origin SDK not initialized. Check CampProvider in root layout.

   **Issue: "❌ No JWT available"**
   - Solution: Not authenticated. Go to `/auth/signup` and connect wallet.

   **Issue: "❌ No wallet address found in JWT payload"**
   - Solution: JWT structure might be different. Check console for payload keys.
   - The console will show: `JWT payload keys: [...]`
   - Look for fields like: `address`, `wallet`, `walletAddress`, or `sub`

   **Issue: "Found 0 IPNFTs for address: 0x..."**
   - Solution: No IPNFTs minted yet. Go to `/mint` to create one.

### Testing steps:

1. **Clear browser cache and localStorage:**
   ```javascript
   // In browser console:
   localStorage.clear()
   location.reload()
   ```

2. **Connect wallet:**
   - Go to `/auth/signup`
   - Connect with Origin SDK
   - Wait for success message

3. **Check dashboard:**
   - Go to `/dashboard`
   - Should see "Checking wallet connection..." briefly
   - Then either your IPNFTs or empty state

4. **Mint a test IPNFT:**
   - Go to `/mint`
   - Upload a supported file (image, audio, video, or text)
   - Fill in metadata
   - Mint
   - Return to dashboard

5. **Verify data appears:**
   - Should see IPNFT in Overview tab
   - Check "My IPNFTs" tab for details
   - Check "Activity" tab for mint event

### Manual wallet address check:

Run this in browser console while on the dashboard:

```javascript
// Check if Origin SDK is available
const auth = window.__ORIGIN_AUTH__ // This might vary
console.log("Auth available:", !!auth)

// Check localStorage for JWT
const jwt = localStorage.getItem('origin_jwt') // Key might vary
console.log("JWT in localStorage:", !!jwt)

// If JWT exists, decode it
if (jwt) {
  const payload = JSON.parse(atob(jwt.split('.')[1]))
  console.log("JWT payload:", payload)
  console.log("Wallet address:", payload.address || payload.wallet || payload.sub)
}

// Check tracked IPNFTs
const ipnfts = JSON.parse(localStorage.getItem('thesischain_ipnfts') || '[]')
console.log("Tracked IPNFTs:", ipnfts.length)
console.log("IPNFTs:", ipnfts)
```

### If still not working:

1. **Check CampProvider configuration** in `components/root-layout-client.tsx`:
   ```typescript
   <CampProvider
     config={{
       appName: "ThesisChain.Africa",
       appId: process.env.NEXT_PUBLIC_CAMP_APP_ID!,
       // ... other config
     }}
   >
   ```

2. **Verify environment variables** in `.env`:
   ```
   NEXT_PUBLIC_CAMP_APP_ID=your_app_id
   NEXT_PUBLIC_CAMP_CHAIN_ID=your_chain_id
   ```

3. **Check network connection:**
   - Origin SDK requires internet connection
   - Check browser network tab for failed requests

4. **Try different browser:**
   - Some browsers block localStorage or have strict privacy settings
   - Try Chrome/Firefox in normal mode (not incognito)

### Expected console output (success):

```
✓ JWT exists
JWT payload keys: ["address", "exp", "iat", ...]
✓ Found wallet address: 0x1234567890abcdef...
useWalletAddress state: {
  address: "0x1234567890abcdef...",
  isChecking: false,
  hasAuth: true,
  hasOrigin: true
}
Found 3 IPNFTs for address: 0x1234567890abcdef...
```

### Need more help?

1. Check the full documentation:
   - [Dashboard Enhancements](./docs/DASHBOARD_ENHANCEMENTS.md)
   - [Origin SDK Integration](./docs/ORIGIN_SDK_INTEGRATION.md)
   - [Real Data Integration](./docs/REAL_DATA_INTEGRATION.md)

2. Check Origin SDK docs:
   - https://docs.camp.network/

3. Report an issue with:
   - Browser console logs
   - Network tab screenshots
   - Steps to reproduce
