/**
 * TypeScript types for MongoDB collections
 */

// Thesis/IPNFT Document Type
export interface ThesisDocType {
  tokenId: string
  owner: string
  author: string
  authorWallet: string
  name: string
  description: string
  university: string
  department: string
  year: number
  royaltyBps: number
  imageUrl: string
  ipfsHash: string
  fileName: string
  fileType: string
  fileSize: number
  forks: number
  parentTokenId: string
  mintedAt: number
  mintedTimestamp: string
  updatedAt: number
  isDeleted: boolean
}

// User Profile Document Type
export interface UserProfileDocType {
  address: string
  displayName: string
  bio: string
  university: string
  socials: {
    twitter?: string
    spotify?: string
    tiktok?: string
  }
  totalEarnings: number
  totalIPNFTs: number
  totalForks: number
  updatedAt: number
}

// Activity Document Type
export interface ActivityDocType {
  id: string
  type: 'minted' | 'forked' | 'shared' | 'validated' | 'earned'
  userAddress: string
  tokenId: string
  thesisName: string
  amount: string
  timestamp: number
  transactionHash: string
}
