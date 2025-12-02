# Fix: "Failed to get signature" Error During Minting

## Problem
Error occurs during minting: `Failed to register IpNFT: Failed to get signature`
- File uploads successfully (100% progress)
- Error happens during blockchain registration
- 400 Bad Request to Origin API

## Root Causes

### 1. Wallet Account Switched
User authenticated with one account but switched to another in their wallet.

**Solution:**
- Check console for "Account mismatch" error
- Switch back to the account you logged in with
- Or disconnect and reconnect with the current account

### 2. Multiple Wallet Extensions
MetaMask + Trust Wallet (or other combinations) causing provider conflicts.

**Solution:**
- Disable all wallet extensions except one
- Or use wallet's built-in browser (MetaMask Mobile, Trust Wallet browser)
- Refresh page after disabling extensions

### 3. JWT Token Valid But Wallet Can't Sign
The authentication token is valid, but the wallet provider can't sign messages.

**Solution:**
```bash
# In browser console, test if wallet can sign:
await window.ethereum.request({
  method: 'personal_sign',
  params: ['Test message', '0xYourAddress']
})
```

If this fails, the wallet extension has an issue:
- Restart browser
- Reinstall wallet extension
- Try different browser

### 4. Origin SDK Internal State Issue
Origin SDK's internal wallet connection is broken.

**Solution:**
1. Open DevTools Console
2. Clear Origin SDK state:
```javascript
// Clear localStorage
localStorage.removeItem('origin-auth-token')
localStorage.removeItem('origin-wallet-address')

// Reload page
window.location.reload()
```
3. Reconnect wallet
4. Try minting again

## Step-by-Step Fix

### Quick Fix (Try First)
1. **Disconnect wallet** from your app
2. **Refresh the page** (F5 or Cmd+R)
3. **Reconnect wallet** 
4. **Try minting again**

### If Quick Fix Doesn't Work

#### Check 1: Verify Wallet Connection
```javascript
// In browser console:
const accounts = await window.ethereum.request({ method: 'eth_accounts' })
console.log('Connected accounts:', accounts)
```

Should show your wallet address. If empty, wallet isn't connected.

#### Check 2: Test Wallet Signing
```javascript
// In browser console:
try {
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: ['Test', accounts[0]]
  })
  console.log('✓ Wallet can sign:', signature)
} catch (err) {
  console.error('✗ Wallet cannot sign:', err)
}
```

If this fails, your wallet extension has an issue.

#### Check 3: Verify Origin SDK State
```javascript
// In browser console (if using React):
// Check if auth object exists
console.log('Auth:', window.__CAMP_AUTH__)

// Check JWT
const jwt = localStorage.getItem('origin-auth-token')
console.log('JWT exists:', !!jwt)
```

#### Check 4: Multiple Providers
```javascript
// In browser console:
const providers = window.ethereum.providers || [window.ethereum]
console.log('Number of providers:', providers.length)
console.log('Provider types:', providers.map(p => 
  p.isMetaMask ? 'MetaMask' : 
  p.isTrust ? 'Trust' : 
  p.isCoinbaseWallet ? 'Coinbase' : 'Unknown'
))
```

If more than 1 provider, disable extras.

## Advanced Solutions

### Solution 1: Use Only One Wallet
1. Go to `chrome://extensions` (or your browser's extension page)
2. Disable all wallet extensions except one
3. Refresh your app
4. Reconnect wallet
5. Try minting

### Solution 2: Use Wallet's Built-in Browser
Instead of using desktop browser with extensions:
1. Open MetaMask Mobile app
2. Use the built-in browser
3. Navigate to your app
4. Connect and mint

This avoids all multi-provider issues.

### Solution 3: Clear Everything and Start Fresh
```javascript
// In browser console:

// 1. Clear all Origin SDK data
Object.keys(localStorage).forEach(key => {
  if (key.includes('origin') || key.includes('camp')) {
    localStorage.removeItem(key)
  }
})

// 2. Clear session storage
sessionStorage.clear()

// 3. Reload
window.location.reload()
```

Then:
1. Reconnect wallet
2. Wait for authentication to complete
3. Try minting immediately (don't wait too long)

### Solution 4: Try Different Browser
If nothing works:
1. Try Chrome if you're on Firefox (or vice versa)
2. Try Brave browser (has built-in wallet)
3. Try incognito/private mode

## Prevention

### For Users
1. **Use only one wallet extension**
2. **Don't switch accounts** after connecting
3. **Mint soon after connecting** (don't let session sit idle)
4. **Use wallet's mobile browser** for most reliable experience

### For Developers
The enhanced wallet verification in `lib/camp.ts` now checks:
- ✅ Wallet is still connected
- ✅ Current account matches authenticated account
- ✅ Warns about multiple providers
- ✅ Provides clear error messages

## Console Logs to Watch For

### Success Path
```
✓ JWT token verified and valid
✓ Current wallet account: 0x1234...
✓ Wallet verification passed
Calling Origin SDK mintFile...
Upload progress: 100%
Mint successful! Token ID: 123
```

### Error Patterns

#### Account Mismatch
```
❌ Account mismatch!
  authenticated: 0x1234...
  current: 0x5678...
Error: Wallet account mismatch...
```
**Fix:** Switch back to correct account

#### Multiple Providers
```
⚠️ Multiple wallet providers detected
Providers: ["MetaMask", "Trust"]
Failed to get signature
```
**Fix:** Disable one wallet extension

#### Wallet Disconnected
```
Error: Wallet disconnected
```
**Fix:** Reconnect wallet

## Still Not Working?

If you've tried everything:

1. **Use Origin's official UI** as a workaround:
   - Go to https://origin.camp.network
   - Connect wallet there
   - Mint your IPNFT
   - It will still work with your app

2. **Report the issue:**
   - Note your browser and wallet extension versions
   - Check browser console for errors
   - Share console logs with support

3. **Try WalletConnect:**
   - If your app supports it, use WalletConnect instead of browser extensions
   - More reliable for complex wallet scenarios
