# Test Wallet Signing Capability

The error "Failed to get signature" means Origin SDK cannot get your wallet to sign a message. This is a fundamental wallet connection issue.

## Quick Test

Open your browser console and run these commands **in order**:

### Test 1: Check if wallet is connected
```javascript
const accounts = await window.ethereum.request({ method: 'eth_accounts' })
console.log('Connected accounts:', accounts)
```

**Expected:** Should show your wallet address  
**If empty:** Wallet is not connected - reconnect it

### Test 2: Test if wallet can sign
```javascript
const accounts = await window.ethereum.request({ method: 'eth_accounts' })
const message = 'Test signature'
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, accounts[0]]
})
console.log('✓ Wallet CAN sign:', signature)
```

**Expected:** MetaMask popup appears, you sign, signature is returned  
**If fails:** Your wallet extension is broken

### Test 3: Check Origin SDK state
```javascript
// Get the auth object (if using React DevTools)
// Or check localStorage
const jwt = localStorage.getItem('camp-auth-token') || localStorage.getItem('origin-auth-token')
console.log('JWT exists:', !!jwt)

if (jwt) {
  const payload = JSON.parse(atob(jwt.split('.')[1]))
  console.log('JWT payload:', payload)
  console.log('JWT expired:', Date.now() > payload.exp * 1000)
}
```

## Common Fixes

### Fix 1: Wallet Extension Issue
If Test 2 fails, your wallet extension has a problem:

1. **Restart browser** completely
2. **Update wallet extension** to latest version
3. **Try different browser** (Chrome, Brave, Firefox)
4. **Reinstall wallet extension** as last resort

### Fix 2: Multiple Wallets Conflict
If you have MetaMask + Coinbase Wallet + Trust Wallet:

1. **Disable all except one**:
   - Go to `chrome://extensions`
   - Disable all wallet extensions except MetaMask
   - Refresh your app
   - Reconnect wallet

### Fix 3: Origin SDK State Corrupted
Clear Origin SDK's stored state:

```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
window.location.reload()
```

Then reconnect wallet fresh.

### Fix 4: Use Wallet's Built-in Browser
Most reliable solution:

1. Open **MetaMask Mobile** app
2. Use the **built-in browser** (not Chrome/Safari)
3. Navigate to your app
4. Connect and mint

This avoids ALL extension conflicts.

## If Nothing Works

### Workaround: Use Origin's Official UI
1. Go to https://origin.camp.network
2. Connect your wallet there
3. Mint your IPNFT directly
4. It will still work with your app's database

### Report the Issue
If wallet signing works (Test 2 passes) but minting still fails:

1. This is an Origin SDK bug
2. Share these details with Origin support:
   - Browser and version
   - Wallet extension and version
   - Console logs
   - Network (testnet/mainnet)

## Technical Explanation

The error happens in this sequence:

1. ✅ File uploads to IPFS (100% progress)
2. ✅ Origin SDK calls `/origin/register` API
3. ❌ API asks wallet to sign registration transaction
4. ❌ Wallet fails to provide signature
5. ❌ API returns 400 Bad Request
6. ❌ You see "Failed to get signature"

The issue is at step 4 - the wallet provider Origin SDK is using cannot sign messages.

## Prevention

1. **Use only one wallet extension**
2. **Don't switch accounts** after connecting
3. **Mint immediately** after connecting (don't wait)
4. **Use mobile wallet browsers** for best reliability
5. **Keep wallet extension updated**
