# Design Document

## Overview

ThesisChain Africa is a decentralized academic IP registry that transforms university theses into composable, royalty-earning IPNFTs on Camp Network Basecamp testnet. The system integrates blockchain technology with social authentication to create a low-barrier platform for African researchers to prove ownership, earn passive income, and build reputation through their academic work.

The architecture consists of four main layers:
1. **Smart Contract Layer**: Four Solidity contracts managing IPNFT lifecycle, royalties, forks, and validation
2. **Blockchain Integration Layer**: Origin SDK and viem/wagmi for wallet/social auth and on-chain interactions
3. **Storage Layer**: IPFS via nft.storage for decentralized file storage
4. **Frontend Layer**: Next.js 14 with existing v0.dev UI components, enhanced with functional hooks

The design prioritizes mobile-first African users by offering social authentication (Twitter/Spotify/TikTok) as the primary entry point, with wallet connection as a fallback. All operations provide immediate visual feedback through toasts, loading states, and confetti animations.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  Next.js 14 + TypeScript + Tailwind + shadcn/ui (v0.dev)       │
│                                                                   │
│  Pages: / | /mint | /dashboard | /thesis/[id] | /search |       │
│         /leaderboard | /auth/signup | /auth/callback            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├──────────────────────────────────────┐
                         │                                      │
┌────────────────────────▼──────────┐    ┌────────────────────▼──────┐
│   Blockchain Integration Layer     │    │    Storage Layer          │
│                                    │    │                           │
│  • Origin SDK (Auth + Minting)    │    │  • IPFS (nft.storage)    │
│  • viem (RPC calls)               │    │  • Metadata JSON          │
│  • wagmi (React hooks)            │    │  • PDF/Code/Video files   │
│  • Web3Modal (Wallet UI)          │    │                           │
└────────────────────────┬──────────┘    └───────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              Camp Network Basecamp Testnet                       │
│                   (Chain ID: 123420001114)                       │
│                                                                   │
│  Smart Contracts:                                                │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ ThesisRegistry   │  │ RoyaltySplitter  │                    │
│  │ - mintThesis()   │  │ - splitRoyalties()│                   │
│  └──────────────────┘  └──────────────────┘                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ ForkTracker      │  │ UniversityValidator│                  │
│  │ - forkThesis()   │  │ - validate()      │                   │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  External Contracts:                                             │
│  • Origin Factory: 0x992C57b76E60D3c558144b15b47A73312889B12B  │
│  • USDC Token: 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a      │
└───────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Minting Flow:**
```
User → Mint Wizard → Upload Files → nft.storage (IPFS) → 
Origin SDK mintFile() → ThesisRegistry.mintThesis() → 
Emit ThesisMinted Event → Update UI → Redirect to /thesis/[id]
```

**Fork Flow:**
```
User → Thesis Detail → Fork Button → Check USDC Balance → 
Upload New Files → ForkTracker.forkThesis() → 
Transfer Fee to RoyaltySplitter → Distribute Royalties → 
Mint Derivative IPNFT → Update UI
```

**Social Auth Flow:**
```
User → /auth/signup → Select Platform → OAuth Redirect → 
Origin SDK linkTwitter() → Callback → Auto-mint Profile IP → 
Redirect to Dashboard
```

## Components and Interfaces

### Smart Contracts

#### ThesisRegistry.sol

**Purpose**: Central registry for all thesis IPNFTs, coordinating with Origin Factory for minting.

**Key Functions**:
- `mintThesis(string memory uri, uint96 royaltyBps) returns (uint256 tokenId)`: Mints new thesis IPNFT
- `getThesis(uint256 tokenId) returns (ThesisMetadata)`: Retrieves thesis metadata
- `getThesesByAuthor(address author) returns (uint256[])`: Lists all theses by author
- `updateMetadata(uint256 tokenId, string memory newUri)`: Updates thesis metadata (owner only)

**Events**:
- `ThesisMinted(uint256 indexed tokenId, address indexed author, string uri, uint96 royaltyBps)`
- `MetadataUpdated(uint256 indexed tokenId, string newUri)`

