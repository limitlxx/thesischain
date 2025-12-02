Here’s the **real-world, battle-tested** way to sync data across multiple devices/browsers in 2025, even when the app is offline, using **browser databases only** (no backend required for most use cases).

### The Best Solution in 2025: **IndexedDB + RxDB + CRDTs (or Yjs)**

| Tool | What it does | Why it wins |
|------|--------------|-----------|
| **RxDB** (with IndexedDB storage) | Full-featured reactive database that runs 100% in the browser | Offline-first, real-time sync, replication, schema, queries |
| **Yjs** + **y-indexeddb** | CRDT-based collaborative editing engine | Perfect for shared documents, leaderboards, chat |
| **PouchDB** | Still works, but dying (no updates since 2023) | Not recommended anymore |

### Recommended Stack (Used by Figma, Notion, Linear, etc.)

```bash
npm install rxdb rxjs idb yjs y-indexeddb
```

### Option 1 – RxDB + CouchDB-style Sync (Best for ThesisChain)

Perfect for your use case: theses, forks, royalties, profiles — all need to sync across devices.

```ts
// db.ts – runs once at app start
import { createRxDatabase, addRxPlugin } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { replicateRxCollection } from 'rxdb/plugins/replication'

// Only in dev
if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)

const db = await createRxDatabase({
  name: 'thesischaindb',
  storage: getRxStorageDexie(), // uses IndexedDB under the hood
  multiInstance: true,          // important: allows sync between tabs
  eventReduce: true
})

const thesisSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    author: { type: 'string' },
    university: { type: 'string' },
    tokenId: { type: 'string' },
    royaltyBps: { type: 'integer' },
    updatedAt: { type: 'string' }, // ISO timestamp
    deleted: { type: 'boolean' }
  },
  required: ['id', 'title', 'updatedAt']
}

await db.addCollections({
  theses: { schema: thesisSchema }
})

// Sync with a remote CouchDB or your own server (or use peer-to-peer!)
await replicateRxCollection({
  collection: db.theses,
  replicationIdentifier: 'thesis-sync',
  live: true,
  pull: {},
  push: {}
  // Add remote URL later: url: 'https://sync.thesischain.africa/db'
})
```

Now any device that opens your app will:
- Work 100% offline
- Save data to IndexedDB instantly
- Sync with every other device automatically when online
- Resolve conflicts using last-write-wins (or custom logic)

### Option 2 – Yjs (Best for Real-Time Leaderboard / Shared Editing)

If you want **live leaderboards** where earnings update in real-time across all users:

```ts
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

const ydoc = new Y.Doc()
const leaderboard = ydoc.getMap('leaderboard')

// Persist across tabs & devices
const provider = new IndexeddbPersistence('thesis-leaderboard', ydoc)

// Auto-sync between browser tabs
provider.whenSynced.then(() => {
  console.log('Leaderboard synced across all your devices!')
})

// Example: update earnings
leaderboard.set('0x123...abc', {
  address: '0x123...abc',
  earnings: '42.5',
  university: 'UNILAG',
  rank: 1
})

// This change instantly appears on every open tab/device
leaderboard.observe(() => {
  console.log('Live leaderboard updated!')
  renderLeaderboard()
})
```

### Option 3 – Hybrid (What I recommend for ThesisChain)

Use **RxDB for theses/forks/royalties** + **Yjs for leaderboard & live activity feed**

```ts
// Sync normal data (offline-first)
useEffect(() => {
  db.theses.find().$.subscribe(theses => setMyTheses(theses))
}, [])

// Live leaderboard (real-time)
useEffect(() => {
  const observer = () => {
    const entries = Array.from(leaderboard.entries())
      .map(([addr, data]) => data)
      .sort((a, b) => b.earnings - a.earnings)
    setLiveLeaderboard(entries)
  }
  leaderboard.observe(observer)
  return () => leaderboard.unobserve(observer)
}, [])
```

### Bonus: Sync Across Different Users (P2P (No Server!)

Use **WebRTC** or **Libp2p** with RxDB/Yjs:

```bash
npm install @libp2p/webrtc y-webrtc
```

```ts
import { WebrtcProvider } from 'y-webrtc'

const provider = new WebrtcProvider('thesis-chain-room', ydoc)
// Now any user in the same "room" sees live changes — no server!
```

### Summary: What You Should Do Right Now

| Goal | Tool | One-liner |
|------|------|---------|
| Offline support + sync when back online | **RxDB** | Best for structured data (theses, royalties) |
| Live leaderboard, real-time earnings | **Yjs + y-indexeddb** | Instant sync across all devices |
| Collaborative editing (future) | **Yjs + y-webrtc** | Figma-style real-time |
| No backend needed | All browser | All of the above | 100% possible |
