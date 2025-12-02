# ThesisChain IPNFT Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
├─────────────────────────────────────────────────────────────────┤
│  Mint Page  │  Dashboard  │  Search Page  │  Thesis Details     │
│  /mint      │  /dashboard │  /search      │  /thesis/[id]       │
└──────┬──────┴──────┬──────┴──────┬─────────┴──────┬─────────────┘
       │             │              │                 │
       │             │              │                 │
       ▼             ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Hooks Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  useMintThesis()  │  useUserIPNFTs()  │  useAllIPNFTs()        │
│  (lib/camp.ts)    │  (lib/db/hooks.ts)│  (lib/db/hooks.ts)     │
└──────┬────────────┴──────┬────────────┴──────┬──────────────────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Management Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   Origin SDK         │      │   RxDB Database      │        │
│  │   (Blockchain)       │      │   (Local Storage)    │        │
│  ├──────────────────────┤      ├──────────────────────┤        │
│  │ • mintFile()         │◄────►│ • trackMintedIPNFT() │        │
│  │ • getTerms()         │      │ • useAllIPNFTs()     │        │
│  │ • ownerOf()          │      │ • useUserIPNFTs()    │        │
│  │ • tokenURI()         │      │ • useSearchIPNFTs()  │        │
│  └──────────────────────┘      └──────────────────────┘        │
│           │                              │                       │
│           │                              │                       │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────┐
│  Camp Network       │      │  Browser IndexedDB       │
│  Blockchain         │      │  (Offline Storage)       │
│  (Testnet)          │      │                          │
│  • Smart Contracts  │      │  Collections:            │
│  • IPFS Storage     │      │  • theses                │
│  • Token Registry   │      │  • profiles              │
└─────────────────────┘      │  • activities            │
                             └──────────────────────────┘
```

## Data Flow: Minting Process

```
User Fills Form
    │
    ├─ Title
    ├─ Abstract
    ├─ Author Name ◄── NEW
    ├─ University
    ├─ Department
    ├─ Year
    └─ File (TXT)
    │
    ▼
Prepare Metadata
    │
    ├─ name: "Thesis Title"
    ├─ description: "Abstract"
    ├─ attributes: [
    │    { trait_type: "Author", value: "John Doe" } ◄── NEW
    │    { trait_type: "University", value: "UNILAG" }
    │    { trait_type: "Department", value: "CS" }
    │    { trait_type: "Year", value: "2024" }
    │  ]
    │
    ▼
Origin SDK mintFile()
    │
    ├─ Upload to IPFS
    ├─ Mint NFT on blockchain
    ├─ Set royalty terms
    └─ Return tokenId
    │
    ▼
trackMintedIPNFT()
    │
    ├─ Extract metadata
    ├─ Store in RxDB:
    │    • tokenId
    │    • owner (wallet address)
    │    • author (full name) ◄── NEW
    │    • authorWallet ◄── NEW
    │    • name
    │    • description
    │    • university
    │    • department
    │    • year
    │    • fileName ◄── NEW
    │    • fileType ◄── NEW
    │    • fileSize ◄── NEW
    │    • mintedAt (timestamp) ◄── NEW
    │    • mintedTimestamp (ISO) ◄── NEW
    │    • royaltyBps
    │    • imageUrl
    │    • ipfsHash
    │
    ▼
