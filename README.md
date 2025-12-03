# ThesisChain Africa

> On-Chain Final-Year Project & Research Registry with Built-In Royalties & Collaborative Improvement

[![Mint your project here]](https://thesischainafrica.vercel.app/)

#### Core Problem It Solves
- 80%+ of final-year projects in African universities end up as PDF files on dusty shelves or Google Drive folders — zero visibility, zero reuse, zero credit to the student.
- Lecturers and juniors constantly “reinvent the wheel” because there’s no discoverable index of past work.
- Plagiarism and idea theft is rampant; students have no way to prove original authorship.
- Talented students from less-known universities never get discovered by employers or diaspora investors.

#### How ThesisChain Solves It Using Camp Network + Origin SDK

| Feature | Implementation on Camp Network | Why It Wins Judges’ Hearts |
| --- | --- | --- |
| **Mint Your Thesis as Verifiable IP** | Student uploads PDF + code + short demo video → auto-minted as Origin-protected composable IP (metadata includes university, matric number, supervisor signature, graduation year) | Instant proof of originality & timestamp |
| **Fractional Ownership + Improvement Forks** | Anyone (junior student, researcher, startup) can “fork & improve” the project by attaching new code/files → new version becomes a derivative IP that automatically pays 5–15% royalty to original author on every future use/download | Encourages collaboration instead of copying |
| **Earn From Indexing & Citations** | Every time someone downloads, cites, or builds on your project → micro-payment in USDC/STRK (e.g. $0.10–$1) + loyalty points. Top 100 most-cited projects each semester get bonus grants from prize pool. | Passive income for students even after graduation |
| **University Validation Layer** | Supervisors sign the mint transaction with their wallet (one-time university wallet setup) → only validated projects appear in “Official” gallery | Stops fake uploads, builds trust |
| **Discoverability & Talent Scout Dashboard** | Fully on-chain searchable index (title, tags, department, impact score). Companies pay to access “Top Talent” filtered list (e.g. “Best 50 Computer Science projects in Nigeria 2025”) → revenue shared with students | Solves graduate unemployment |
| **AI Agent Integration (Future Features)** | Camp Network AI agents can read the IP metadata and suggest improvements or auto-remix open-source code parts → agent creator also pays royalty split | Shows real use of Camp’s AI + IP vision |

#### Revenue & Loyalty Model (Students Actually Earn)
| Action | Earnings for Original Author |
| --- | --- |
| Someone downloads full project | $0.20–$1 (set by author) |
| Someone forks & improves | 10% lifetime royalty on the fork’s future earnings |
| Project ranks in monthly Top 20 | $100–$500 bonus from community treasury |
| Corporate sponsor views your contact | $2–$5 (opt-in) |


[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Camp Network](https://img.shields.io/badge/Camp%20Network-Basecamp-green)](https://www.campnetwork.xyz/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌍 Overview

ThesisChain Africa is a revolutionary platform that transforms academic research into valuable digital assets. Researchers can mint their theses as IP-NFTs (Intellectual Property Non-Fungible Tokens), earn royalties from their work, and collaborate with peers across the continent.

### Key Features

- **🎓 IP-NFT Minting**: Convert research papers into blockchain-verified digital assets
- **💰 Royalty System**: Earn passive income from thesis usage and citations
- **🔄 Fork & Collaborate**: Build upon existing research with proper attribution
- **🔍 Global Discovery**: Search and explore research from universities across Africa
- **📊 Analytics Dashboard**: Track your research impact and earnings
- **🌐 Offline-First**: Works seamlessly with or without internet connection
- **🔐 Decentralized Storage**: IPFS-based storage ensures permanent accessibility

## 🚀 What's Working

### ✅ Core Platform Features

#### 1. **IP-NFT Minting System**
- Full thesis upload and metadata management
- IPFS storage integration via Origin SDK
- Origin SDK integration for blockchain minting
- Automatic royalty configuration (1-100%)
- File validation and processing (TXT, PDF support)
- Real-time minting progress tracking

#### 2. **Database & Storage**
- MongoDB Atlas integration for production data
- Comprehensive data models (Theses, Profiles, Activities)
- Indexed queries for fast search and retrieval
- Real-time activity tracking
- User profile management with social links
- Statistics and analytics aggregation

#### 3. **User Dashboard**
- Overview tab with key metrics
- My IPNFTs tab showing all minted theses
- Activity feed with real-time updates
- Analytics with charts and insights
- Settings for profile management
- Data export functionality

#### 4. **Search & Discovery**
- Global thesis search across all users
- Filter by university, department, year
- Full-text search capabilities
- Thesis detail pages with complete metadata
- Author information and wallet addresses
- Fork tracking and parent-child relationships

#### 5. **Smart Contracts** (Deployed on Basecamp Testnet)
- **ThesisRegistry** (`0x3B672951E3bF67b0A73E8716eC269bbAEe220550`)
  - Central registry for all thesis IPNFTs
  - Metadata management and validation
  - Author tracking and verification
  
- **RoyaltySplitter** (`0xee4744b079226cCCA53a22685a2252B56cE855C5`)
  - Automatic royalty distribution
  - USDC payment integration
  - Multi-recipient support for collaborations
  
- **ForkTracker** (`0xA44fB44A1ed8119816AdBAf859f3675dfB186B84`)
  - Parent-child relationship tracking
  - Fork depth calculation
  - Derivative work management
  
- **UniversityValidator** (`0xB0999963147a7C1e1D6E74E3fdecC8eEfC628c35`)
  - Role-based thesis validation
  - University verification system
  - Access control management

#### 6. **Web3 Integration**
- Camp Network Origin SDK integration 
- MetaMask and WalletConnect support
- Transaction signing and verification
- Gas estimation and optimization

#### 7. **UI/UX**
- Modern, responsive design with Tailwind CSS
- Dark mode with African-inspired color palette
- shadcn/ui component library
- Loading states and error handling
- Toast notifications for user feedback
- Confetti celebrations for successful mints

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Blockchain
- **Network**: Camp Network Basecamp Testnet
- **Chain ID**: 123420001114
- **SDK**: @campnetwork/origin v1.2.4 
- **Smart Contracts**: Solidity 0.8.24

### Database & Storage
- **Database**: MongoDB Atlas 
- **Caching**: React Query

### Development Tools
- **Smart Contracts**: Hardhat + Foundry
- **Testing**: Vitest + Fast-check (property-based)
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and pnpm 
- Camp Network Client ID ([Register here](https://www.campnetwork.xyz/)) 
- MongoDB Atlas account ([Sign up here](https://www.mongodb.com/cloud/atlas))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/thesischain-africa.git
   cd thesischain-africa
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   # Required for Web3 
   NEXT_PUBLIC_CAMP_CLIENT_ID=your_camp_client_id
      
   # Required for database
   MONGODB_URI=your_mongodb_connection_string
   
   # Optional
   NEXT_PUBLIC_X_BEARER_TOKEN=your_twitter_bearer_token
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting Testnet Funds

Visit the Camp Network faucet to get testnet ETH:
- **Faucet**: [https://faucet.campnetwork.xyz](https://faucet.campnetwork.xyz)
- **Explorer**: [https://explorer.basecamp-testnet.camp.network](https://explorer.basecamp-testnet.camp.network)

## 📁 Project Structure

```
thesischain-africa/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── mint/                    # Minting wizard
│   ├── dashboard/               # User dashboard
│   ├── search/                  # Global search
│   ├── thesis/[id]/            # Thesis detail pages
│   └── api/                     # API routes
│       ├── theses/             # Thesis CRUD operations
│       ├── profiles/           # User profiles
│       ├── activities/         # Activity tracking
│       └── stats/              # Analytics
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── mint-steps/             # Minting wizard steps
│   ├── dashboard/              # Dashboard components
│   ├── thesis/                 # Thesis viewer components
│   ├── navbar.tsx              # Navigation
│   └── web3-provider.tsx       # Web3 setup
├── contracts/                    # Solidity smart contracts
│   ├── ThesisRegistry.sol
│   ├── RoyaltySplitter.sol
│   ├── ForkTracker.sol
│   └── UniversityValidator.sol
├── lib/                          # Utility libraries
│   ├── camp.ts                  # Origin SDK integration
│   ├── mongodb.ts               # Database connection
│   ├── ipnft-methods.ts        # IPNFT utilities
│   └── contracts.ts             # Contract addresses
├── scripts/                      # Deployment scripts
│   ├── deploy.js               # Hardhat deployment
│   └── update-config.js        # Config generator
├── test/                         # Smart contract tests
└── docs/                         # Documentation
```

## 🎯 Usage Guide

### Minting a Thesis

1. **Connect your wallet** using the navbar
2. **Navigate to /mint** or click "Mint Thesis"
3. **Upload your thesis** (TXT or PDF format)
4. **Fill in metadata**:
   - Title
   - Abstract
   - Author name
   - University
   - Department
   - Year
5. **Set royalty percentage** (1-100%)
6. **Review and confirm**
7. **Sign the transaction** in your wallet
8. **Wait for confirmation** (usually 10-30 seconds)
9. **Celebrate!** 🎉 Your thesis is now an IP-NFT

### Viewing Your Theses

1. **Go to Dashboard** (`/dashboard`)
2. **Click "My IPNFTs" tab**
3. **Browse your minted theses**
4. **Click any thesis** to view details
5. **Share the link** with others

### Searching for Research

1. **Navigate to Search** (`/search`)
2. **Use the search bar** to find theses
3. **Filter by**:
   - University
   - Department
   - Year
   - Keywords
4. **Click any result** to view full details

### Forking a Thesis

1. **Find a thesis** you want to build upon
2. **Click "Fork This Thesis"**
3. **Upload your derivative work**
4. **Add your contributions**
5. **Mint as a new IP-NFT**
6. **Original author** automatically receives royalties

## 🔧 Smart Contract Deployment

### Using Foundry (Recommended)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build contracts
forge build

# Deploy to Basecamp testnet
./deploy-foundry.sh
```

### Using Hardhat

```bash
# Deploy contracts
pnpm run deploy

# Verify on Blockscout
pnpm run verify

# Update frontend config
pnpm run update-config
```

See [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) for detailed instructions.

## 🧪 Testing

### Frontend Tests
```bash
pnpm test
```

### Smart Contract Tests
```bash
# Hardhat tests (73 passing)
npx hardhat test

# Foundry tests
forge test -vvv
```

### Property-Based Testing
```bash
pnpm test:watch
```

## 📊 Database Schema

### Theses Collection
```typescript
{
  tokenId: string          // Unique IPNFT token ID
  owner: string            // Wallet address
  author: string           // Full name
  authorWallet: string     // Author's wallet
  name: string             // Thesis title
  description: string      // Abstract
  university: string       // University name
  department: string       // Department
  year: number             // Publication year
  fileName: string         // Original filename
  fileType: string         // MIME type
  fileSize: number         // Size in bytes
  royaltyBps: number       // Royalty (basis points)
  imageUrl: string         // Cover image
  ipfsHash: string         // IPFS CID
  forks: number            // Fork count
  parentTokenId?: string   // Parent thesis (if fork)
  mintedAt: number         // Unix timestamp
  mintedTimestamp: string  // ISO timestamp
  isDeleted: boolean       // Soft delete flag
}
```

### Profiles Collection
```typescript
{
  address: string          // Wallet address (primary key)
  displayName: string      // User's display name
  bio: string              // Biography
  university: string       // Affiliated university
  socials: {
    twitter?: string
    spotify?: string
    tiktok?: string
  }
  totalEarnings: number    // Total royalties earned
  totalIPNFTs: number      // Number of minted theses
  totalForks: number       // Number of forks created
  updatedAt: number        // Last update timestamp
}
```

### Activities Collection
```typescript
{
  id: string               // Unique activity ID
  type: string             // 'minted' | 'forked' | 'shared' | 'earned'
  userAddress: string      // User's wallet
  tokenId: string          // Related thesis
  thesisName: string       // Thesis title
  amount?: number          // Amount (for earnings)
  timestamp: number        // Unix timestamp
  transactionHash?: string // Blockchain tx hash
}
```

## 🚧 Ongoing Improvements

### In Progress

- [ ] **Enhanced Search**: Full-text search with Elasticsearch
- [ ] **Collaboration Tools**: Multi-author thesis support
- [ ] **Citation Tracking**: Automatic citation detection and rewards
- [ ] **Peer Review System**: Decentralized peer review with reputation
- [ ] **Mobile App**: React Native mobile application

### Planned Features

#### Short Term (1-2 months)
- [ ] **PDF Viewer**: In-browser PDF rendering
- [ ] **Comments & Discussions**: Thesis discussion threads
- [ ] **Notifications**: Real-time activity notifications
- [ ] **Email Integration**: Email alerts for important events
- [ ] **Advanced Analytics**: More detailed statistics and charts

#### Medium Term (3-6 months)
- [ ] **DAO Governance**: Community-driven platform decisions
- [ ] **Grant System**: Funding for promising research
- [ ] **Reputation System**: Researcher credibility scores
- [ ] **Cross-Chain Support**: Bridge to other blockchains
- [ ] **AI Integration**: AI-powered research recommendations

#### Long Term (6-12 months)
- [ ] **Mainnet Launch**: Deploy to Camp Network mainnet
- [ ] **Token Launch**: Platform governance token
- [ ] **University Partnerships**: Official university integrations
- [ ] **Research Marketplace**: Buy/sell research access
- [ ] **Conference Integration**: Link to academic conferences

### Known Issues

1. **PDF Upload**: Currently only TXT files fully supported
   - **Workaround**: Convert PDF to TXT before upload
   - **Fix**: PDF parsing library integration in progress

2. **Large File Uploads**: Files >10MB may timeout
   - **Workaround**: Compress files before upload
   - **Fix**: Chunked upload implementation planned

3. **Mobile Responsiveness**: Some dashboard charts not optimized for mobile
   - **Workaround**: Use desktop for analytics
   - **Fix**: Mobile-first redesign in progress

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Share your ideas in GitHub Discussions
3. **Submit PRs**: Fix bugs or implement new features
4. **Improve Docs**: Help us improve documentation
5. **Test**: Try the platform and provide feedback

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `pnpm lint` before committing
- Write meaningful commit messages
- Add tests for new features

## 📚 Documentation

- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md) - System architecture overview
- [Deployment Guide](./DEPLOYMENT_SUMMARY.md) - Smart contract deployment
- [Database Guide](./MONGODB_MIGRATION_COMPLETE.md) - Database setup and migration
- [IPNFT Guide](./IPNFT_IMPLEMENTATION_COMPLETE.md) - IPNFT implementation details
- [Testing Guide](./TESTING_GUIDE.md) - Testing strategies and examples

## 🔐 Security

### Best Practices

- Never commit `.env` files
- Keep private keys secure
- Audit smart contracts before mainnet
- Use hardware wallets for production
- Enable 2FA on all accounts

### Reporting Vulnerabilities

If you discover a security vulnerability, please email security@thesischain.africa instead of opening a public issue.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Camp Network** for blockchain infrastructure
- **Origin Protocol** for IP-NFT technology
- **MongoDB** for database services
- **NFT.Storage** for IPFS storage
- **Vercel** for hosting
- **African Research Community** for inspiration and feedback

## 📞 Support & Community

- **Website**: [thesischain.africa](https://thesischain.africa)
- **Twitter**: [@ThesisChainAfrica](https://twitter.com/ThesisChainAfrica)
- **Discord**: [Join our community](https://discord.gg/thesischain)
- **Email**: support@thesischain.africa

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ for African researchers and developers**

*Empowering the next generation of African research through blockchain technology*
