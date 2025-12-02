# Implementation Plan

- [x] 1. Project setup and configuration
- [x] 1.1 Install required dependencies
  - Install Hardhat and contract development tools: @nomicfoundation/hardhat-toolbox, @nomicfoundation/hardhat-verify, @openzeppelin/contracts, ethers
  - Install frontend dependencies: nft.storage, axios, zustand, react-pdf
  - Verify @campnetwork/origin, viem, wagmi, @tanstack/react-query are installed
  - _Requirements: 11.1_

- [x] 1.2 Create environment configuration
  - Create .env.local with all required variables (PRIVATE_KEY, BLOCKSCOUT_API_KEY, NEXT_PUBLIC_CAMP_CLIENT_ID, etc.)
  - Add .env.local to .gitignore
  - Create .env.example with placeholder values for documentation
  - _Requirements: 11.1_

- [x] 1.3 Configure Hardhat
  - Create hardhat.config.js with Basecamp testnet configuration
  - Set up Blockscout verification with custom chain configuration
  - Configure solidity compiler version 0.8.24
  - Add network configuration for Chain ID 123420001114
  - _Requirements: 11.1_

- [x] 1.4 Update package.json scripts
  - Add "deploy" script: hardhat run scripts/deploy.js --network basecamp
  - Add "verify" script: hardhat verify --network basecamp
  - Add "seed" script: ts-node scripts/seed.ts
  - Add "full" script: npm run deploy && npm run verify && npm run seed
  - _Requirements: 11.1_

- [x] 2. Smart contract development
- [x] 2.1 Implement ThesisRegistry contract
  - Create contracts/ThesisRegistry.sol
  - Implement mintThesis function with Origin Factory integration
  - Implement getThesis, getThesesByAuthor, updateMetadata functions
  - Add ThesisMinted and MetadataUpdated events
  - Inherit Ownable and ReentrancyGuard from OpenZeppelin
  - _Requirements: 2.7, 11.1_

- [x] 2.2 Implement RoyaltySplitter contract
  - Create contracts/RoyaltySplitter.sol
  - Implement splitRoyalties function with USDC ERC20 transfers
  - Implement getPendingRoyalties and claimRoyalties functions
  - Implement setRoyaltyShares for configuring splits
  - Add RoyaltiesSplit and RoyaltiesClaimed events
  - Integrate with USDC at 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a
  - _Requirements: 3.6, 3.7, 5.8_

- [x] 2.3 Implement ForkTracker contract
  - Create contracts/ForkTracker.sol
  - Implement forkThesis function with parent-child relationship tracking
  - Implement getParents, getChildren, getForkTree functions
  - Add ThesisForked and ForkTreeUpdated events
  - Integrate with ThesisRegistry and RoyaltySplitter
  - _Requirements: 3.5, 3.8_

- [x] 2.4 Implement UniversityValidator contract
  - Create contracts/UniversityValidator.sol
  - Implement validate function with onlySupervisor modifier
  - Implement addSupervisor, removeSupervisor functions
  - Implement isValidated and getValidator view functions
  - Add ThesisValidated, SupervisorAdded, SupervisorRemoved events
  - Use AccessControl from OpenZeppelin for role management
  - _Requirements: 4.2, 4.4, 4.5_

- [x] 2.5 Write contract unit tests
  - Test ThesisRegistry minting with valid/invalid parameters
  - Test RoyaltySplitter royalty distribution calculations
  - Test ForkTracker parent-child relationships
  - Test UniversityValidator role-based access control
  - Test all event emissions
  - Test access control modifiers (onlyOwner, onlySupervisor)
  - _Requirements: 11.1_

- [x] 3. Contract deployment and verification
- [x] 3.1 Create deployment script
  - Create scripts/deploy.js
  - Deploy contracts in sequence: ThesisRegistry → RoyaltySplitter → ForkTracker → UniversityValidator
  - Log deployed contract addresses
  - Save addresses to deployments.json
  - Handle deployment errors with retry logic
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 3.2 Create verification script
  - Create scripts/verify.js
  - Verify each contract on Blockscout using API
  - Read addresses from deployments.json
  - Retry verification on failure (up to 3 attempts)
  - Log verification status for each contract
  - _Requirements: 11.5, 11.7_