**Inherits**: Ownable, ReentrancyGuard

**Integrates With**: Origin Factory at 0x992C57b76E60D3c558144b15b47A73312889B12B

#### RoyaltySplitter.sol

**Purpose**: Automatically distributes royalty payments to original authors, supervisors, and fork contributors.

**Key Functions**:
- `splitRoyalties(address[] memory recipients, uint256[] memory shares, uint256 amount)`: Distributes payment
- `getPendingRoyalties(address recipient) returns (uint256)`: Checks unclaimed royalties
- `claimRoyalties()`: Transfers pending royalties to caller
- `setRoyaltyShares(uint256 tokenId, address[] memory recipients, uint256[] memory shares)`: Configures split

**Events**:
- `RoyaltiesSplit(uint256 indexed tokenId, address[] recipients, uint256[] amounts)`
- `RoyaltiesClaimed(address indexed recipient, uint256 amount)`

**Inherits**: Ownable, ReentrancyGuard

**Integrates With**: ERC20 USDC at 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a

#### ForkTracker.sol

**Purpose**: Manages derivative relationships between theses, tracking parent-child links.

**Key Functions**:
- `forkThesis(uint256 parentId, string memory newUri) returns (uint256 tokenId)`: Creates derivative thesis
- `getParents(uint256 tokenId) returns (uint256[])`: Returns parent thesis IDs
- `getChildren(uint256 tokenId) returns (uint256[])`: Returns derivative thesis IDs
- `getForkTree(uint256 tokenId) returns (ForkTree)`: Returns complete fork hierarchy

**Events**:
- `ThesisForked(uint256 indexed newTokenId, uint256 indexed parentId, address indexed author)`
- `ForkTreeUpdated(uint256 indexed tokenId)`

**Inherits**: Ownable

**Integrates With**: ThesisRegistry, RoyaltySplitter

#### UniversityValidator.sol

**Purpose**: Role-based validation system for supervisors to verify student theses.

**Key Functions**:
- `validate(uint256 tokenId, bytes calldata signature) onlySupervisor`: Validates thesis
- `addSupervisor(address supervisor, string memory university)`: Grants supervisor role
- `removeSupervisor(address supervisor)`: Revokes supervisor role
- `isValidated(uint256 tokenId) returns (bool)`: Checks validation status
- `getValidator(uint256 tokenId) returns (address)`: Returns validating supervisor

**Events**:
- `ThesisValidated(uint256 indexed tokenId, address indexed supervisor, uint256 timestamp)`
- `SupervisorAdded(address indexed supervisor, string university)`
- `SupervisorRemoved(address indexed supervisor)`

**Inherits**: AccessControl, Ownable

### Frontend Libraries and Hooks

#### lib/camp.ts

**Purpose**: Core integration with Origin SDK for authentication and minting operations.

**Exports**:
- `createCampAuth(clientId: string, environment: 'DEVELOPMENT' | 'PRODUCTION')`: Initializes Auth instance
- `useMintThesis()`: Hook for minting thesis IPNFTs
- `useForkThesis(tokenId: string)`: Hook for forking existing theses
- `useGetThesis(tokenId: string)`: Hook for fetching thesis data
- `useGetEarnings(address: string)`: Hook for fetching user earnings
- `useGetSocials()`: Hook for fetching linked social accounts
- `useLinkSocial(platform: 'twitter' | 'spotify' | 'tiktok')`: Hook for linking social accounts

**Key Functions**:
```typescript
async function mintThesis(
  files: File[],
  metadata: ThesisMetadata,
  royaltyBps: number
): Promise<string> {
  // 1. Upload files to IPFS via nft.storage
  // 2. Call Origin SDK mintFile with metadata and license terms
  // 3. Call ThesisRegistry.mintThesis with IPFS URI
  // 4. Return token ID
}

async function forkThesis(
  parentId: string,
  newFiles: File[],
  metadata: ThesisMetadata
): Promise<string> {
  // 1. Check USDC balance
  // 2. Upload new files to IPFS
  // 3. Call ForkTracker.forkThesis with parent ID
  // 4. Transfer license fee to RoyaltySplitter
  // 5. Return new token ID
}
```

