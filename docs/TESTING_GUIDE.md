# Testing Guide - Contract Integration

## Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the diagnostic page**:
   ```
   http://localhost:3000/diagnostic
   ```

3. **Connect your wallet**:
   - Click "Connect" in the navbar
   - Select your wallet (MetaMask, etc.)
   - Approve the connection

4. **Switch to Basecamp Testnet**:
   - Network Name: Camp Network Basecamp
   - Chain ID: 123420001114
   - RPC URL: https://rpc.basecamp-testnet.camp.network
   - Block Explorer: https://explorer.basecamp-testnet.camp.network

5. **Get testnet funds** (if needed):
   - Visit a Basecamp testnet faucet
   - Request testnet ETH for gas fees

6. **Run diagnostic tests**:
   - Click "Test Connection" to verify setup
   - Click "Test Mint" to test contract interaction

## Testing the Mint Flow

1. **Navigate to mint page**:
   ```
   http://localhost:3000/mint
   ```

2. **Complete the wizard**:
   - Step 1: Upload thesis files (PDF, code, video)
   - Step 2: Fill in metadata (title, abstract, university, etc.)
   - Step 3: Set royalty percentage (1-100%)
   - Step 4: Review and mint

3. **Expected behavior**:
   - Progress bar shows upload progress
   - Origin SDK mints the IPNFT first
   - Custom contract registration happens second
   - Success message shows token ID
   - Redirects to thesis view page

4. **What to check**:
   - ✅ Wallet prompts appear for signatures
   - ✅ Progress updates smoothly
   - ✅ Success toast appears
   - ✅ Token ID is returned
   - ✅ Redirect works correctly

## Testing Fork Functionality

1. **Navigate to a thesis page**:
   ```
   http://localhost:3000/thesis/[tokenId]
   ```

2. **Click "Fork" button**

3. **Complete fork wizard**:
   - Upload new files
   - Modify metadata
   - Set royalty percentage
   - Confirm fork

4. **Expected behavior**:
   - Creates derivative on Origin SDK
   - Registers fork relationship on ForkTracker
   - Returns new token ID

## Common Issues & Solutions

### Issue: "No wallet provider found"
**Solution**: Install MetaMask or another Web3 wallet extension

### Issue: "Not authenticated with Origin SDK"
**Solution**: Click the "Connect" button in the navbar first

### Issue: "No account connected"
**Solution**: Make sure your wallet is unlocked and connected to the site

### Issue: "Wrong network"
**Solution**: Switch to Basecamp testnet (Chain ID: 123420001114)

### Issue: "Insufficient funds"
**Solution**: Get testnet ETH from a faucet

### Issue: "Transaction failed"
**Solution**: 
- Check console for detailed error
- Verify contract addresses are correct
- Ensure you have enough gas
- Try increasing gas limit

### Issue: "Mint succeeds but contract registration fails"
**Solution**: This is expected behavior (graceful degradation)
- The IPNFT is still created on Origin
- Custom contract features may not work
- Check contract deployment and addresses

## Debugging Tips

1. **Open browser console** (F12) to see detailed logs

2. **Check these logs**:
   - "Starting integrated mint process..." - Mint initiated
   - "Minting via Origin SDK..." - Origin SDK call
   - "Origin SDK mint successful!" - IPNFT created
   - "Registering on ThesisRegistry contract..." - Custom contract call
   - "ThesisRegistry registration successful!" - Contract registered

3. **Use the diagnostic component**:
   ```tsx
   import { ContractDiagnostic } from "@/components/contract-diagnostic"
   ```

4. **Check wallet transactions**:
   - View in MetaMask activity
   - Check on block explorer

5. **Verify contract addresses**:
   ```typescript
   // In lib/contracts.ts
   ThesisRegistry: "0x3B672951E3bF67b0A73E8716eC269bbAEe220550"
   RoyaltySplitter: "0xee4744b079226cCCA53a22685a2252B56cE855C5"
   ForkTracker: "0xA44fB44A1ed8119816AdBAf859f3675dfB186B84"
   UniversityValidator: "0xB0999963147a7C1e1D6E74E3fdecC8eEfC628c35"
   ```

## Test Checklist

- [ ] Wallet connects successfully
- [ ] Network is Basecamp testnet
- [ ] Diagnostic tests pass
- [ ] Can upload files in mint wizard
- [ ] Can complete all wizard steps
- [ ] Mint transaction prompts appear
- [ ] Progress bar updates correctly
- [ ] Success message appears
- [ ] Token ID is returned
- [ ] Can view minted thesis
- [ ] Can fork existing thesis
- [ ] Fork creates new token
- [ ] Royalties are tracked correctly

## Next Steps After Testing

1. **If everything works**:
   - Deploy to production
   - Update contract addresses for mainnet
   - Test on mainnet with real funds

2. **If issues persist**:
   - Review CONTRACT_INTEGRATION_FIX.md
   - Check Origin SDK documentation
   - Verify contract deployment
   - Test contracts directly with Hardhat/Foundry

## Support

- Origin SDK Docs: https://docs.camp.network
- Contract Source: `/contracts` directory
- Deployment Info: `/deployments/deployments.json`
- Integration Docs: `/docs/CONTRACT_INTEGRATION_FIX.md`