- [x] 3.3 Update frontend contract configuration
  - Create lib/contracts.ts with contract ABIs
  - Export THESIS_REGISTRY_ABI, ROYALTY_SPLITTER_ABI, FORK_TRACKER_ABI, UNIVERSITY_VALIDATOR_ABI
  - Export CONTRACT_ADDRESSES object with deployed addresses
  - Export USDC_ADDRESS and ORIGIN_FACTORY_ADDRESS constants
  - _Requirements: 11.6_

- [x] 4. IPFS integration
- [x] 4.1 Implement IPFS upload utilities
  - Create lib/ipfs.ts
  - Implement uploadFiles function with nft.storage client
  - Add progress callback support for upload progress
  - Implement uploadMetadata function for JSON uploads
  - Implement getIPFSUrl function for gateway URL construction
  - Handle upload errors with retry logic
  - _Requirements: 2.5_

- [x] 4.2 Write property test for IPFS uploads
  - **Property 6: IPFS upload triggers SDK minting**
  - **Validates: Requirements 2.6**
  - Test that successful IPFS upload returns valid CID
  - Test that upload progress callback is called with increasing percentages
  - _Requirements: 2.6_

- [x] 5. Origin SDK integration and authentication
- [x] 5.1 Update root layout with CampProvider
  - Update components/root-layout-client.tsx to wrap with CampProvider from @campnetwork/origin/react
  - Configure environment="DEVELOPMENT" for Basecamp testnet
  - Set clientId from NEXT_PUBLIC_CAMP_CLIENT_ID env variable
  - Add baseParentId configuration (optional)
  - Ensure QueryClientProvider wraps CampProvider
  - _Requirements: 1.3_

- [x] 5.2 Create Camp SDK integration library
  - Create lib/camp.ts
  - Export useMintThesis hook for thesis minting flow
  - Export useForkThesis hook for forking flow
  - Export useGetThesis hook for fetching thesis data
  - Export useGetEarnings hook for fetching user earnings
  - _Requirements: 1.3, 2.6, 3.5, 5.2_

- [x] 5.3 Implement mint thesis hook
  - In lib/camp.ts, implement useMintThesis hook
  - Upload files to IPFS via uploadFiles utility from lib/ipfs.ts
  - Create LicenseTerms with createLicenseTerms helper from @campnetwork/origin
  - Call Origin SDK mintFile with metadata and license
  - Call ThesisRegistry.mintThesis with IPFS URI using wagmi
  - Return token ID on success
  - Handle errors and display toast notifications
  - _Requirements: 2.5, 2.6, 2.7_

- [x] 5.4 Write property test for mint sequence
  - **Property 7: Minting sequence completes correctly**
  - **Validates: Requirements 2.5, 2.6, 2.7**
  - Test that IPFS upload → Origin mintFile → ThesisRegistry.mintThesis executes in order
  - Verify no steps are skipped
  - _Requirements: 2.5, 2.6, 2.7_

- [x] 5.5 Implement fork thesis hook
  - In lib/camp.ts, implement useForkThesis hook
  - Check user USDC balance before proceeding using wagmi
  - Upload new files to IPFS
  - Call ForkTracker.forkThesis with parent ID
  - Transfer license fee to RoyaltySplitter
  - Return new token ID on success
  - Handle insufficient balance error
  - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 5.6 Write property test for fork balance check
  - **Property 9: Fork requires sufficient balance**
  - **Validates: Requirements 3.3**
  - Test that fork is prevented when USDC balance < license fee
  - Test that error message is displayed
  - _Requirements: 3.3_

