# Dashboard Enhancements

## Overview

The dashboard has been significantly enhanced to display real IPNFT data from localStorage and provide better organization with multiple tabs.

## Key Features

### 1. Real Data Integration

The dashboard now fetches and displays actual IPNFTs minted by the connected user:

- **Data Source**: localStorage tracking system (`lib/ipnft-tracker.ts`)
- **Wallet Integration**: Uses `useWalletAddress()` hook to identify the user
- **Automatic Updates**: Refreshes when wallet address changes

### 2. Enhanced Tab Structure

The dashboard now has 5 main tabs instead of 3:

#### Overview Tab
- **Stats Cards**: Total IPNFTs, Total Forks, Average Royalty, Total Earnings
- **Profile & Socials**: Link/unlink X (Twitter), Spotify, TikTok accounts
- **Recent IPNFTs**: Shows the 3 most recently minted IPNFTs

#### My IPNFTs Tab
- **Detailed IPNFT Cards**: Each card shows:
  - Thumbnail or file type icon
  - Name and description
  - Token ID, University, Department, Year
  - Royalty percentage
  - Mint timestamp
  - File information (name, size)
  - Link to view on IPFS
- **Mint Button**: Quick access to mint new IPNFTs

#### Activity Tab
- **Activity Feed**: Shows all minting activities
- **Timeline View**: Activities sorted by most recent first
- **Activity Types**: Minted, Forked, Shared, Validated (with icons)
- **Load More**: Pagination for viewing older activities

#### Analytics Tab
- **Statistics Overview**: Total IPNFTs, Total Forks, Average Royalty
- **University Distribution**: Bar chart showing IPNFTs by institution
- **Minting Timeline**: Bar chart showing IPNFTs minted over time
- **Visual Insights**: Helps users understand their research portfolio

#### Settings Tab
- **Storage Information**: Shows localStorage usage statistics
- **Data Export**: Download all IPNFT data as JSON for backup
- **Migration Notes**: Guidance for production deployment options

### 3. Improved User Experience

#### Loading States
- Shows spinner while fetching data
- Graceful handling of empty states

#### Wallet Connection
- Prompts users to connect wallet if not authenticated
- Shows appropriate messages based on connection status

#### Responsive Design
- Mobile-friendly tab layout
- Adaptive grid layouts for different screen sizes

#### Visual Enhancements
- Color-coded activity types
- Progress bars for analytics
- Hover effects on cards
- Consistent spacing and typography

### 4. Data Display

#### IPNFT Cards
Each IPNFT is displayed with comprehensive information:

```typescript
- Token ID (unique identifier)
- Name and description
- University and department
- Year of publication
- Royalty percentage
- Mint timestamp (relative time)
- File information (name, type, size)
- Thumbnail or file type icon
- Link to IPFS content
```

#### Statistics
Real-time calculations based on user's IPNFTs:

```typescript
- Total IPNFTs minted
- Total forks across all IPNFTs
- Average royalty percentage
- Distribution by university
- Minting timeline by month
```

## Technical Implementation

### Components

1. **DashboardClient** (`components/dashboard/dashboard-client.tsx`)
   - Main dashboard container
   - Manages tab state
   - Fetches user's IPNFTs from localStorage
   - Converts TrackedIPNFT to thesis format

2. **ProfileAndSocials**
   - Social account linking/unlinking
   - Uses Origin SDK's social features
   - Visual status indicators

3. **ActivityFeed**
   - Displays user activities
   - Converts IPNFTs to activity items
   - Pagination support

4. **IPNFTCard**
   - Detailed IPNFT display
   - File type detection
   - Metadata extraction

5. **AnalyticsView**
   - Statistical calculations
   - Data visualization
   - Distribution charts

6. **SettingsView**
   - Storage management
   - Data export functionality
   - Migration guidance

### Data Flow

```
User connects wallet
    ↓
useWalletAddress() extracts address from JWT
    ↓
getIPNFTsByOwner(address) fetches from localStorage
    ↓
IPNFTs displayed in dashboard tabs
    ↓
User can view, analyze, and export data
```

### Storage System

The dashboard relies on the localStorage tracking system:

- **Location**: `lib/ipnft-tracker.ts`
- **Storage Key**: `thesischain_ipnfts`
- **Max Capacity**: 1000 IPNFTs
- **Data Structure**: Array of TrackedIPNFT objects

## Usage

### For Users

1. **Connect Wallet**: Sign in with Origin SDK
2. **View Dashboard**: Navigate to `/dashboard`
3. **Explore Tabs**: Switch between Overview, IPNFTs, Activity, Analytics, Settings
4. **Link Socials**: Connect social accounts in Overview tab
5. **Export Data**: Download backup from Settings tab

### For Developers

```typescript
// Get user's IPNFTs
import { getIPNFTsByOwner } from '@/lib/ipnft-tracker'
import { useWalletAddress } from '@/lib/wallet'

const walletAddress = useWalletAddress()
const ipnfts = getIPNFTsByOwner(walletAddress)

// Convert to thesis format
const theses = ipnfts.map(ipnft => ({
  id: ipnft.tokenId,
  title: ipnft.name,
  university: getAttributeValue(ipnft, "University"),
  // ... other fields
}))
```

## Future Enhancements

### Short Term
- [ ] Real earnings calculation from blockchain events
- [ ] Fork tracking and display
- [ ] Share functionality integration
- [ ] Validation status tracking

### Medium Term
- [ ] Backend database integration
- [ ] The Graph subgraph for blockchain data
- [ ] Real-time updates via WebSocket
- [ ] Advanced analytics (citations, impact factor)

### Long Term
- [ ] AI-powered research recommendations
- [ ] Collaboration features
- [ ] Peer review system
- [ ] Research marketplace

## Migration Notes

For production deployment, consider migrating from localStorage to:

1. **Backend Database**
   - PostgreSQL for relational data
   - MongoDB for flexible schema
   - Redis for caching

2. **Blockchain Indexer**
   - The Graph protocol subgraph
   - Camp Network's indexer API
   - Custom event listener service

3. **IPFS Pinning**
   - Pinata for reliable pinning
   - Web3.Storage for decentralized storage
   - Filecoin for long-term archival

## Testing

To test the enhanced dashboard:

1. **Mint an IPNFT**: Go to `/mint` and create a test IPNFT
2. **View Dashboard**: Navigate to `/dashboard`
3. **Check All Tabs**: Verify data appears in all 5 tabs
4. **Test Export**: Download data from Settings tab
5. **Link Socials**: Test social account linking

## Troubleshooting

### No IPNFTs Showing
- Ensure wallet is connected
- Check localStorage for `thesischain_ipnfts` key
- Verify IPNFT was successfully minted and tracked

### Data Not Updating
- Refresh the page
- Check browser console for errors
- Verify wallet address matches IPNFT owner

### Export Not Working
- Check browser's download settings
- Ensure localStorage has data
- Try a different browser

## Related Documentation

- [Origin SDK Integration](./ORIGIN_SDK_INTEGRATION.md)
- [IPNFT Tracking System](./REAL_DATA_INTEGRATION.md)
- [Wallet Integration](../lib/wallet.ts)
- [Testing Guide](../TESTING_GUIDE.md)
