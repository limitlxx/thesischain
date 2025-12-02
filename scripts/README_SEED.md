# ThesisChain Africa Seed Script

This script populates the Basecamp testnet with realistic demo data for ThesisChain Africa.

## What It Does

The seed script creates:
- **15 thesis IPNFTs** with diverse metadata from 8 African universities
- **5 fork relationships** between theses
- **50+ USDC** in royalty payments distributed across theses
- **3 Share IPs** (simulated social media shares)

## Prerequisites

Before running the seed script, ensure you have:

1. **Deployed Contracts**: All smart contracts must be deployed to Basecamp testnet
2. **Wallet with Funds**: Your wallet needs sufficient ETH for gas fees
   - Recommended minimum: **0.01 ETH**
   - The script performs ~30 transactions
3. **Environment Variables**: Properly configured `.env` file with:
   - `PRIVATE_KEY`: Your wallet's private key
   - `BASECAMP_RPC_URL`: RPC endpoint (defaults to Gelato RPC)
   - Contract addresses (auto-loaded from `lib/contracts.ts`)

## Usage

### Basic Usage

```bash
npm run seed
```

### Skip Balance Check (Non-Interactive)

If you want to skip the interactive balance check prompt:

```bash
SEED_SKIP_BALANCE_CHECK=true npm run seed
```

## Balance Check Feature

The seed script includes an automatic wallet balance check before executing transactions:

### What It Checks

- Queries your wallet balance on Basecamp testnet
- Compares against recommended minimum (0.01 ETH)
- Displays current balance in ETH

### Low Balance Warning

If your balance is below 0.01 ETH, you'll see:

```
⚠️  WARNING: Low wallet balance!
   Current: 0.005 ETH
   Recommended: 0.01 ETH or more
   You may experience transaction failures due to insufficient gas.
   Please fund your wallet before continuing.

   Continue anyway? (yes/no):
```

### Options

1. **Fund your wallet** and restart the script
2. **Continue anyway** by typing `yes` (may result in failed transactions)
3. **Cancel** by typing `no` or pressing Ctrl+C

### Getting Testnet ETH

To fund your wallet on Basecamp testnet:
1. Visit the Camp Network faucet
2. Enter your wallet address: `0x6a62e5bA998874A5c8A5B3b3A1add5c9E3A31a4a`
3. Request testnet ETH

## Script Output

The script provides detailed logging:

```
🌍 Starting ThesisChain Africa Seed Script...

📝 Using wallet: 0x6a62e5bA998874A5c8A5B3b3A1add5c9E3A31a4a
💰 Checking wallet balance...
   Balance: 0.05 ETH
   ✅ Sufficient balance for seeding operations

📊 Seed script will perform approximately:
   • 15 thesis minting transactions
   • 5 fork creation transactions
   • 10 royalty-related transactions (set shares + distribute)
   • Total: ~30 transactions

📚 Step 1: Minting 15 thesis IPNFTs...
  ✅ Minted thesis 1/15: "Machine Learning Applications..." (Token ID: 1)
  ...

═══════════════════════════════════════════════════════
📊 SEED SCRIPT SUMMARY
═══════════════════════════════════════════════════════
✅ Theses minted: 15/15
✅ Fork relationships: 5/5
✅ Royalties distributed: 53.00 USDC
✅ Share IPs created: 3 (simulated)
✅ Universities represented: 8
⏱️  Execution time: 45.23 seconds
═══════════════════════════════════════════════════════
✅ Script completed within time limit

🎉 Seed script completed successfully!
```

## Troubleshooting

### Network Timeout

If you see `JsonRpcProvider failed to detect network`:
- Check your internet connection
- Verify the RPC URL in `.env` is correct
- Try the alternative RPC: `https://rpc-campnetwork.xyz/`

### Transaction Failures

If transactions fail:
- Check wallet balance (may have run out of gas)
- Verify contracts are deployed correctly
- Check contract addresses in `lib/contracts.ts`

### Script Takes Too Long

The script should complete in under 2 minutes. If it's slower:
- Network congestion on testnet
- RPC endpoint may be slow
- Consider using a different RPC endpoint

## Data Generated

### Universities (8)
- University of Lagos (UNILAG)
- University of Ghana (UG)
- Makerere University
- Strathmore University
- University of Nairobi
- KNUST
- University of Cape Town
- Covenant University

### Thesis Topics
Covers diverse African research areas:
- Machine Learning in Agriculture
- Blockchain Supply Chain
- Solar Microgrids
- IoT Water Management
- Climate Change Impact
- Mobile Money & Fintech
- AI Healthcare
- Renewable Energy
- And more...

## Requirements Validated

This script satisfies requirements:
- **12.1**: Mint at least 15 theses ✅
- **12.2**: Use data from at least 7 universities ✅
- **12.3**: Create at least 5 fork relationships ✅
- **12.4**: Simulate royalty payments ✅
- **12.5**: Create at least 3 Share IPs ✅
- **12.6**: Log summary of created data ✅
- **12.7**: Complete in under 2 minutes ✅