- [x] 5.7 Write property test for fork parent relationship
  - **Property 10: Fork creates parent-child relationship**
  - **Validates: Requirements 3.8**
  - Test that new IPNFT has original thesis ID in parents array
  - Verify parent-child link is recorded correctly
  - _Requirements: 3.8_

- [x] 6. Social authentication pages
- [x] 6.1 Create social signup page
  - Create app/auth/signup/page.tsx
  - Add university dropdown with 7+ African universities (UNILAG, UG, Makerere, etc.)
  - Use LinkButton components from @campnetwork/origin/react for Twitter, Spotify, TikTok
  - Add wallet connect fallback button using Web3Modal
  - Implement handleSocialSignup function with OAuth flow using useLinkSocials hook
  - Auto-mint free Thesis Profile IP on successful link (0% royalty) using Origin SDK
  - Redirect to dashboard after profile minting
  - Add loading states during OAuth and minting
  - _Requirements: 1.5, 1.6, 1.7, 1.8_

- [x] 6.2 Write property test for profile minting
  - **Property 2: Social OAuth triggers profile minting**
  - **Validates: Requirements 1.7**
  - Test that successful OAuth completion triggers profile IP mint
  - Verify profile IP has 0% royalty
  - _Requirements: 1.7_

- [x] 6.3 Create OAuth callback page
  - Create app/auth/callback/page.tsx
  - Parse OAuth query parameters from URL
  - Use useSocials hook from @campnetwork/origin/react to confirm social link
  - Display loading message during confirmation
  - Redirect to dashboard on success using Next.js router
  - Display error toast and redirect to signup on failure
  - _Requirements: 1.8, 6.6, 6.7_

- [x] 6.4 Write property test for callback redirect
  - **Property 19: OAuth callback confirms link**
  - **Validates: Requirements 6.7**
  - Test that callback verifies social link before redirecting
  - Verify redirect only occurs after confirmation
  - _Requirements: 6.7_

- [-] 7. Dashboard enhancements
- [x] 7.1 Add profile and socials section to dashboard
  - Update components/dashboard/dashboard-client.tsx
  - Add "Profile & Socials" section to the dashboard
  - Use useSocials hook from @campnetwork/origin/react to fetch linked accounts
  - Display linked status for Twitter, Spotify, TikTok
  - Add link/unlink buttons for each platform using LinkButton component
  - Implement unlink functionality with toast notifications
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8, 6.9_

- [x] 7.2 Write property test for social link display
  - **Property 18: Social link status displays correctly**
  - **Validates: Requirements 6.3**
  - Test that "Linked" displays when useSocials returns true for platform
  - Test that "Not Linked" displays when useSocials returns false for platform
  - _Requirements: 6.3_

- [x] 7.3 Add activity feed section to dashboard
  - Update components/dashboard/dashboard-client.tsx
  - Add "Activity Feed" section to the dashboard
  - Query user IPNFT activities via blockchain events using viem
  - Display list of mints, forks, and shares
  - Show activity type, thesis name, and earnings for each entry
  - Implement pagination or infinite scroll for long lists
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 7.4 Write property test for activity display
  - **Property 22: Share updates activity feed**
  - **Validates: Requirements 7.9**
  - Test that completed share operation adds entry to activity feed
  - Verify activity entry contains correct data
  - _Requirements: 7.9_

- [x] 7.5 Implement earnings display and claim functionality
  - Update components/dashboard/dashboard-client.tsx to connect to blockchain
  - Query blockchain for user IPNFT balance using wagmi hooks
  - Fetch earnings data for each token ID from RoyaltySplitter contract
  - Calculate and display total earnings in USDC
  - Update EarningsChart component with real data
  - Display claim button when unclaimed royalties exist
  - Implement claim functionality calling RoyaltySplitter.claimRoyalties
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ]* 7.6 Write property test for earnings calculation
  - **Property 16: Earnings calculation is accurate**
  - **Validates: Requirements 5.4**
  - Test that total earnings equals sum of individual IPNFT earnings
  - Use property-based testing with random earning amounts
  - _Requirements: 5.4_

