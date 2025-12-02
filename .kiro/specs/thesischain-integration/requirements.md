# Requirements Document

## Introduction

ThesisChain Africa is a decentralized academic IP registry built on Camp Network Basecamp testnet that enables African university students, researchers, and lecturers to mint their theses and projects as composable IPNFTs (Intellectual Property NFTs). The system allows users to earn royalties when others build upon their work, provides proof of authorship, and creates a discoverable marketplace for academic research.

This specification covers the complete integration of core blockchain features, social authentication via Origin SDK, user management, and activity sharing capabilities with the existing v0.dev Next.js frontend. The goal is to make all UI components functional with on-chain interactions while maintaining the existing design.

## Glossary

- **IPNFT**: Intellectual Property Non-Fungible Token - A composable NFT representing ownership of academic work with built-in royalty mechanisms
- **Origin SDK**: Camp Network's SDK for authentication, social linking, and IPNFT minting operations
- **ThesisRegistry**: Solidity smart contract managing the minting and metadata of thesis IPNFTs
- **RoyaltySplitter**: Solidity smart contract handling automatic distribution of royalties to original authors and contributors
- **ForkTracker**: Solidity smart contract managing derivative relationships between theses (parent-child links)
- **UniversityValidator**: Solidity smart contract enabling supervisors to validate and verify student theses
- **Camp Network Basecamp**: The testnet blockchain (Chain ID: 123420001114) where all contracts are deployed
- **USDC**: Stablecoin token used for license fees and royalty payments (testnet address: 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a)
- **Origin Factory**: The deployed factory contract at 0x992C57b76E60D3c558144b15b47A73312889B12B for creating IPNFTs
- **Social Auth**: Authentication using social media accounts (Twitter/X, Spotify, TikTok) via OAuth
- **Thesis Profile IP**: A free IPNFT minted automatically when users sign up via social authentication
- **Share IP**: A derivative IPNFT created when users share thesis content on social media platforms
- **Royalty Basis Points (BPS)**: Royalty percentage expressed in basis points (100 BPS = 1%, 1000 BPS = 10%)

## Requirements

### Requirement 1

**User Story:** As a student, I want to connect to ThesisChain using my wallet or social media account, so that I can access the platform without technical barriers.

#### Acceptance Criteria

1. WHEN a user visits the landing page THEN the System SHALL display a connect button in the navigation bar
2. WHEN a user clicks the connect button THEN the System SHALL present wallet provider options via Web3Modal
3. WHEN a user selects a wallet provider THEN the System SHALL initiate the authentication flow using Origin SDK
4. WHEN a user completes wallet authentication THEN the System SHALL display the connected wallet address in the navigation bar
5. WHEN a user clicks the social signup option THEN the System SHALL redirect to the social authentication page
6. WHEN a user selects Twitter authentication THEN the System SHALL initiate OAuth flow via Origin SDK
7. WHEN OAuth completes successfully THEN the System SHALL automatically mint a free Thesis Profile IP for the user
8. WHEN profile minting completes THEN the System SHALL redirect the user to the dashboard with a success notification

### Requirement 2

**User Story:** As a researcher, I want to mint my thesis as an IPNFT with customizable royalty settings, so that I can prove ownership and earn from future usage.

#### Acceptance Criteria

1. WHEN a user navigates to the mint wizard THEN the System SHALL display a four-step minting interface
2. WHEN a user uploads files in step one THEN the System SHALL accept PDF, code archives, and video files
3. WHEN a user enters thesis details in step two THEN the System SHALL validate title, abstract, and university selection
4. WHEN a user sets royalty percentage in step three THEN the System SHALL enforce minimum 1% and maximum 100% royalty
5. WHEN a user reviews and confirms in step four THEN the System SHALL upload files to IPFS via nft.storage
6. WHEN IPFS upload completes THEN the System SHALL call Origin SDK mintFile with metadata and license terms
7. WHEN Origin minting succeeds THEN the System SHALL call ThesisRegistry.mintThesis with the IPFS URI
8. WHEN on-chain minting completes THEN the System SHALL display success notification with confetti animation
9. WHEN minting succeeds THEN the System SHALL redirect to the thesis detail page showing the new IPNFT

### Requirement 3

**User Story:** As a junior researcher, I want to fork an existing thesis and build upon it, so that I can create derivative work while compensating the original author.

#### Acceptance Criteria

