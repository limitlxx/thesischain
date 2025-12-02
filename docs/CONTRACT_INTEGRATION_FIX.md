# Contract Integration Fix

## Problem
The app was not interacting with smart contracts during mint and other features because:

1. **Missing WagmiProvider**: The app was using wagmi hooks (`useWriteContract`, `useReadContract`, `useWaitForTransactionReceipt`) but had no `WagmiProvider` configured in the component tree.

2. **Origin SDK vs Wagmi**: The `CampProvider` from Origin SDK doesn't provide wagmi functionality - they are separate systems.

## Solution
Replaced wagmi hooks with direct viem client usage that works with the Origin SDK authentication:

### Changes Made

#### 1. `lib/thesis-contract.ts`
- Removed all wagmi hook dependencies
- Created custom hooks that use viem's `createWalletClient` with `window.ethereum`
- Each hook now:
  - Checks for Origin SDK authentication
  - Creates a wallet client from the browser's wallet provider
  - Executes contract calls directly using viem
  - Handles transaction confirmation with public client

#### 2. `lib/integrated-mint.ts`
- Updated return types from `{ originTokenId: string; contractTokenId: bigint }` to just `string`
- Made contract registration non-blocking (won't fail the entire mint if it fails)
- Improved error handling and user feedback
- Both `mintThesis` and `forkThesis` now return the Origin token ID as a string

### How It Works Now

1. **User Authentication**: User connects via Origin SDK's `CampProvider`
2. **Minting Flow**:
   - Origin SDK mints the IPNFT (primary operation)
   - Gets IPFS URI from the minted token
   - Attempts to register on custom ThesisRegistry contract
   - If contract registration fails, the mint still succeeds (graceful degradation)
3. **Contract Calls**: Use viem directly with `window.ethereum` provider

### Testing

Use the new `ContractDiagnostic` component to test:

```tsx
import { ContractDiagnostic } from "@/components/contract-diagnostic"

// Add to any page
<ContractDiagnostic />
```

This component will:
- Check authentication status
- Verify wallet provider connection
- Test contract call functionality
- Provide detailed error messages

### Key Benefits

1. **No WagmiProvider needed**: Works directly with Origin SDK
2. **Graceful degradation**: Origin SDK minting works even if custom contracts fail
3. **Better error handling**: Clear error messages for debugging
4. **Simpler architecture**: One less provider to configure

### Requirements

- User must be authenticated with Origin SDK
- Browser must have a wallet provider (MetaMask, etc.)
- Wallet must be connected to Basecamp testnet (Chain ID: 123420001114)

### Contract Addresses

The app uses these deployed contracts on Basecamp testnet:

```typescript
ThesisRegistry: "0x3B672951E3bF67b0A73E8716eC269bbAEe220550"
RoyaltySplitter: "0xee4744b079226cCCA53a22685a2252B56cE855C5"
ForkTracker: "0xA44fB44A1ed8119816AdBAf859f3675dfB186B84"
UniversityValidator: "0xB0999963147a7C1e1D6E74E3fdecC8eEfC628c35"
```

### Next Steps

1. Test the mint flow end-to-end
2. Verify contract registration is working
3. Check that thesis data is being stored correctly
4. Test fork functionality
5. Verify royalty distribution

### Troubleshooting

If minting still doesn't work:

1. **Check wallet connection**: Make sure MetaMask or another wallet is connected
2. **Check network**: Ensure you're on Basecamp testnet (Chain ID: 123420001114)
3. **Check testnet funds**: You need testnet ETH for gas fees
4. **Check console logs**: Look for detailed error messages
5. **Use diagnostic component**: Run `<ContractDiagnostic />` to identify issues

### Common Errors

- **"No wallet provider found"**: Install MetaMask or another Web3 wallet
- **"No account connected"**: Connect your wallet to the app
- **"Not authenticated with Origin SDK"**: Click the connect button first
- **"User rejected"**: You cancelled the transaction in your wallet
- **"Insufficient funds"**: Get testnet ETH from a faucet
