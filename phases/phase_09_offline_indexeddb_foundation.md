# Phase 09 — Offline IndexedDB Foundation

## Goal

Set up the complete client-side offline storage layer using Dexie.js. This phase creates the IndexedDB schema, local TypeScript interfaces, metadata helpers, device ID generation, local guest repository, and local guest search. No server sync yet — just the local-first foundation.

## Why This Phase Matters

The offline check-in system is WedPass's core differentiator. This phase builds the offline engine that every staff check-in feature depends on. Getting the Dexie schema, indexes, and local service patterns right here prevents architectural problems in all offline phases.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Sections 5–14, 46)
- `docs/database_schema.md` (Part 2 — Client Database: IndexedDB)

## Dependencies

- Phase 01 complete (project shell)

## Scope

All offline logic lives under `src/lib/offline/`.

### Database Setup

- `src/lib/offline/db.ts` — Dexie database class and store definitions
- Database name: `wedpass_offline_db`
- Stores: `guests`, `checkinQueue`, `metadata`, `mediaQueue`

### TypeScript Interfaces

- `LocalGuest`
- `LocalCheckinQueueItem`
- `LocalMetadata`
- `LocalMediaUpload`

### Metadata Helpers

- `src/lib/offline/metadata.ts`:
  - `getMetadata(key)` — reads from metadata store
  - `setMetadata(key, value)` — writes to metadata store
  - `clearMetadata()` — clears all metadata

### Device ID

- `src/lib/offline/metadata.ts` or separate `device.ts`:
  - `getOrCreateDeviceId()` — reads or generates `crypto.randomUUID()`, persists to metadata store

### Local Guest Repository

- `src/lib/offline/guests/guest-local-repository.ts`:
  - `findGuestByQrToken(weddingId, qrToken)`
  - `findGuestById(guestId)`
  - `searchGuests(weddingId, searchTerm)` — searches fullName and phoneNumber, returns up to 20 results
  - `bulkSaveGuests(guests)` — used for snapshot download
  - `clearGuestsByWedding(weddingId)` — used before snapshot refresh
  - `updateGuestCheckedIn(guestId, checkedIn, checkedInAt)` — used after sync

### Local Guest Search

- `src/lib/offline/guests/guest-search.ts`:
  - Fast local search targeting <200ms for 1,000 guests
  - Search by fullName (case-insensitive prefix)
  - Search by phoneNumber (prefix)
  - Returns `LocalGuest[]`

### Network Status Hook

- `src/hooks/use-network-status.ts`:
  - Listens to `window.online`/`window.offline` events
  - Returns `{ isOnline: boolean }`

## Explicitly Out of Scope

- Server sync (Phase 15–16)
- Snapshot download (Phase 12)
- Check-in transaction (Phase 14A)
- Media queue (Phase 22)
- Staff UI (Phase 13–14)

## Implementation Tasks

1. Install Dexie:
   ```bash
   npm install dexie
   ```
2. Create `src/lib/offline/db.ts`:
   ```ts
   import Dexie, { Table } from "dexie";

   export class WedPassOfflineDB extends Dexie {
     guests!: Table<LocalGuest, string>;
     checkinQueue!: Table<LocalCheckinQueueItem, string>;
     metadata!: Table<LocalMetadata, string>;
     mediaQueue!: Table<LocalMediaUpload, string>;

     constructor() {
       super("wedpass_offline_db");
       this.version(1).stores({
         guests: "guestId, weddingId, snapshotId, qrToken, fullName, phoneNumber, checkedIn",
         checkinQueue: "queueId, weddingId, guestId, synced, createdAt",
         metadata: "key",
         mediaQueue: "uploadId, weddingId, weddingSlug, uploadStatus, createdAt",
       });
     }
   }
   export const offlineDb = new WedPassOfflineDB();
   ```
3. Create all TypeScript interfaces as defined in `docs/database_schema.md` Sections 19–22.
4. Create `src/lib/offline/metadata.ts` with `getMetadata`, `setMetadata`, `clearMetadata`, `getOrCreateDeviceId`.
5. Create `src/lib/offline/guests/guest-local-repository.ts` with all methods listed above.
6. Create `src/lib/offline/guests/guest-search.ts` with `searchGuests` — test with 1,000 mock entries to confirm <200ms.
7. Create `src/hooks/use-network-status.ts`.
8. Write unit tests using Vitest:
   - Test `searchGuests` returns filtered results
   - Test `getOrCreateDeviceId` returns the same ID on second call
   - Test `setMetadata` and `getMetadata` round-trip