- [ ]* 7.7 Write property test for claim button visibility
  - **Property 17: Claim button appears when royalties exist**
  - **Validates: Requirements 5.7**
  - Test that claim button displays when unclaimed royalties > 0
  - Test that claim button is hidden when unclaimed royalties = 0
  - _Requirements: 5.7_

- [x] 8. Share to X functionality
- [x] 8.1 Create ShareToX component
  - Create components/ShareToX.tsx
  - Accept thesisId and title as props
  - Implement handleShare function
  - Compose tweet with thesis title, link, and hashtags (#ThesisChainAfrica #CampNetwork)
  - Attempt to post via Twitter API using NEXT_PUBLIC_X_BEARER_TOKEN and axios
  - On API success, call Origin SDK mintSocial to create Share IP with 5% royalty
  - On API failure, fallback to window.open with Twitter intent URL
  - Display success toast with confetti on completion using sonner and react-confetti
  - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ]* 8.2 Write property test for share IP creation
  - **Property 20: Share creates derivative IP**
  - **Validates: Requirements 7.5, 7.6**
  - Test that successful tweet triggers mintSocial call
  - Verify Share IP has 5% royalty
  - _Requirements: 7.5, 7.6_

- [ ]* 8.3 Write property test for share fallback
  - **Property 21: Share fallback on API failure**
  - **Validates: Requirements 7.8**
  - Test that Twitter API failure opens compose window
  - Verify tweet text is pre-filled correctly
  - _Requirements: 7.8_

- [x] 8.4 Add share buttons to thesis pages
  - Update components/thesis/thesis-viewer.tsx to include ShareToX component
  - Update components/search/thesis-search-card.tsx to include share icon
  - Update components/dashboard/thesis-grid.tsx cards to include share icon
  - Pass thesis ID and title to ShareToX component
  - Style buttons to match existing design
  - _Requirements: 7.1, 7.2_

- [x] 9. Mint wizard integration
- [x] 9.1 Connect mint wizard to blockchain
  - Update components/mint-wizard.tsx to integrate useMintThesis hook from lib/camp.ts
  - Replace mock minting with real blockchain transaction in handleMint function
  - Add file type validation in components/mint-steps/step-one.tsx (PDF, ZIP, TAR.GZ, MP4, MOV)
  - Add form validation in components/mint-steps/step-two.tsx (title, abstract, university required)
  - Add royalty bounds validation in components/mint-steps/step-three.tsx (1% - 100%)
  - Display upload progress during IPFS upload using progress callback
  - Show loading state during minting transaction
  - Display success toast with confetti on completion (already implemented)
  - Redirect to /thesis/[tokenId] on success using Next.js router
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8, 2.9_

- [x] 9.2 Write property test for file type validation
  - **Property 4: File type validation accepts valid formats**
  - **Validates: Requirements 2.2**
  - Test that .pdf, .zip, .tar.gz, .mp4, .mov files are accepted
  - Test that other file types are rejected
  - _Requirements: 2.2_

- [x] 9.3 Write property test for royalty bounds
  - **Property 5: Royalty bounds enforcement**
  - **Validates: Requirements 2.4**
  - Test that royalty < 1% is rejected
  - Test that royalty > 100% is rejected
  - Test that royalty between 1-100% is accepted
  - _Requirements: 2.4_

- [x] 9.4 Write property test for mint redirect
  - **Property 8: Successful mint triggers navigation**
  - **Validates: Requirements 2.9**
  - Test that completed mint redirects to /thesis/[tokenId]
  - Verify tokenId in URL matches minted token
  - _Requirements: 2.9_

- [x] 10. Thesis detail page enhancements
- [x] 10.1 Add fork functionality to thesis detail page
  - Update components/thesis/thesis-viewer.tsx to connect fork modal to blockchain
  - Update components/thesis/fork-modal.tsx to integrate useForkThesis hook from lib/camp.ts
  - Display license fee from blockchain in modal
  - Check USDC balance before allowing fork using wagmi
  - Display file upload interface for new files in modal
  - Show loading state during fork transaction
  - Display success notification on completion with confetti
  - Redirect to new thesis page after fork using Next.js router
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.9_

