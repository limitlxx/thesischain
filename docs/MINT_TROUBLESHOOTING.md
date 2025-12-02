# Minting Troubleshooting Guide

## Common Minting Errors and Solutions

### Error: "Wallet not connected" or "Failed to get signature"

**What it means**: The Origin SDK can't access your wallet for blockchain transactions.

**Quick Fix**:
1. The system will automatically try to reconnect your wallet
2. Sign the message when prompted
3. Mint should succeed

**If that doesn't work**:
1. Refresh the page (F5)
2. Disconnect your wallet completely
3. Reconnect your wallet
4. Try minting again

**Still not working?**:
1. Visit `/refresh-auth`
2. Click "Refresh Authentication"
3. Sign the message
4. Try minting again

---

### Error: "Please switch to Camp Network Testnet"

**What it means**: Your wallet is on the wrong blockchain network.

**Quick Fix**:
1. The system will automatically prompt you to switch
2. Approve the network switch in your wallet
3. If Camp Network isn't in your wallet, approve adding it
4. Mint should proceed

**Manual Switch**:
1. Open your wallet (MetaMask, etc.)
2. Click the network dropdown
3. Add Custom Network with these details:
   - **Chain ID**: 123420001114
   - **Chain Name**: Camp Network Testnet
   - **RPC URL**: https://rpc-campnetwork.xyz
   - **Currency**: CAMP
   - **Block Explorer**: https://camp-network-testnet.blockscout.com
4. Switch to Camp Network Testnet
5. Try minting again

---

### Error: "Not authenticated with Origin SDK"

**What it means**: You're not connected to the Origin SDK.

**Fix**:
1. Click "Connect" in the top right
2. Select your wallet
3. Sign the message
4. Try minting again

---

### Error: "No files provided for minting"

**What it means**: You didn't upload any files.

**Fix**:
1. Go back to Step 1
2. Upload at least one file (PDF, code, or video)
3. Continue through the steps
4. Try minting again

---

### Error: "Royalty must be between 1% and 100%"

**What it means**: Your royalty percentage is invalid.

**Fix**:
1. Go back to Step 3
2. Set royalty between 1% and 100%
3. Continue to Step 4
4. Try minting again

---

### Mint is stuck at "Uploading files to IPFS..."

**What it means**: Large files take time to upload.

**What to do**:
- Wait patiently (large files can take 1-2 minutes)
- Don't close the browser tab
- Don't refresh the page
- The progress bar will update as it uploads

**If stuck for >5 minutes**:
1. Refresh the page
2. Try with smaller files
3. Check your internet connection

---

### Mint is stuck at "Minting via Origin SDK..."

**What it means**: Waiting for blockchain confirmation.

**What to do**:
- Wait for the transaction to be confirmed
- Check your wallet for pending transactions
- Don't close the browser tab

**If stuck for >5 minutes**:
1. Check your wallet for a pending transaction
2. If there's a transaction, wait for it to complete
3. If no transaction, refresh and try again

---

## Debug Tools

### `/refresh-auth` - Authentication Refresh Tool
Use this when:
- Getting "Failed to get signature" errors
- Your JWT token is over 1 hour old
- Minting was working but suddenly stopped

What it shows:
- JWT token status and age
- Wallet address in token
- Whether token is stale
- Manual refresh button

### `/debug-wallet` - Wallet Debug Tool
Use this when:
- Wallet connection issues
- Network problems
- Need to check wallet address

What it shows:
- Wallet connection status
- Current network and chain ID
- Wallet address
- Quick disconnect/reconnect

---

## Automatic Fixes

The system now automatically handles:

1. **Stale JWT tokens**: Checks age before minting, refreshes if >1 hour old
2. **Wrong network**: Prompts to switch to Camp Network Testnet
3. **Auth failures**: Retries with fresh authentication if mint fails
4. **Missing network**: Adds Camp Network to your wallet if not present

You'll just need to approve the prompts in your wallet!

---

## Prevention Tips

To avoid minting issues:

1. **Stay on Camp Network**: Keep your wallet on Camp Network Testnet
2. **Fresh sessions**: If you haven't minted in >1 hour, visit `/refresh-auth` first
3. **Same wallet**: Use the same wallet you connected with
4. **Stable connection**: Ensure good internet for file uploads
5. **Reasonable file sizes**: Keep files under 100MB for faster uploads

---

## Still Having Issues?

If none of these solutions work:

1. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Firefox: Ctrl+Shift+Delete → Clear recent history
   - Safari: Cmd+Option+E → Empty caches

2. **Try a different browser**:
   - Sometimes browser extensions interfere
   - Try Chrome, Firefox, or Brave

3. **Check wallet**:
   - Make sure wallet extension is updated
   - Try disconnecting from all sites and reconnecting
   - Restart your browser

4. **Check the console**:
   - Press F12 to open developer tools
   - Look for error messages in the Console tab
   - Share these with support if asking for help

---

## Success Indicators

You'll know minting succeeded when:

1. ✅ Progress bar reaches 100%
2. 🎉 Confetti animation appears
3. ✅ "Thesis minted successfully!" toast message
4. 🔄 Automatic redirect to your thesis page
5. 📊 Thesis appears in your dashboard

The whole process typically takes 30-60 seconds for normal-sized files.
