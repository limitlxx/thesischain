# Testing the Origin SDK Fix

## Pre-Flight Checklist

Before testing, ensure:
- ✅ MetaMask (or another wallet) is installed
- ✅ You have test CAMP tokens on Camp Testnet
- ✅ `NEXT_PUBLIC_CAMP_CLIENT_ID` is set in `.env`

## Test Steps

### 1. Check Provider Detection

1. Open your app in the browser
2. Open browser console (F12)
3. Look for these logs on page load:

```
✓ Setting Origin provider to: MetaMask
```

If you see multiple providers:
```
🔍 Multiple wallet providers detected: 3
✓ Selected MetaMask as provider
```

**Expected**: Provider is correctly detected and set

### 2. Test Wallet Connection

1. Click "Connect" button
2. Approve the connection in your wallet
3. Check console for:

```
✓ JWT token verified and valid
✓ Current wallet account: 0x...
```

**Expected**: Connection succeeds without errors

### 3. Test Account Switching

1. While connected, switch accounts in MetaMask
2. Check console for:

```
👛 Wallet accounts changed: ["0x..."]
⚠️ Account mismatch detected!
  Authenticated: 0xold...
  Current: 0xnew...
🔄 Reconnecting Origin...
🔌 Attempting to reconnect with new account...
```

**Expected**: App automatically reconnects with new account

### 4. Test Minting (The Main Fix)

1. Navigate to mint page
2. Upload a file (image, audio, or video)
3. Fill in thesis details
4. Click "Mint Thesis"
5. Watch console logs:

```
Starting mint process...
✓ JWT token verified and valid
✓ Current wallet account: 0x...
✓ Wallet verification passed
Calling Origin SDK mintFile with: {...}
Upload progress: 50%
Upload progress: 100%
Mint successful! Token ID: 123
✅ IPNFT successfully tracked in MongoDB
```

**Expected**: Minting succeeds without "Failed to get signature" error

### 5. Test Error Handling

Try these scenarios to verify error handling:

#### Scenario A: Expired JWT
1. Connect wallet
2. Wait 24 hours (or manually expire JWT)
3. Try to mint
4. **Expected**: Clear error message about expired token

#### Scenario B: Wrong Account
1. Connect with Account A
2. Switch to Account B in MetaMask (don't reconnect)
3. Try to mint immediately
4. **Expected**: Auto-reconnect or clear mismatch error

#### Scenario C: No Wallet
1. Disable/remove MetaMask
2. Try to connect
3. **Expected**: Clear "no wallet" error

## Success Criteria

✅ **Provider Detection**: Correct provider selected on load  
✅ **Connection**: Wallet connects without errors  
✅ **Account Switching**: Auto-reconnects when switching accounts  
✅ **Minting**: Successfully mints without signature errors  
✅ **Error Handling**: Clear error messages for all failure cases  

## Common Issues

### Issue: Still getting "Failed to get signature"

**Possible causes**:
1. Multiple wallet extensions fighting for control
2. JWT expired (check console for expiry date)
3. Network issues

**Solutions**:
1. Disable all wallet extensions except one
2. Disconnect and reconnect wallet
3. Hard refresh page (Ctrl+Shift+R)
4. Check network connection

### Issue: "Wallet account mismatch" error

**Cause**: You switched accounts after connecting

**Solution**: The app should auto-reconnect. If not, manually disconnect and reconnect.

### Issue: Provider not detected

**Cause**: No wallet extension installed or wallet not unlocked

**Solution**: 
1. Install MetaMask or another wallet
2. Unlock your wallet
3. Refresh the page

## Debug Commands

Run these in browser console to debug:

```javascript
// Check current provider
window.ethereum

// Check if multiple providers
window.ethereum.providers

// Check Origin auth state
// (requires access to auth instance)
```

## Performance Metrics

Track these metrics:

- **Time to connect**: Should be < 3 seconds
- **Time to mint**: Should be < 30 seconds (depends on file size)
- **Success rate**: Should be > 95%

## Reporting Issues

If you still encounter issues after following this guide:

1. Copy all console logs
2. Note your browser and wallet versions
3. Describe the exact steps to reproduce
4. Check if issue occurs in incognito mode
5. Try with a different wallet/browser

## Next Steps

Once testing is complete:
- ✅ Deploy to production
- ✅ Monitor error rates
- ✅ Collect user feedback
- ✅ Update documentation based on real-world usage
