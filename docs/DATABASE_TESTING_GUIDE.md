# Database Testing Guide

Complete guide for testing and verifying RxDB database operations in ThesisChain.

## Quick Start

### 1. Clear the Old Database (IMPORTANT!)

The schema was fixed, so you need to clear the old database first:

**Option A: Using the UI**
1. Visit http://localhost:3000/db-test
2. Click "Clear Local Database"
3. Confirm and wait for page reload

**Option B: Using Browser Console**
```javascript
indexedDB.deleteDatabase('thesischaindb')
location.reload()
```

### 2. Run Diagnostic Check

Visit http://localhost:3000/db-diagnostic to see:
- Current database status
- All theses in database
- Your theses (if wallet connected)
- User profiles
- Recent activities

### 3. Run Comprehensive Tests

Visit http://localhost:3000/db-test-comprehensive to run:
- Database connection test
- Schema validation
- Insert/query/update operations
- Fork tracking
- Earnings tracking
- Profile creation
- Activity logging

## Test Pages

### `/db-diagnostic` - Database Diagnostic Dashboard
**Purpose:** View all data in your local database

**Features:**
- Real-time database stats
- View all theses
- View your theses (wallet-specific)
- View all profiles
- View recent activities
- Refresh and clear database buttons

**When to use:**
- Check if data is being saved
- Debug missing data issues
- Verify wallet-specific data
- Monitor database growth

### `/db-test-comprehensive` - Comprehensive Test Suite
**Purpose:** Run automated tests to verify all database operations

**Tests included:**
1. **Database Connection** - Verify RxDB initializes
2. **Schema Validation** - Check all collections exist
3. **Insert Thesis** - Test creating new thesis
4. **Query Thesis** - Test retrieving thesis
5. **Update Thesis** - Test modifying thesis
6. **Track Fork Event** - Test fork tracking
7. **Track Earnings** - Test earnings logging
8. **User Profile Creation** - Test profile auto-creation
9. **Activity Logging** - Test activity tracking
10. **Database Stats** - Test stats calculation

**When to use:**
- After clearing database
- After schema changes
- Before deploying
- When debugging issues

### `/db-test` - Simple Database Test
**Purpose:** Quick check of database contents

**Features:**
- List all theses
- Refresh button
- Clear database button

**When to use:**
- Quick sanity check
- After minting a thesis
- Simple debugging

## Testing Workflow

### After Clearing Database