- [ ]* 10.2 Write property test for royalty distribution
  - **Property 11: Fork triggers royalty distribution**
  - **Validates: Requirements 3.6, 3.7**
  - Test that fork transaction transfers fee to RoyaltySplitter
  - Verify royalties are distributed to original author
  - _Requirements: 3.6, 3.7_

- [x] 10.3 Add validation functionality for supervisors
  - Update components/thesis/thesis-viewer.tsx to add validation functionality
  - Add validate button (visible only to supervisors)
  - Check supervisor role via UniversityValidator contract using wagmi
  - Prompt for transaction signature
  - Call UniversityValidator.validate with token ID
  - Display verified badge after validation
  - Show error message if user lacks supervisor role
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_

- [ ]* 10.4 Write property test for validation permissions
  - **Property 12: Validation requires supervisor role**
  - **Validates: Requirements 4.2**
  - Test that non-supervisor validation attempts revert
  - Test that supervisor validation succeeds
  - _Requirements: 4.2_

- [ ]* 10.5 Write property test for validation event
  - **Property 13: Validation emits event**
  - **Validates: Requirements 4.5**
  - Test that successful validation emits ThesisValidated event
  - Verify event contains correct tokenId and supervisor address
  - _Requirements: 4.5_

- [x] 11. Search and leaderboard functionality
- [x] 11.1 Implement search functionality
  - Update app/search/page.tsx to query blockchain for thesis data
  - Replace MOCK_THESES with blockchain queries using wagmi/viem
  - Query ThesisRegistry contract for all theses
  - Fetch metadata from IPFS for each thesis
  - Keep existing filter controls (university, department, year)
  - Keep existing infinite scroll for pagination
  - Keep existing empty results state handling
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]* 11.2 Write property test for search results
  - **Property 23: Search query returns matching results**
  - **Validates: Requirements 9.2**
  - Test that all results contain query string in title, author, or university
  - Use property-based testing with random queries
  - _Requirements: 9.2_

- [ ]* 11.3 Write property test for search filters
  - **Property 24: Filters refine results correctly**
  - **Validates: Requirements 9.4**
  - Test that applied filters match all returned results
  - Test with different filter combinations
  - _Requirements: 9.4_

- [x] 11.4 Implement leaderboard functionality
  - Update app/leaderboard/page.tsx to query blockchain for earnings data
  - Replace MOCK_LEADERBOARD with blockchain queries using wagmi/viem
  - Query RoyaltySplitter contract for thesis earnings data
  - Sort theses by total royalties earned (descending)
  - Keep existing rankings table display
  - Add university view toggle functionality
  - Implement university earnings aggregation logic
  - Display university rankings with total earnings
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 11.5 Write property test for leaderboard sorting
  - **Property 25: Leaderboard sorts by earnings**
  - **Validates: Requirements 10.3**
  - Test that thesis entries are ordered by totalEarnings descending
  - Use property-based testing with random earning amounts
  - _Requirements: 10.3_

- [ ]* 11.6 Write property test for university aggregation
  - **Property 26: University aggregation is correct**
  - **Validates: Requirements 10.6**
  - Test that university total equals sum of all theses from that university
  - Verify aggregation logic with random data
  - _Requirements: 10.6_

- [x] 12. UI feedback and loading states
- [x] 12.1 Implement loading states for all transactions
  - Add loading spinners to all blockchain transaction buttons (mint, fork, validate, claim)
  - Display progress indicators during file uploads (already partially implemented in mint wizard)
  - Show loading overlay during OAuth flows
  - Add skeleton loaders for data fetching (already exist in search and leaderboard)
  - _Requirements: 13.1, 13.5_