#### lib/ipfs.ts

**Purpose**: Handle file uploads to IPFS via nft.storage.

**Exports**:
- `uploadFiles(files: File[], progressCallback?: (progress: number) => void): Promise<string>`: Uploads files and returns CID
- `uploadMetadata(metadata: object): Promise<string>`: Uploads JSON metadata
- `getIPFSUrl(cid: string): string`: Constructs IPFS gateway URL

#### lib/contracts.ts

**Purpose**: Contract ABIs and deployed addresses.

**Exports**:
- `THESIS_REGISTRY_ABI`: ABI for ThesisRegistry contract
- `ROYALTY_SPLITTER_ABI`: ABI for RoyaltySplitter contract
- `FORK_TRACKER_ABI`: ABI for ForkTracker contract
- `UNIVERSITY_VALIDATOR_ABI`: ABI for UniversityValidator contract
- `CONTRACT_ADDRESSES`: Object containing deployed contract addresses
- `USDC_ADDRESS`: Testnet USDC token address
- `ORIGIN_FACTORY_ADDRESS`: Origin Factory address

### React Components

#### components/ShareToX.tsx

**Purpose**: Button component for sharing theses on Twitter/X with automatic Share IP minting.

**Props**:
- `thesisId: string`: Token ID of thesis to share
- `title: string`: Thesis title for tweet text
- `className?: string`: Optional styling

**Behavior**:
1. Compose tweet with thesis title, link, and hashtags
2. Attempt to post via Twitter API (if bearer token available)
3. On success, call Origin SDK mintSocial to create Share IP with 5% royalty
4. On API failure, fallback to window.open with Twitter intent URL
5. Display success toast with confetti animation
6. Add share activity to user's activity feed

#### app/auth/signup/page.tsx

**Purpose**: Social authentication signup page with university selection.

**Features**:
- University dropdown (7+ African universities)
- LinkButton components for Twitter, Spotify, TikTok
- Wallet connect fallback button
- Loading states during OAuth flow
- Auto-mint free Thesis Profile IP on successful link
- Redirect to dashboard after completion

#### app/auth/callback/page.tsx

**Purpose**: OAuth callback handler for social authentication.

**Behavior**:
1. Parse OAuth query parameters
2. Call Origin SDK to confirm social link
3. Display loading message
4. Redirect to dashboard on success
5. Display error toast and redirect to signup on failure

## Data Models

### ThesisMetadata (IPFS JSON)

```typescript
interface ThesisMetadata {
  name: string;                    // Thesis title
  description: string;             // Abstract/summary
  image?: string;                  // Cover image URL
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // Standard attributes:
  // - University: string
  // - Department: string
  // - Year: number
  // - Author: string
  // - Supervisor?: string
  // - Keywords: string[]
  files: Array<{
    type: 'pdf' | 'code' | 'video';
    cid: string;                   // IPFS CID
    name: string;
    size: number;
  }>;
}
```

### LicenseTerms

```typescript
interface LicenseTerms {
  price: bigint;                   // Price in wei (min: 1000000000000000)
  duration: number;                // Duration in seconds (86400 - 2628000)
  royaltyBps: number;              // Royalty in basis points (1 - 10000)
  paymentToken: Address;           // USDC address or zeroAddress for native
}
```

### UserActivity

```typescript
interface UserActivity {
  id: string;
  type: 'minted' | 'forked' | 'shared' | 'validated';
  tokenId: string;
  metadata: {
    name: string;
    description?: string;
  };
  earnings: string;                // USDC amount
  timestamp: number;
  transactionHash: string;
}
```

### ThesisCard

