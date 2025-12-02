# MongoDB Operations Update

## Summary
Converted RxDB-based operations to use MongoDB via API routes.

## Files Updated

### 1. `lib/db/ipnft-operations.ts`
- Removed RxDB imports and "use client" directive
- Converted all database operations to use REST API calls
- Functions now use fetch() to interact with MongoDB via API routes:
  - `trackMintedIPNFT()` - Creates thesis, activity, and updates profile
  - `trackForkEvent()` - Increments fork count and creates activity
  - `trackEarningsEvent()` - Records earnings and updates profile
  - `updateUserSocials()` - Updates user social links
  - `exportAllData()` - Exports all data via API
  - `getDatabaseStats()` - Gets collection counts via API

### 2. `lib/db/migration.ts`
- Removed RxDB imports and "use client" directive
- Renamed `migrateIPNFTsToRxDB()` to `migrateIPNFTsToMongoDB()`
- Updated all functions to use API routes instead of direct database access:
  - `syncUserToLeaderboard()` - Syncs user stats to leaderboard
  - `rebuildLeaderboard()` - Rebuilds entire leaderboard from MongoDB
  - `needsMigration()` - Checks if migration is needed
  - `autoMigrate()` - Auto-migrates on first load

### 3. `lib/db/types.ts`
- Removed RxDB-specific imports (RxDocument, RxCollection)
- Kept core document type interfaces:
  - `ThesisDocType`
  - `UserProfileDocType`
  - `ActivityDocType`
- Removed RxDB-specific type aliases

### 4. `lib/db/leaderboard.ts` (NEW - Replaces yjs-leaderboard.ts)
- MongoDB-based leaderboard replacing Yjs/IndexedDB
- Functions:
  - `updateLeaderboardEntry()` - Updates user's leaderboard entry
  - `getLeaderboardEntries()` - Gets all entries sorted by earnings
  - `getUserLeaderboardEntry()` - Gets specific user's entry
  - `subscribeToLeaderboard()` - Polling-based subscription to leaderboard changes
  - `subscribeToUserEntry()` - Polling-based subscription to user entry changes
  - `clearLeaderboard()` - Clears all leaderboard data

### 5. `app/api/activities/route.ts` (NEW)
- Created new API route for activities collection
- Supports GET (with filtering) and POST operations
- Follows same pattern as theses and profiles routes

### 6. `app/api/leaderboard/route.ts` (NEW)
- Created new API route for leaderboard collection
- Supports GET, PATCH, and DELETE operations
- Automatically sorts by earnings, IPNFTs, and forks

## API Routes Used

All operations now go through these API endpoints:

- `GET/POST/PATCH /api/theses` - Thesis operations
- `GET/POST/PATCH /api/profiles` - Profile operations
- `GET/POST /api/activities` - Activity operations
- `GET/PATCH/DELETE /api/leaderboard` - Leaderboard operations

## Benefits

1. **Server-side database access** - MongoDB operations happen on the server
2. **Consistent API** - All database operations use the same REST API pattern
3. **Better security** - Database credentials stay on server
4. **Easier scaling** - Can add caching, rate limiting, etc. at API level
5. **Type safety** - TypeScript types maintained throughout

## Migration Path

Existing localStorage data can still be migrated using:
```typescript
import { migrateIPNFTsToMongoDB, rebuildLeaderboard } from '@/lib/db/migration'

await migrateIPNFTsToMongoDB()
await rebuildLeaderboard()
```

## Notes

- Replaced Yjs/IndexedDB leaderboard with MongoDB-based solution
- Leaderboard updates use polling (default 5 seconds) instead of real-time CRDT
- All operations are now async and use fetch()
- Error handling maintained throughout
- Console logging preserved for debugging

## Migration from Yjs Leaderboard

The old `lib/db/yjs-leaderboard.ts` file can be removed. Update any imports:

```typescript
// Old
import { updateLeaderboardEntry } from './yjs-leaderboard'

// New
import { updateLeaderboardEntry } from './leaderboard'
```

Key differences:
- `updateLeaderboardEntry()` is now async (returns Promise)
- Subscriptions use polling instead of real-time observers
- Data persists in MongoDB instead of IndexedDB
- No need to initialize or destroy leaderboard instance