- [x] 12.2 Implement toast notifications
  - Use sonner (already installed) for all toast notifications
  - Add success toasts for all successful operations (mint, fork, share, validate, claim)
  - Add error toasts for all failed operations with descriptive messages
  - Add specific error message for OAuth failures suggesting wallet fallback
  - Add retry options for network failures
  - Configure toast duration and positioning
  - _Requirements: 13.2, 13.3, 13.4, 13.6_

- [x] 12.3 Add confetti animations
  - Use react-confetti (already installed) for success animations
  - Trigger confetti on major success events: mint, fork, share, validation, profile creation
  - Configure confetti duration and particle count
  - Ensure confetti works on mobile devices
  - Note: Confetti already implemented in mint wizard, extend to other operations
  - _Requirements: 13.7_

- [ ]* 12.4 Write property test for transaction feedback
  - **Property 31: Transaction loading states**
  - **Validates: Requirements 13.1**
  - Test that pending transactions display loading indicator
  - Verify loading state is removed on completion
  - _Requirements: 13.1_

- [x] 13. Mobile responsiveness
- [x] 13.1 Verify mobile layouts
  - Test all pages on mobile viewport (< 768px)
  - Ensure components stack vertically on mobile (already implemented with Tailwind responsive classes)
  - Verify mobile navigation menu works correctly
  - Test wallet connection modal on mobile
  - Test OAuth redirects on mobile browsers
  - Verify charts render with touch-friendly interactions
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ]* 13.2 Write property test for mobile responsiveness
  - **Property 35: Mobile layout is responsive**
  - **Validates: Requirements 14.1**
  - Test that viewport < 768px triggers mobile layout
  - Verify components stack vertically
  - _Requirements: 14.1_

- [x] 14. Seeding and demo data
- [x] 14.1 Create seed script
  - Create scripts/seed.ts
  - Use ethers or viem to interact with deployed contracts
  - Mint 15 realistic thesis IPNFTs with diverse metadata
  - Use data from 7+ African universities (UNILAG, UG, Makerere, Strathmore, etc.)
  - Create 5 fork relationships between theses using ForkTracker
  - Simulate royalty payments totaling 50+ USDC using RoyaltySplitter
  - Create 3 Share IPs from social media activity using Origin SDK
  - Log summary of created data
  - Ensure script completes in under 2 minutes
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 14.2 Write property test for seed data minimums
  - **Property 29: Seed data meets minimums**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.5**
  - Test that seed script creates at least 15 theses, 7 universities, 5 forks, 3 shares
  - Verify all minimum requirements are met
  - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [ ]* 14.3 Write property test for seed performance
  - **Property 30: Seed script completes within time limit**
  - **Validates: Requirements 12.7**
  - Test that seed script execution time < 120 seconds
  - Measure actual runtime
  - _Requirements: 12.7_

- [x] 15. Final integration and testing
- [x] 15.1 Run full verification
  - Execute npm run verify to verify contracts on Blockscout
  - Execute npm run update-config to save addresses to lib/contracts.ts
  - Test contract interactions via frontend
  - _Requirements: 11.1, 11.5, 11.6_

- [x] 15.2 Run seed script and verify data
  - Verify 15+ theses appear in search and leaderboard
  - Verify fork relationships are visible in thesis detail pages
  - Verify royalty payments are recorded in dashboard
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 15.3 Test all user flows end-to-end
  - Test social signup flow: signup → link Twitter → profile mint → dashboard
  - Test wallet connect flow: connect → authenticate → dashboard
  - Test mint flow: wizard → upload → mint → redirect to detail page
  - Test fork flow: detail page → fork → pay fee → new thesis created
  - Test share flow: detail page → share → tweet → Share IP created
  - Test validation flow: supervisor → validate → badge appears
  - Test dashboard: view theses → check earnings → claim royalties
  - Test search: query → filter → view results
  - Test leaderboard: view rankings → switch to university view
  - _Requirements: All_

- [x] 15.4 Checkpoint - Ensure all tests pass
  - Run npm run test to execute all unit and property tests
  - Ensure all tests pass, ask the user if questions arise
  - Fix any failing tests before proceeding to deployment