1. WHEN a user views a thesis detail page THEN the System SHALL display a fork button
2. WHEN a user clicks the fork button THEN the System SHALL display a fork modal with license fee information
3. WHEN a user confirms fork action THEN the System SHALL check the user has sufficient USDC balance
4. WHEN balance is sufficient THEN the System SHALL prompt for new files upload
5. WHEN new files are uploaded THEN the System SHALL call ForkTracker.forkThesis with parent thesis ID
6. WHEN fork transaction executes THEN the System SHALL transfer license fee to RoyaltySplitter contract
7. WHEN RoyaltySplitter receives payment THEN the System SHALL automatically distribute royalties to original author
8. WHEN fork completes THEN the System SHALL mint new IPNFT with parent relationship recorded
9. WHEN fork succeeds THEN the System SHALL display success notification and redirect to new thesis page

### Requirement 4

**User Story:** As a supervisor, I want to validate student theses on-chain, so that verified work can be distinguished from unverified submissions.

#### Acceptance Criteria

1. WHEN a supervisor views a thesis requiring validation THEN the System SHALL display a validate button
2. WHEN a supervisor clicks validate THEN the System SHALL verify the supervisor role via UniversityValidator contract
3. WHEN role verification succeeds THEN the System SHALL prompt for transaction signature
4. WHEN supervisor signs transaction THEN the System SHALL call UniversityValidator.validate with thesis token ID
5. WHEN validation transaction confirms THEN the System SHALL emit ThesisValidated event
6. WHEN validation completes THEN the System SHALL display verified badge on thesis detail page
7. WHEN validation fails due to insufficient permissions THEN the System SHALL display error message explaining role requirements

### Requirement 5

**User Story:** As a thesis author, I want to view my earnings dashboard showing all royalties earned, so that I can track my passive income from thesis usage.

#### Acceptance Criteria

1. WHEN a user navigates to dashboard THEN the System SHALL display a grid of user-owned theses
2. WHEN dashboard loads THEN the System SHALL query blockchain for user IPNFT balance
3. WHEN IPNFTs are found THEN the System SHALL fetch earnings data for each token ID
4. WHEN earnings data loads THEN the System SHALL display total earnings in USDC
5. WHEN earnings exist THEN the System SHALL render an earnings chart using Recharts library
6. WHEN chart renders THEN the System SHALL show earnings over time with proper formatting
7. WHEN user has unclaimed royalties THEN the System SHALL display a claim button
8. WHEN user clicks claim THEN the System SHALL call RoyaltySplitter to transfer royalties to user wallet

### Requirement 6

**User Story:** As a user, I want to link my social media accounts to my profile, so that I can share my work and build credibility.

#### Acceptance Criteria

1. WHEN a user views dashboard THEN the System SHALL display a profile and socials section
2. WHEN profile section loads THEN the System SHALL call Origin SDK getLinkedSocials method
3. WHEN social data returns THEN the System SHALL display linked status for Twitter, Spotify, and TikTok
4. WHEN a social account is not linked THEN the System SHALL display a link button for that platform
5. WHEN user clicks link Twitter THEN the System SHALL initiate OAuth flow via Origin SDK linkTwitter
6. WHEN OAuth completes THEN the System SHALL redirect to callback page
7. WHEN callback page loads THEN the System SHALL confirm link and redirect to dashboard
8. WHEN a social account is linked THEN the System SHALL display an unlink button
9. WHEN user clicks unlink THEN the System SHALL call Origin SDK unlinkTwitter and refresh display

### Requirement 7

**User Story:** As a researcher, I want to share my thesis on social media with one click, so that I can increase visibility and earn from viral engagement.

#### Acceptance Criteria

1. WHEN a user views a thesis detail page THEN the System SHALL display a share to X button
2. WHEN a user views a thesis card THEN the System SHALL display a share icon
3. WHEN user clicks share button THEN the System SHALL compose a tweet with thesis title and link
4. WHEN tweet is composed THEN the System SHALL attempt to post via Twitter API using bearer token
5. WHEN Twitter API succeeds THEN the System SHALL call Origin SDK mintSocial to create Share IP
6. WHEN Share IP minting succeeds THEN the System SHALL set 5% royalty on the derivative IPNFT
7. WHEN share completes THEN the System SHALL display success notification with confetti
8. WHEN Twitter API fails THEN the System SHALL fallback to opening Twitter compose window
9. WHEN share is recorded THEN the System SHALL add entry to user activity feed

### Requirement 8

**User Story:** As a user, I want to view my activity feed showing all mints, forks, and shares, so that I can track my engagement history.

#### Acceptance Criteria

1. WHEN a user views dashboard THEN the System SHALL display an activity feed section
2. WHEN activity feed loads THEN the System SHALL query user IPNFT activities via GraphQL
3. WHEN activities are found THEN the System SHALL display list of mints, forks, and shares
4. WHEN displaying activity THEN the System SHALL show activity type, thesis name, and earnings
5. WHEN activity list is long THEN the System SHALL implement pagination or infinite scroll
6. WHEN new activity occurs THEN the System SHALL update feed in real-time or on refresh