RxDB Reactive Update
    │
    ├─ Notify all subscribers
    ├─ Update Dashboard (if user's IPNFT)
    ├─ Update Search Page (global)
    └─ Update Thesis Details (if viewing)
    │
    ▼
All Users See New IPNFT ◄── GLOBAL SYNC
```

## Data Flow: Viewing Process

```
User Navigates to Thesis Details
    │
    ▼
Check RxDB First (Fast Path)
    │
    ├─ Query: db.theses.findOne(tokenId)
    │
    ├─ Found? ──► YES ──► Load from Database
    │                      │
    │                      ├─ Display author ◄── NEW
    │                      ├─ Display file info ◄── NEW
    │                      ├─ Display timestamp ◄── NEW
    │                      └─ Badge: "From Database"
    │
    └─ Found? ──► NO ──► Fallback to Blockchain
                          │
                          ├─ Origin SDK fetchIPNFT()
                          ├─ Query blockchain
                          ├─ Fetch IPFS metadata
                          └─ Badge: "Live from Blockchain"
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                     RxDB Collections                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  theses (IPNFT Data)                         │          │
│  ├──────────────────────────────────────────────┤          │
│  │  • tokenId (primary key)                     │          │
│  │  • owner (wallet address)                    │          │
│  │  • author (full name) ◄── NEW                │          │
│  │  • authorWallet (wallet) ◄── NEW             │          │
│  │  • name (title)                              │          │
│  │  • description (abstract)                    │          │
│  │  • university                                │          │
│  │  • department                                │          │
│  │  • year                                      │          │
│  │  • fileName ◄── NEW                          │          │
│  │  • fileType ◄── NEW                          │          │
│  │  • fileSize ◄── NEW                          │          │
│  │  • royaltyBps                                │          │
│  │  • imageUrl                                  │          │
│  │  • ipfsHash                                  │          │
│  │  • forks                                     │          │
│  │  • parentTokenId                             │          │
│  │  • mintedAt (unix timestamp) ◄── NEW        │          │
│  │  • mintedTimestamp (ISO) ◄── NEW            │          │
│  │  • updatedAt                                 │          │
│  │  • isDeleted                                 │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  profiles (User Data)                        │          │
│  ├──────────────────────────────────────────────┤          │
│  │  • address (primary key)                     │          │
│  │  • displayName                               │          │
│  │  • bio                                       │          │
│  │  • university                                │          │
│  │  • socials (twitter, spotify, tiktok)       │          │
│  │  • totalEarnings                             │          │
│  │  • totalIPNFTs                               │          │
│  │  • totalForks                                │          │
│  │  • updatedAt                                 │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  activities (Activity Feed)                  │          │
│  ├──────────────────────────────────────────────┤          │
│  │  • id (primary key)                          │          │
│  │  • type (minted, forked, shared, etc)       │          │
│  │  • userAddress                               │          │
│  │  • tokenId                                   │          │
│  │  • thesisName                                │          │
│  │  • amount                                    │          │
│  │  • timestamp                                 │          │
│  │  • transactionHash                           │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
│
├── /mint
│   └── MintWizard
│       ├── StepOne (File Upload)
│       ├── StepTwo (Metadata + Author) ◄── NEW
│       ├── StepThree (Royalties)
│       └── StepFour (Review)
│
├── /dashboard
│   └── DashboardClient
│       ├── useUserIPNFTs() ◄── Uses RxDB
│       ├── Overview Tab
│       ├── My IPNFTs Tab
│       │   └── IPNFTCard (shows author) ◄── NEW
│       ├── Activity Tab
│       ├── Analytics Tab
│       └── Settings Tab
│
├── /search
│   └── SearchPage
│       ├── useAllIPNFTs() ◄── Global Sync
│       └── ThesisSearchCard
│           └── Shows ALL users' IPNFTs ◄── NEW
│
└── /thesis/[id]
    └── ThesisViewerOrigin
        ├── Checks RxDB first ◄── NEW
        ├── Falls back to blockchain
        ├── Shows author ◄── NEW
        ├── Shows file info ◄── NEW
        └── Shows timestamp ◄── NEW
```

## Key Features

### 🔄 Real-Time Sync
- RxDB subscriptions notify all components
- No polling needed
- Instant updates across tabs

### 🌍 Global Discovery
- All users see all IPNFTs
- Search across entire database
- Filter by university, department, year

### 💾 Offline Support
- IndexedDB stores data locally
- Works without internet
- Syncs when back online

### ⚡ Performance
- Database queries: < 100ms
- Blockchain queries: 2-5s
- Hybrid approach: Best of both

### 📊 Rich Metadata
- Author name and wallet
- File information
- Timestamps
- University data
- Royalty terms

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Database**: RxDB (IndexedDB)
- **Blockchain**: Camp Network (Origin SDK)
- **Storage**: IPFS (via Origin SDK)
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: React Hooks, RxDB Subscriptions