## Dexie Note

IndexedDB is only available in browser environment. Dexie calls should not happen during SSR (Next.js server render). Wrap usage in `typeof window !== "undefined"` checks or use `"use client"` components.

## Files and Folders Likely to Be Created or Modified

- `src/lib/offline/db.ts`
- `src/lib/offline/metadata.ts`
- `src/lib/offline/guests/guest-local-repository.ts`
- `src/lib/offline/guests/guest-search.ts`
- `src/hooks/use-network-status.ts`
- `src/types/shared.ts` (add offline interfaces)

## Testing Requirements

Install Vitest:
```bash
npm install -D vitest @vitest/ui jsdom
```

Unit tests:
- `searchGuests` returns correct filtered results
- `searchGuests` is case-insensitive
- `getOrCreateDeviceId` persists the ID between calls
- `setMetadata` and `getMetadata` work correctly
- `clearGuestsByWedding` removes all guests for that wedding

Run tests: `npm run test`

## Manual QA Checklist

- [ ] No SSR errors (Dexie only runs client-side)
- [ ] `offlineDb` initializes without console errors in browser
- [ ] `getOrCreateDeviceId()` returns the same UUID on repeated calls
- [ ] `searchGuests()` returns filtered results in browser console test
- [ ] All TypeScript interfaces compile without errors

## Acceptance Criteria

- [ ] Dexie database initializes with all 4 stores
- [ ] All TypeScript interfaces match `database_schema.md`
- [ ] Local guest search works and is fast
- [ ] Device ID persists across refreshes
- [ ] Unit tests pass
- [ ] No SSR errors

## Git Commit Recommendation

```
feat: add offline indexeddb foundation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 09 to Completed Phases
- Set Current Phase to Phase 10
- Record unit test results
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 09: Offline IndexedDB Foundation.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Sections 5–14 and Section 46 — Implementation Boundaries)
- docs/database_schema.md (Part 2 — Client Database: IndexedDB, Sections 16–23)

Your task is to build the offline storage foundation. This is a critical WedPass feature — offline check-in depends entirely on this layer.

1. Install dexie.
2. Create src/lib/offline/db.ts with WedPassOfflineDB class:
   - Stores: guests, checkinQueue, metadata, mediaQueue
   - All indexes per docs/database_schema.md Section 23

3. Define all TypeScript interfaces in src/types/shared.ts or in src/lib/offline/db.ts:
   - LocalGuest, LocalCheckinQueueItem, LocalMetadata, LocalMediaUpload
   (Use exact interface definitions from docs/database_schema.md Sections 19–22)

4. Create src/lib/offline/metadata.ts:
   - getMetadata(key: string): Promise<string | undefined>
   - setMetadata(key: string, value: string): Promise<void>
   - clearMetadata(): Promise<void>
   - getOrCreateDeviceId(): Promise<string> — generates crypto.randomUUID() on first call, persists

5. Create src/lib/offline/guests/guest-local-repository.ts:
   - findGuestByQrToken(weddingId, qrToken)
   - findGuestById(guestId)
   - searchGuests(weddingId, searchTerm) — searches fullName and phoneNumber
   - bulkSaveGuests(guests)
   - clearGuestsByWedding(weddingId)
   - updateGuestCheckedIn(guestId, checkedIn, checkedInAt)

6. Create src/lib/offline/guests/guest-search.ts with searchGuests that handles:
   - Case-insensitive prefix matching on fullName
   - Prefix matching on phoneNumber
   - Returns up to 20 results
   - Must complete in <200ms for 1,000 guests

7. Create src/hooks/use-network-status.ts — listens to window online/offline events.

8. Install vitest and write unit tests for:
   - searchGuests filtering
   - getOrCreateDeviceId persistence
   - metadata set/get round-trip

IMPORTANT:
- All Dexie/IndexedDB code is browser-only. Never import offlineDb at module level in server components.
- Do not scatter Dexie calls outside src/lib/offline/
- Do not build UI or API routes in this phase

After completing:
- Run npm run test — all unit tests must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 09 completed, Current Phase → Phase 10.

Commit with:
git commit -m "feat: add offline indexeddb foundation"

Report: stores created, interfaces defined, search performance noted.
```