```typescript
interface ThesisCard {
  tokenId: string;
  title: string;
  author: Address;
  university: string;
  department: string;
  year: number;
  royaltyBps: number;
  totalEarnings: string;           // USDC
  forkCount: number;
  isValidated: boolean;
  validator?: Address;
  coverImage?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Connection Properties

**Property 1: Wallet authentication updates UI state**
*For any* valid wallet address, when authentication completes successfully, the navigation bar should display the formatted wallet address.
**Validates: Requirements 1.4**

**Property 2: Social OAuth triggers profile minting**
*For any* successful OAuth completion, the system should automatically mint a free Thesis Profile IP with 0% royalty.
**Validates: Requirements 1.7**

**Property 3: Profile minting redirects to dashboard**
*For any* completed profile IP mint, the system should redirect to the dashboard and display a success notification.
**Validates: Requirements 1.8**

### Minting Properties

**Property 4: File type validation accepts valid formats**
*For any* file with extension .pdf, .zip, .tar.gz, .mp4, or .mov, the upload system should accept the file in step one.
**Validates: Requirements 2.2**

**Property 5: Royalty bounds enforcement**
*For any* royalty percentage input, the system should reject values less than 1% or greater than 100%.
**Validates: Requirements 2.4**

**Property 6: IPFS upload triggers SDK minting**
*For any* successful IPFS upload, the system should call Origin SDK mintFile with the returned CID.
**Validates: Requirements 2.6**

**Property 7: Minting sequence completes correctly**
*For any* thesis mint operation, the sequence IPFS upload → Origin mintFile → ThesisRegistry.mintThesis should execute in order without skipping steps.
**Validates: Requirements 2.5, 2.6, 2.7**

**Property 8: Successful mint triggers navigation**
*For any* completed thesis mint, the system should redirect to /thesis/[tokenId] where tokenId matches the minted token.
**Validates: Requirements 2.9**

### Forking Properties

**Property 9: Fork requires sufficient balance**
*For any* fork attempt, if the user's USDC balance is less than the license fee, the system should prevent the fork and display an error.
**Validates: Requirements 3.3**

**Property 10: Fork creates parent-child relationship**
*For any* successful fork operation, the new IPNFT should have the original thesis ID in its parents array.
**Validates: Requirements 3.8**

**Property 11: Fork triggers royalty distribution**
*For any* fork transaction, the license fee should be transferred to RoyaltySplitter and automatically distributed to the original author.
**Validates: Requirements 3.6, 3.7**

### Validation Properties

**Property 12: Validation requires supervisor role**
*For any* validation attempt, if the caller does not have supervisor role in UniversityValidator, the transaction should revert.
**Validates: Requirements 4.2**

**Property 13: Validation emits event**
*For any* successful validation transaction, the system should emit a ThesisValidated event with correct tokenId and supervisor address.
**Validates: Requirements 4.5**

**Property 14: Validated thesis displays badge**
*For any* thesis with isValidated() returning true, the thesis detail page should display a verified badge.
**Validates: Requirements 4.6**

### Dashboard and Earnings Properties

**Property 15: Dashboard queries user IPNFTs**
*For any* user address, when the dashboard loads, the system should query the blockchain for all IPNFTs owned by that address.
**Validates: Requirements 5.2**

**Property 16: Earnings calculation is accurate**
*For any* set of IPNFTs, the total earnings displayed should equal the sum of individual IPNFT earnings.
**Validates: Requirements 5.4**

**Property 17: Claim button appears when royalties exist**
*For any* user with unclaimed royalties greater than zero, the dashboard should display a claim button.
**Validates: Requirements 5.7**

### Social Integration Properties

**Property 18: Social link status displays correctly**
*For any* social platform (Twitter, Spotify, TikTok), the dashboard should display "Linked" if getLinkedSocials returns true for that platform, otherwise "Not Linked".
**Validates: Requirements 6.3**

**Property 19: OAuth callback confirms link**
*For any* successful OAuth callback, the system should verify the social link via getLinkedSocials before redirecting to dashboard.
**Validates: Requirements 6.7**

**Property 20: Share creates derivative IP**
*For any* successful tweet post, the system should call Origin SDK mintSocial to create a Share IP with 5% royalty.
**Validates: Requirements 7.5, 7.6**

**Property 21: Share fallback on API failure**
*For any* Twitter API failure, the system should open a Twitter compose window with the pre-filled tweet text.
**Validates: Requirements 7.8**

**Property 22: Share updates activity feed**
*For any* completed share operation, a new activity entry should appear in the user's activity feed.
**Validates: Requirements 7.9**

### Search and Leaderboard Properties

**Property 23: Search query returns matching results**
*For any* search query, all returned thesis cards should contain the query string in title, author, or university fields.
**Validates: Requirements 9.2**

**Property 24: Filters refine results correctly**
*For any* applied filter (university, department, year), all returned results should match the filter criteria.
**Validates: Requirements 9.4**

**Property 25: Leaderboard sorts by earnings**
*For any* leaderboard display, thesis entries should be ordered by totalEarnings in descending order.
**Validates: Requirements 10.3**

**Property 26: University aggregation is correct**
*For any* university in the leaderboard, the total earnings should equal the sum of earnings from all theses from that university.
**Validates: Requirements 10.6**

### Deployment and Seeding Properties

**Property 27: Contract deployment sequence**
*For any* deployment run, contracts should deploy in order: ThesisRegistry → RoyaltySplitter → ForkTracker → UniversityValidator.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

**Property 28: Verification saves addresses**
*For any* successful contract verification, the contract address should be saved to lib/contracts.ts configuration.
**Validates: Requirements 11.6**

**Property 29: Seed data meets minimums**
*For any* seed script execution, the system should create at least 15 theses, 7 universities, 5 forks, and 3 shares.
**Validates: Requirements 12.1, 12.2, 12.3, 12.5**

**Property 30: Seed script completes within time limit**
*For any* seed script execution, the total runtime should be less than 120 seconds.
**Validates: Requirements 12.7**

### UI Feedback Properties

**Property 31: Transaction loading states**
*For any* pending blockchain transaction, the UI should display a loading spinner or progress indicator.
**Validates: Requirements 13.1**

**Property 32: Success triggers notification**
*For any* successful transaction, the system should display a success toast notification.
**Validates: Requirements 13.2**

**Property 33: Failure displays error message**
*For any* failed transaction, the system should display an error toast with a descriptive message.
**Validates: Requirements 13.3**

**Property 34: Major actions trigger confetti**
*For any* major success event (mint, fork, share, validation), the system should trigger a confetti animation.
**Validates: Requirements 13.7**

### Mobile Responsiveness Properties

**Property 35: Mobile layout is responsive**
*For any* page viewed on a mobile device (viewport width < 768px), the layout should stack components vertically and use mobile-optimized spacing.
**Validates: Requirements 14.1**

**Property 36: Mobile OAuth redirects correctly**
*For any* OAuth flow completed on a mobile browser, the callback should redirect to the dashboard without errors.
**Validates: Requirements 14.4**

## Error Handling

### Transaction Errors

**Insufficient Balance**: When user lacks USDC for license fees
- Display: "Insufficient USDC balance. You need X USDC to fork this thesis."
- Action: Provide link to testnet faucet or USDC acquisition guide

**Transaction Reverted**: When smart contract call fails
- Display: "Transaction failed: [reason from contract]"
- Action: Offer retry button, log error details for debugging

**Network Timeout**: When RPC call times out
- Display: "Network timeout. Please check your connection and try again."
- Action: Automatic retry with exponential backoff (3 attempts)

### Authentication Errors

**OAuth Failure**: When social authentication fails
- Display: "Social login failed. Try connecting with your wallet instead."
- Action: Redirect to signup page with wallet option highlighted

**Wallet Connection Rejected**: When user rejects wallet connection
- Display: "Wallet connection rejected. Please try again."
- Action: Keep modal open for retry

**Invalid Signature**: When SIWE signature verification fails
- Display: "Signature verification failed. Please sign the message to continue."
- Action: Prompt for signature again

### File Upload Errors

**File Too Large**: When file exceeds size limit (100MB)
- Display: "File too large. Maximum size is 100MB."
- Action: Highlight file size requirements

**Invalid File Type**: When file type not supported
- Display: "Invalid file type. Supported formats: PDF, ZIP, TAR.GZ, MP4, MOV"
- Action: Show supported formats list

**IPFS Upload Failed**: When nft.storage upload fails
- Display: "File upload failed. Please try again."
- Action: Retry button with progress indicator

### Validation Errors

**Not Supervisor**: When non-supervisor attempts validation
- Display: "You don't have permission to validate theses. Supervisor role required."
- Action: Explain how to become a supervisor

**Already Validated**: When thesis is already validated
- Display: "This thesis has already been validated by [supervisor address]."
- Action: Show validation details

### General Error Handling Strategy

1. **User-Friendly Messages**: All errors display clear, actionable messages
2. **Logging**: All errors logged to console with full stack traces
3. **Retry Logic**: Network errors automatically retry with exponential backoff
4. **Fallbacks**: Critical features have fallback options (e.g., Twitter API → window.open)
5. **Error Boundaries**: React error boundaries catch and display component errors
6. **Toast Notifications**: All errors display via sonner toast with appropriate duration

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Coverage Areas**:
- Hook logic (useMintThesis, useForkThesis, etc.)
- Utility functions (file validation, address formatting, IPFS URL construction)
- Component rendering (buttons, modals, cards)
- Form validation (royalty bounds, required fields)

**Example Unit Tests**:
```typescript
describe('useMintThesis', () => {
  it('should validate royalty percentage bounds', () => {
    // Test royalty < 1% is rejected
    // Test royalty > 100% is rejected
    // Test royalty between 1-100% is accepted
  });

  it('should upload files to IPFS before minting', async () => {
    // Mock nft.storage upload
    // Verify upload called before mintFile
  });
});