1. **Clear the database** (see Quick Start #1)
2. **Run diagnostic** to verify it's empty
3. **Mint a thesis** via `/mint`
4. **Check diagnostic** again to see if it saved
5. **Run comprehensive tests** to verify all operations

### After Minting a Thesis

1. **Check console logs** for:
   ```
   ✅ IPNFT successfully tracked in RxDB database
   ```
2. **Visit `/db-diagnostic`** to see the thesis
3. **Visit `/dashboard`** to see it in your dashboard
4. **Visit `/thesis/[tokenId]`** to view the thesis page

### Debugging Missing Data

If data isn't showing in dashboard:

1. **Check wallet connection**
   - Dashboard shows "Connect wallet" if not connected
   - Wallet address must match thesis owner

2. **Check database**
   - Visit `/db-diagnostic`
   - Look for "All Theses" section
   - Check if your thesis is there

3. **Check owner address**
   - Thesis owner must match your wallet address
   - Addresses are case-insensitive (stored lowercase)

4. **Check console logs**
   - Look for errors during minting
   - Check for "Failed to track IPNFT" messages

5. **Clear and retry**
   - Clear database
   - Mint a new thesis
   - Watch console logs

## Common Issues

### Issue: "No theses in database"

**Cause:** Database was never populated or was cleared

**Solution:**
1. Mint a new thesis
2. Check console for tracking errors
3. Run comprehensive tests

### Issue: "Thesis not showing in dashboard"

**Cause:** Wallet address mismatch or database not queried correctly

**Solution:**
1. Check wallet is connected
2. Visit `/db-diagnostic` to see all theses
3. Verify thesis owner matches your wallet
4. Check console for query errors

### Issue: "RxError SC35: multipleOf attribute"

**Cause:** Old schema without multipleOf

**Solution:**
1. Clear database (this is required!)
2. Refresh page
3. Database will reinitialize with new schema

### Issue: "Database connection failed"

**Cause:** Browser doesn't support IndexedDB or storage is full

**Solution:**
1. Check browser console for errors
2. Try different browser
3. Clear browser storage
4. Check available disk space

## Database Schema

### Theses Collection
```typescript
{
  tokenId: string (primary key)
  owner: string (indexed)
  name: string
  description: string
  university: string (indexed)
  department: string
  year: integer
  royaltyBps: integer
  imageUrl: string
  ipfsHash: string
  fileType: string
  fileSize: integer
  forks: integer
  parentTokenId: string
  mintedAt: number (indexed)
  updatedAt: number
  isDeleted: boolean
}
```

### Profiles Collection
```typescript
{
  address: string (primary key)
  displayName: string
  bio: string
  university: string
  socials: object
  totalEarnings: number
  totalIPNFTs: integer
  totalForks: integer
  updatedAt: number
}
```

### Activities Collection
```typescript
{
  id: string (primary key)
  type: 'minted' | 'forked' | 'shared' | 'validated' | 'earned'
  userAddress: string (indexed)
  tokenId: string
  thesisName: string
  amount: string
  timestamp: number (indexed)
  transactionHash: string
}
```

## Manual Testing Checklist

- [ ] Clear old database
- [ ] Run diagnostic - verify empty
- [ ] Run comprehensive tests - all pass
- [ ] Mint a thesis
- [ ] Check console logs - no errors
- [ ] Visit diagnostic - thesis appears
- [ ] Visit dashboard - thesis appears
- [ ] Visit thesis page - loads correctly
- [ ] Fork a thesis
- [ ] Check diagnostic - fork count updated
- [ ] Check dashboard - fork count updated
- [ ] Disconnect wallet
- [ ] Dashboard shows "connect wallet"
- [ ] Reconnect wallet
- [ ] Dashboard shows theses again

## Automated Testing

Run the comprehensive test suite:

```bash
# Visit in browser
http://localhost:3000/db-test-comprehensive

# Click "Run All Tests"
# Wait for all tests to complete
# Verify all tests pass (green checkmarks)
```

Expected results:
- ✅ All 10 tests pass
- ✅ Database stats show data
- ✅ Test data preview shows created records

## Console Commands

Useful commands for browser console:

```javascript
// Check if database exists
indexedDB.databases().then(console.log)

// Delete database
indexedDB.deleteDatabase('thesischaindb')

// Reload page
location.reload()

// Check localStorage fallback
console.log(localStorage.getItem('thesischain_ipnfts'))
```

## Monitoring

### What to Watch

1. **Console Logs**
   - "✅ IPNFT successfully tracked in RxDB database"
   - "✓ Tracked IPNFT [tokenId] in RxDB"
   - Any error messages

2. **Database Stats**
   - Theses count increases after minting
   - Profiles count increases for new users
   - Activities count increases with actions

3. **Dashboard**
   - "Total IPNFTs" card shows correct count
   - Theses appear in "My IPNFTs" tab
   - Activities appear in "Activity" tab

### Performance Metrics

- Database initialization: < 1 second
- Insert thesis: < 100ms
- Query thesis: < 50ms
- Update thesis: < 50ms
- Query all user theses: < 200ms

## Troubleshooting Commands

```javascript
// Get database instance
const db = await import('./lib/db/rxdb-setup').then(m => m.getDatabase())

// Count theses
const count = await db.theses.count().exec()
console.log('Theses count:', count)

// Get all theses
const theses = await db.theses.find().exec()
console.log('All theses:', theses.map(t => t.toJSON()))

// Get user's theses
const userTheses = await db.theses.find({
  selector: { owner: '0x...' }
}).exec()
console.log('User theses:', userTheses.map(t => t.toJSON()))

// Get stats
const { getDatabaseStats } = await import('./lib/db/ipnft-operations')
const stats = await getDatabaseStats()
console.log('Stats:', stats)
```

## Next Steps

After verifying database works:

1. **Test in production**
   - Deploy to staging
   - Run tests on staging
   - Monitor for errors

2. **Add more tests**
   - Test edge cases
   - Test concurrent operations
   - Test large datasets

3. **Monitor performance**
   - Track query times
   - Monitor database size
   - Check memory usage

4. **Implement sync**
   - Add blockchain sync
   - Implement conflict resolution
   - Add data migration

## Resources

- [RxDB Documentation](https://rxdb.info/)
- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Database Schema Fix](./RXDB_SCHEMA_FIX_COMPLETE.md)
- [Database Integration Status](./DATABASE_INTEGRATION_STATUS.md)
