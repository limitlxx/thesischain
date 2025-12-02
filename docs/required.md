# ThesisChain Africa – FINAL “Just Make It Work” Requirements Document  
For Kiro IDE – 100 % focused on integrating the **already-finished v0.dev frontend**  
Copy → paste this single file into your Kiro project as  
`.kiro/requirements/thesischain-integration-only.md`

Kiro will read it once and give you **only the missing pieces** that make the v0.dev UI fully functional on Camp Network Basecamp testnet:

- 4 Solidity contracts (real, verified)  
- 1 Hardhat deploy + verify script  
- 5 frontend hooks / lib files  
- 1 seed script (15 theses)  
- 1 X/Twitter share button (viral boost)  

Nothing else. No redesigns. No extra pages.

```markdown
# ThesisChain – Integration-Only Requirements for Kiro (25 Nov 2025)

Goal: Take the existing v0.dev Next.js frontend (already imported) and make every button actually work on Camp Network Basecamp testnet before 6 Dec 2025.

## 1. Existing Frontend Pages (DO NOT TOUCH DESIGN)
- / (landing)
- /mint (4-step wizard)
- /dashboard
- /thesis/[id] (detail + fork button)
- /search & /leaderboard

All UI is finished. Only add logic.

## 2. Exact Contracts Needed (Solidity .sol)
Deploy these 4 contracts and verify them on https://camp.cloud.blockscout.com

| Contract                | Must Have Functions / Events                                 | Inherits / Uses                                      |
|-------------------------|--------------------------------------------------------------|------------------------------------------------------|
| ThesisRegistry.sol      | mintThesis(string uri, uint96 royaltyBps) → returns tokenId  | Calls Origin factory 0x992C57b76E60D3c558144b15b47A73312889B12B |
| RoyaltySplitter.sol     | splitRoyalties(address[] recipients, uint[] shares, uint amount) | ERC20 USDC 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a |
| ForkTracker.sol         | forkThesis(uint parentId, string newUri) → tokenId           | Sets parent in Origin metadata                       |
| UniversityValidator.sol | validate(uint tokenId) onlySupervisor                         | Simple role-based access                             |

## 3. Hardhat Setup (Kiro must create)
hardhat.config.js)
```js
module.exports = {
  solidity: "0.8.24",
  networks: { basecamp: { url: "https://rpc-campnetwork.xyz", chainId: 123420001114, accounts: [process.env.PRIVATE_KEY] }},
  etherscan: {
    apiKey: { basecamp: process.env.BLOCKSCOUT_API_KEY },
    customChains: [{ network: "basecamp", chainId: 123420001114, urls: { apiURL: "https://camp.cloud.blockscout.com/api", browserURL: "https://camp.cloud.blockscout.com" }}]
  }
};
```

## 4. Frontend Files Kiro Must Add (only these 5 files)

1. /frontend/lib/camp.ts
   - createCampAuth (environment: "DEVELOPMENT")
   - useConnectWallet()
   - useMintThesis() → full flow: IPFS → Origin mint → ThesisRegistry.mintThesis
   - useForkThesis(tokenId)
   - useGetThesis(tokenId)
   - useGetEarnings(address)

2. /frontend/lib/ipfs.ts → uploadFiles() using nft.storage

3. /frontend/lib/contracts.ts → ABIs + contract addresses (auto-filled after deploy)

4. /frontend/components/ShareToX.tsx
   - Button “Share to X” → uses Camp Social API to auto-tweet the minted thesis link

5. /frontend/app/globals.css → add confetti import

## 5. Exact User Flows That Must Work End-to-End

1. Mint Flow (tested 100 %)
   Connect wallet → Mint wizard → Upload PDF/code/video → Set 10 % royalty → Click “Mint” →  
   → IPFS upload → Origin SDK mint → ThesisRegistry.mintThesis → Success toast + confetti + redirect to /thesis/123

2. Fork Flow
   Open any thesis → “Fork & Improve” → Pay 0.5 USDC → Upload new files → Click Fork →  
   → New derivative IPNFT minted with parent link → Original author receives royalty instantly

3. Dashboard Flow
   Shows all user theses + total earnings in USDC + fork tree

4. Search / Leaderboard
   Pulls real on-chain data (tokenId, metadata, royalty events)

## 6. Seeding (must run in < 2 minutes)
scripts/seed.ts → mints 15 realistic African theses from 7 universities with real-looking metadata.

## 7. One-Click Scripts (add to package.json)
```json
{
  "scripts": {
    "dev": "next dev",
    "deploy": "hardhat run scripts/deploy.js --network basecamp",
    "verify": "hardhat verify --network basecamp",
    "seed": "ts-node scripts/seed.ts",
    "full": "npm run deploy && npm run verify && npm run seed"
  }
}
```

## 8. Steering Instructions for Kiro AI (copy into .kiro/settings/steering.md)
You are integrating an existing v0.dev frontend. DO NOT change any UI/UX.
Use ONLY Solidity and the real Origin factory 0x992C57b76E60D3c558144b15b47A73312889B12B
Use real testnet USDC 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a
Every button must do something real on-chain.
Add confetti + toast + mobile loading states.
Target: working mint → fork → royalty payout demo in under 2 minutes.

```

Drop this file into Kiro right now → click “Generate from Requirements”.

Kiro will give you the **exact 9 missing pieces** in < 2 hours and your v0.dev frontend will be 100 % alive on Camp Network.

When it’s done, run:
```bash
npm run full
```

…watch 15 theses appear, fork one, and see real royalties flow.

You’re ready for 6 December.

Want the 2-minute Loom demo script + final pitch deck next? Say go.