describe('ShareToX component', () => {
  it('should compose tweet with thesis title and link', () => {
    // Render component with thesis data
    // Click share button
    // Verify tweet text contains title and link
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test runs minimum 100 iterations with random inputs

**Test Tagging**: Each property test includes comment with format:
```typescript
// Feature: thesischain-integration, Property 5: Royalty bounds enforcement
// Validates: Requirements 2.4
```

**Example Property Tests**:
```typescript
import fc from 'fast-check';

// Feature: thesischain-integration, Property 5: Royalty bounds enforcement
// Validates: Requirements 2.4
test('royalty percentage validation rejects out-of-bounds values', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: -1000, max: 0 }), // Below minimum
      (royalty) => {
        const result = validateRoyalty(royalty);
        expect(result.valid).toBe(false);
      }
    ),
    { numRuns: 100 }
  );

  fc.assert(
    fc.property(
      fc.integer({ min: 101, max: 10000 }), // Above maximum
      (royalty) => {
        const result = validateRoyalty(royalty);
        expect(result.valid).toBe(false);
      }
    ),
    { numRuns: 100 }
  );

  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 100 }), // Valid range
      (royalty) => {
        const result = validateRoyalty(royalty);
        expect(result.valid).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: thesischain-integration, Property 16: Earnings calculation is accurate
// Validates: Requirements 5.4
test('total earnings equals sum of individual IPNFT earnings', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        tokenId: fc.hexaString({ minLength: 64, maxLength: 64 }),
        earnings: fc.bigInt({ min: 0n, max: 1000000000000000000n })
      }), { minLength: 1, maxLength: 20 }),
      (ipnfts) => {
        const expectedTotal = ipnfts.reduce((sum, nft) => sum + nft.earnings, 0n);
        const calculatedTotal = calculateTotalEarnings(ipnfts);
        expect(calculatedTotal).toBe(expectedTotal);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: thesischain-integration, Property 23: Search query returns matching results
// Validates: Requirements 9.2
test('search results contain query string', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 3, maxLength: 50 }),
      fc.array(fc.record({
        title: fc.string(),
        author: fc.hexaString({ minLength: 40, maxLength: 40 }),
        university: fc.string()
      })),
      (query, allTheses) => {
        const results = searchTheses(query, allTheses);
        results.forEach(thesis => {
          const matchesQuery = 
            thesis.title.toLowerCase().includes(query.toLowerCase()) ||
            thesis.author.toLowerCase().includes(query.toLowerCase()) ||
            thesis.university.toLowerCase().includes(query.toLowerCase());
          expect(matchesQuery).toBe(true);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**Framework**: Playwright for E2E testing

**Test Scenarios**:
1. **Complete Mint Flow**: Connect wallet → Navigate to mint → Upload files → Set details → Mint → Verify on detail page
2. **Fork Flow**: View thesis → Click fork → Pay fee → Upload files → Verify new thesis created with parent link
3. **Social Auth Flow**: Visit signup → Link Twitter → Verify profile IP minted → Check dashboard
4. **Share Flow**: View thesis → Click share → Verify tweet composed → Check Share IP created
5. **Dashboard Flow**: Connect → View dashboard → Verify theses displayed → Check earnings chart

**Mock Strategy**:
- Mock IPFS uploads in tests (use local storage)
- Mock Twitter API calls (return success/failure)
- Use testnet for actual blockchain interactions
- Mock Origin SDK in unit tests, use real SDK in E2E tests

### Contract Testing

**Framework**: Hardhat + Chai

**Test Coverage**:
- Deployment and initialization
- Access control (onlyOwner, onlySupervisor)
- Minting with valid/invalid parameters
- Royalty distribution calculations
- Fork parent-child relationships
- Validation permissions
- Event emissions

**Example Contract Tests**:
```javascript
describe('ThesisRegistry', () => {
  it('should mint thesis with valid parameters', async () => {
    const uri = 'ipfs://QmTest123';
    const royaltyBps = 1000; // 10%
    const tx = await thesisRegistry.mintThesis(uri, royaltyBps);
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'ThesisMinted');
    expect(event.args.uri).to.equal(uri);
    expect(event.args.royaltyBps).to.equal(royaltyBps);
  });

  it('should reject royalty below minimum', async () => {
    await expect(
      thesisRegistry.mintThesis('ipfs://QmTest', 0)
    ).to.be.revertedWith('Royalty too low');
  });
});

describe('RoyaltySplitter', () => {
  it('should distribute royalties correctly', async () => {
    const recipients = [author.address, supervisor.address];
    const shares = [80, 20]; // 80% author, 20% supervisor
    const amount = ethers.utils.parseUnits('100', 6); // 100 USDC
    
    await royaltySplitter.splitRoyalties(recipients, shares, amount);
    
    const authorBalance = await royaltySplitter.getPendingRoyalties(author.address);
    const supervisorBalance = await royaltySplitter.getPendingRoyalties(supervisor.address);
    
    expect(authorBalance).to.equal(ethers.utils.parseUnits('80', 6));
    expect(supervisorBalance).to.equal(ethers.utils.parseUnits('20', 6));
  });
});
```

### Testing Execution Strategy

1. **Development**: Run unit tests on file save (watch mode)
2. **Pre-commit**: Run all unit tests + linting
3. **CI/CD**: Run unit + integration + contract tests on PR
4. **Pre-deployment**: Run full test suite + manual E2E verification
5. **Post-deployment**: Run smoke tests on testnet

### Test Data Management

**Seed Data for Testing**:
- 15 realistic thesis metadata objects
- 7 African university names
- Sample PDF/code/video files (small sizes for speed)
- Mock wallet addresses for authors/supervisors
- Predefined royalty splits

**Test Wallets**:
- Author wallet (funded with testnet ETH + USDC)
- Supervisor wallet (granted supervisor role)
- Forker wallet (funded for fork fees)
- Unfunded wallet (for balance check tests)

This comprehensive testing strategy ensures all user flows work correctly, all properties hold across random inputs, and all smart contracts behave as expected. The combination of unit tests, property-based tests, and integration tests provides high confidence in system correctness before deployment.