### Requirement 9

**User Story:** As a visitor, I want to search for theses by university, department, or keywords, so that I can discover relevant research.

#### Acceptance Criteria

1. WHEN a user navigates to search page THEN the System SHALL display search filters and input field
2. WHEN user enters search query THEN the System SHALL query blockchain indexer for matching theses
3. WHEN results are found THEN the System SHALL display thesis cards with title, author, and university
4. WHEN user applies filters THEN the System SHALL refine results by selected criteria
5. WHEN results exceed page limit THEN the System SHALL implement infinite scroll loading
6. WHEN user clicks thesis card THEN the System SHALL navigate to thesis detail page

### Requirement 10

**User Story:** As a competitive researcher, I want to view the leaderboard showing top theses and universities by earnings, so that I can see where I rank.

#### Acceptance Criteria

1. WHEN a user navigates to leaderboard page THEN the System SHALL display rankings table
2. WHEN leaderboard loads THEN the System SHALL query blockchain for thesis earnings data
3. WHEN data loads THEN the System SHALL sort theses by total royalties earned
4. WHEN displaying rankings THEN the System SHALL show thesis title, author, university, and earnings
5. WHEN user switches to university view THEN the System SHALL aggregate earnings by institution
6. WHEN university rankings display THEN the System SHALL show total earnings across all theses from that university

### Requirement 11

**User Story:** As a developer, I want all Solidity smart contracts deployed and verified on Blockscout, so that the system is transparent and auditable.

#### Acceptance Criteria

1. WHEN contracts are written THEN the System SHALL use Solidity version 0.8.24
2. WHEN contracts require standard functionality THEN the System SHALL inherit from OpenZeppelin contracts
3. WHEN contracts implement royalties THEN the System SHALL inherit from ERC2981 standard
4. WHEN deployment script runs THEN the System SHALL deploy ThesisRegistry Solidity contract to Basecamp testnet using Hardhat
5. WHEN ThesisRegistry deploys THEN the System SHALL deploy RoyaltySplitter Solidity contract
6. WHEN RoyaltySplitter deploys THEN the System SHALL deploy ForkTracker Solidity contract
7. WHEN ForkTracker deploys THEN the System SHALL deploy UniversityValidator Solidity contract
8. WHEN all Solidity contracts deploy THEN the System SHALL verify each contract on Blockscout using API key
9. WHEN verification completes THEN the System SHALL save contract addresses to frontend configuration file
10. WHEN verification fails THEN the System SHALL log error and retry verification

### Requirement 12

**User Story:** As a demo user, I want to see realistic seeded data with multiple theses and universities, so that I can explore the platform functionality.

#### Acceptance Criteria

1. WHEN seed script runs THEN the System SHALL mint at least 15 realistic thesis IPNFTs
2. WHEN seeding theses THEN the System SHALL use data from at least 7 different African universities
3. WHEN seeding completes THEN the System SHALL create at least 5 fork relationships between theses
4. WHEN forks are created THEN the System SHALL simulate royalty payments totaling at least 50 USDC
5. WHEN seeding shares THEN the System SHALL create at least 3 Share IPs from social media activity
6. WHEN seed script completes THEN the System SHALL log summary of created data
7. WHEN seed script runs THEN the System SHALL complete in under 2 minutes

### Requirement 13

**User Story:** As a user, I want to see loading states and error messages during all operations, so that I understand what is happening and can troubleshoot issues.

#### Acceptance Criteria

1. WHEN any blockchain transaction is pending THEN the System SHALL display loading spinner or progress indicator
2. WHEN transaction succeeds THEN the System SHALL display success toast notification
3. WHEN transaction fails THEN the System SHALL display error toast with descriptive message
4. WHEN OAuth flow fails THEN the System SHALL display error suggesting wallet fallback
5. WHEN file upload is in progress THEN the System SHALL display upload progress percentage
6. WHEN network request fails THEN the System SHALL display retry option
7. WHEN success occurs THEN the System SHALL trigger confetti animation for major actions

### Requirement 14

**User Story:** As a mobile user, I want all features to work seamlessly on my phone, so that I can access ThesisChain anywhere.

#### Acceptance Criteria

1. WHEN a mobile user visits any page THEN the System SHALL display responsive layout
2. WHEN mobile user opens navigation THEN the System SHALL display mobile-optimized menu
3. WHEN mobile user connects wallet THEN the System SHALL display mobile-friendly modal
4. WHEN mobile user completes OAuth THEN the System SHALL handle redirect properly on mobile browsers
5. WHEN mobile user views dashboard THEN the System SHALL stack components vertically for readability
6. WHEN mobile user views charts THEN the System SHALL render charts with touch-friendly interactions
