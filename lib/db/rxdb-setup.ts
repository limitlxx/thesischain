"use client"

/**
 * RxDB Setup for ThesisChain
 * Offline-first database for theses, IPNFTs, and user data
 */

import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

// Only in development
if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin)
}

/**
 * Thesis/IPNFT Schema
 */
const thesisSchema = {
  version: 0,
  primaryKey: 'tokenId',
  type: 'object',
  properties: {
    tokenId: { type: 'string', maxLength: 100 },
    owner: { type: 'string', maxLength: 42 },
    author: { type: 'string', maxLength: 200 },
    authorWallet: { type: 'string', maxLength: 42 },
    name: { type: 'string', maxLength: 500 },
    description: { type: 'string', maxLength: 5000 },
    university: { type: 'string', maxLength: 200 },
    department: { type: 'string', maxLength: 200 },
    year: { type: 'integer', multipleOf: 1 },
    royaltyBps: { type: 'integer', multipleOf: 1 },
    imageUrl: { type: 'string', maxLength: 500 },
    ipfsHash: { type: 'string', maxLength: 200 },
    fileName: { type: 'string', maxLength: 200 },
    fileType: { type: 'string', maxLength: 100 },
    fileSize: { type: 'integer', multipleOf: 1 },
    forks: { type: 'integer', default: 0, multipleOf: 1 },
    parentTokenId: { type: 'string', maxLength: 100 },
    mintedAt: { type: 'number', multipleOf: 1, minimum: 0, maximum: 9999999999999 },
    mintedTimestamp: { type: 'string', maxLength: 50 },
    updatedAt: { type: 'number', multipleOf: 1, minimum: 0, maximum: 9999999999999 },
    isDeleted: { type: 'boolean', default: false }
  },
  required: ['tokenId', 'owner', 'name', 'mintedAt', 'updatedAt'],
  indexes: ['owner', 'mintedAt', 'authorWallet']
}

/**
 * User Profile Schema
 */
const userProfileSchema = {
  version: 0,
  primaryKey: 'address',
  type: 'object',
  properties: {
    address: { type: 'string', maxLength: 42 },
    displayName: { type: 'string', maxLength: 200 },
    bio: { type: 'string', maxLength: 1000 },
    university: { type: 'string', maxLength: 200 },
    socials: {
      type: 'object',
      properties: {
        twitter: { type: 'string', maxLength: 100 },
        spotify: { type: 'string', maxLength: 100 },
        tiktok: { type: 'string', maxLength: 100 }
      }
    },
    totalEarnings: { type: 'number', default: 0, multipleOf: 0.000001 },
    totalIPNFTs: { type: 'integer', default: 0, multipleOf: 1 },
    totalForks: { type: 'integer', default: 0, multipleOf: 1 },
    updatedAt: { type: 'number', multipleOf: 1, minimum: 0, maximum: 9999999999999 }
  },
  required: ['address', 'updatedAt']
}

/**
 * Activity/Event Schema
 */
const activitySchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    type: { type: 'string', maxLength: 20, enum: ['minted', 'forked', 'shared', 'validated', 'earned'] },
    userAddress: { type: 'string', maxLength: 42 },
    tokenId: { type: 'string', maxLength: 100 },
    thesisName: { type: 'string', maxLength: 500 },
    amount: { type: 'string', maxLength: 50 },
    timestamp: { type: 'number', multipleOf: 1, minimum: 0, maximum: 9999999999999 },
    transactionHash: { type: 'string', maxLength: 66 }
  },
  required: ['id', 'type', 'userAddress', 'timestamp'],
  indexes: ['userAddress', 'timestamp', 'type']
}

/**
 * Database Collections Type
 */
export type ThesisCollection = RxCollection<typeof thesisSchema>
export type UserProfileCollection = RxCollection<typeof userProfileSchema>
export type ActivityCollection = RxCollection<typeof activitySchema>

export type ThesisChainDatabase = RxDatabase<{
  theses: ThesisCollection
  profiles: UserProfileCollection
  activities: ActivityCollection
}>

let dbPromise: Promise<ThesisChainDatabase> | null = null

/**
 * Initialize RxDB Database
 * Singleton pattern - only creates once
 */
export async function initDatabase(): Promise<ThesisChainDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = (async () => {
    console.log('🗄️ Initializing RxDB...')

    // Create database
    const db = await createRxDatabase<ThesisChainDatabase>({
      name: 'thesischaindb',
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie()
      }),
      multiInstance: true, // Allow multiple tabs
      eventReduce: true,
      cleanupPolicy: {
        minimumDeletedTime: 1000 * 60 * 60 * 24 * 7, // Keep deleted docs for 7 days
        minimumCollectionAge: 1000 * 60, // Wait 1 minute before cleanup
        runEach: 1000 * 60 * 5, // Run cleanup every 5 minutes
        awaitReplicationsInSync: true,
        waitForLeadership: true
      }
    })

    // Add collections
    await db.addCollections({
      theses: {
        schema: thesisSchema
      },
      profiles: {
        schema: userProfileSchema
      },
      activities: {
        schema: activitySchema
      }
    })

    console.log('✅ RxDB initialized successfully')

    return db as ThesisChainDatabase
  })()

  return dbPromise
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<ThesisChainDatabase> {
  return initDatabase()
}

/**
 * Close database (cleanup)
 */
export async function closeDatabase() {
  if (dbPromise) {
    const db = await dbPromise
    await db.close()
    dbPromise = null
    console.log('🗄️ RxDB closed')
  }
}
